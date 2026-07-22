import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = ['src', 'scripts', 'firebase.json', 'firestore.rules', 'package.json', '.env', '.env.local'];

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.expo') continue;
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function scanFile(filePath) {
  try {
    const text = readFileSync(filePath, 'utf8');
    const findings = [];

    const hasHardcodedSecret = /AIza[0-9A-Za-z\-_]{10,}/.test(text) || /(?:apiKey|appId|clientSecret|secret)\s*:\s*["'][^"']{8,}["']/.test(text);

    if (hasHardcodedSecret && !text.includes('process.env')) {
      findings.push({
        severity: 'high',
        finding: 'Possible API key or credential-like value detected.',
        recommendation: 'Move secrets and client identifiers to environment configuration and review exposure scope.'
      });
    }

    if (text.includes('console.log') && !filePath.endsWith('security-audit.mjs')) {
      findings.push({
        severity: 'medium',
        finding: 'Console logging present; consider removing sensitive data from logs.',
        recommendation: 'Remove or gate logs in production and avoid printing user or token data.'
      });
    }

    const hasLiteralFirebaseConfig = text.includes('firebaseConfig') && /(?:apiKey|appId|messagingSenderId|storageBucket|projectId)\s*:\s*["'][^"']{1,}["']/.test(text);

    if (hasLiteralFirebaseConfig && !text.includes('process.env')) {
      findings.push({
        severity: 'medium',
        finding: 'Firebase client config is present in source; verify that sensitive values are not exposed beyond intended use.',
        recommendation: 'Keep client-side config minimal and validate what is safe to ship to the frontend.'
      });
    }

    if (filePath.endsWith('firestore.rules') && (text.includes('allow read, write: if true') || text.includes('allow read, write: if request.auth == null'))) {
      findings.push({
        severity: 'high',
        finding: 'Firestore rules appear overly permissive.',
        recommendation: 'Restrict access to authenticated users and the minimum required document scope.'
      });
    }

    return findings;
  } catch {
    return [];
  }
}

const results = [];

for (const target of targets) {
  const fullPath = path.join(root, target);
  if (!existsSync(fullPath)) continue;
  const stat = statSync(fullPath);
  if (stat.isDirectory()) {
    for (const file of walk(fullPath)) {
      results.push(...scanFile(file).map((finding) => ({ file: path.relative(root, file), ...finding })));
    }
  } else {
    results.push(...scanFile(fullPath).map((finding) => ({ file: target, ...finding })));
  }
}

const highSeverity = results.filter((item) => item.severity === 'high').length;
const mediumSeverity = results.filter((item) => item.severity === 'medium').length;

console.log('Security audit report for Ataraxia');
console.log('===============================');
console.log(`High severity issues: ${highSeverity}`);
console.log(`Medium severity issues: ${mediumSeverity}`);
console.log(`Total findings: ${results.length}`);
if (results.length === 0) {
  console.log('No obvious security issues detected by the quick audit.');
} else {
  console.log('\nFindings:');
  for (const entry of results) {
    console.log(`- [${entry.severity}] ${entry.file}: ${entry.finding}`);
    console.log(`  Recommendation: ${entry.recommendation}`);
  }
}
