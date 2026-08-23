import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { SafeStorage } from '@/utils/safeStorage';

export default function ArchonThroneScreen() {
  const [viewMode, setViewMode] = useState<'female' | 'male'>('female');
  
  // 1. Estado de Decretos
  const [decreeText, setDecreeText] = useState<string>('');
  const [activeDecree, setActiveDecree] = useState<string>(
    SafeStorage.getItem('ataraxia_active_decree') || 'Mantener la compostura estoica y cumplir los 4 pilares con honor militar.'
  );
  const [decreeDate, setDecreeDate] = useState<string>(
    SafeStorage.getItem('ataraxia_decree_date') || new Date().toLocaleDateString('es-ES')
  );

  // 2. Estado de Reto Global
  const [globalChallenge, setGlobalChallenge] = useState<string>(
    SafeStorage.getItem('ataraxia_global_challenge') || 'Ducha de Agua Fría (60s) • Amor Fati'
  );

  // 3. Estado de Seguridad Centinela-1
  const [scanStatus, setScanStatus] = useState<string>('🟢 SISTEMA BLINDADO');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const handlePublishDecree = () => {
    if (!decreeText.trim()) {
      alert('Arconte: Escribe el texto del decreto antes de publicar.');
      return;
    }
    const today = new Date().toLocaleDateString('es-ES');
    setActiveDecree(decreeText);
    setDecreeDate(today);
    SafeStorage.setItem('ataraxia_active_decree', decreeText);
    SafeStorage.setItem('ataraxia_decree_date', today);
    setDecreeText('');
    alert('🏛️ DECRETO EMITIDO: Sincronizado en todos los dispositivos de la legión.');
  };

  const handleSetChallenge = (challenge: string) => {
    setGlobalChallenge(challenge);
    SafeStorage.setItem('ataraxia_global_challenge', challenge);
  };

  const handleRunSecurityScan = () => {
    setIsScanning(true);
    setScanStatus('⏳ ESCANEANDO PROTOCOLOS DE SEGURIDAD...');
    setTimeout(() => {
      setIsScanning(false);
      setScanStatus('🟢 AUDITORÍA COMPLETADA: 0 Brechas • Zero-Leakage Óptimo');
    }, 1500);
  };

  return (
    <PearlElectricBackground glowColor={viewMode === 'female' ? 'rgba(251, 113, 133, 0.35)' : 'rgba(212, 175, 55, 0.35)'}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* CABECERA DEL TRONO */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <ThemedText style={styles.goldBadge}>👑 CONSOLA SUPREMA DE GOBERNANZA</ThemedText>
            </View>
            <ThemedText style={styles.title}>TRONO DEL ARCONTE</ThemedText>
            <ThemedText style={styles.subtitle}>Soberanía absoluta, control del templo y mando de la legión</ThemedText>
          </View>

          {/* 1. VISOR PANÓPTICO: SIMULADOR DE INTERFAZ DE RECLUTAS */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <ThemedText style={styles.cardTitle}>👁️ VISOR PANÓPTICO: SIMULADOR EN VIVO</ThemedText>
              <ThemedText style={[styles.statusBadge, { color: viewMode === 'female' ? '#FB7185' : '#D4AF37' }]}>
                {viewMode === 'female' ? '🦉 VISTA FEMENINA' : '⚔️ VISTA MASCULINA'}
              </ThemedText>
            </View>
            <ThemedText style={styles.cardDesc}>Toca un botón para auditar la experiencia de cada legión:</ThemedText>
            
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'female' && styles.toggleBtnActiveFemale]}
                activeOpacity={0.8}
                onPress={() => setViewMode('female')}
              >
                <ThemedText style={[styles.toggleBtnText, viewMode === 'female' && styles.toggleBtnTextActive]}>
                  🦉 Reclutas Mujeres (Atenea / Artemisa)
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, viewMode === 'male' && styles.toggleBtnActiveMale]}
                activeOpacity={0.8}
                onPress={() => setViewMode('male')}
              >
                <ThemedText style={[styles.toggleBtnText, viewMode === 'male' && styles.toggleBtnTextActive]}>
                  ⚔️ Reclutas Hombres (Esparta / Leónidas)
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* CAJA DE PREVISUALIZACIÓN DINÁMICA */}
            <View style={[styles.previewBox, { borderColor: viewMode === 'female' ? 'rgba(251, 113, 133, 0.4)' : 'rgba(212, 175, 55, 0.4)' }]}>
              <ThemedText style={styles.previewHeader}>
                {viewMode === 'female' ? '🏛️ TEMPLO DE ATENEA & ARTEMISA' : '🏛️ TEMPLO DEL AUTODOMINIO'}
              </ThemedText>
              <ThemedText style={styles.previewSub}>
                {viewMode === 'female'
                  ? '👑 Saludo: "GUERRERA • HIJA DE ATENEA"'
                  : '⚔️ Saludo: "GUERRERO • LEÓN DE ESPARTA"'}
              </ThemedText>
              <ThemedText style={styles.previewSenda}>
                {viewMode === 'female'
                  ? '🎯 Senda Activa: Artemisa (Hip Thrust 4x10 • RDL • Vacío Abdominal)'
                  : '🎯 Senda Activa: Espartano (Sentadilla Profunda • Press Militar • Dominadas)'}
              </ThemedText>
              <ThemedText style={styles.previewQuote}>
                {viewMode === 'female'
                  ? '"Las mujeres de Esparta gobernamos porque forjamos el carácter de leones." — Gorgo'
                  : '"No expliques tu filosofía; encárnala en tus actos." — Epicteto'}
              </ThemedText>
            </View>
          </View>

          {/* 2. CENSO GLOBAL & TELEMETRÍA */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>📊 CENSO GLOBAL & TELEMETRÍA DE LA LEGIÓN</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <ThemedText style={styles.statNum}>1,248</ThemedText>
                <ThemedText style={styles.statLabel}>Guerreros Activos</ThemedText>
              </View>
              <View style={styles.statBox}>
                <ThemedText style={styles.statNum}>89.4%</ThemedText>
                <ThemedText style={styles.statLabel}>Pactos Cumplidos (A+)</ThemedText>
              </View>
              <View style={styles.statBox}>
                <ThemedText style={styles.statNum}>3.4M</ThemedText>
                <ThemedText style={styles.statLabel}>Kcal Quemadas</ThemedText>
              </View>
            </View>
          </View>

          {/* 3. CENTRO DE EMISIÓN DE DECRETOS */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>📜 EMISOR DE DECRETOS GLOBALES</ThemedText>
            
            <View style={styles.activeDecreeBox}>
              <ThemedText style={styles.activeDecreeTitle}>🟢 DECRETO VIGENTE EN LA LEGIÓN ({decreeDate}):</ThemedText>
              <ThemedText style={styles.activeDecreeText}>"{activeDecree}"</ThemedText>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Escribe aquí un nuevo decreto para todos los reclutas..."
              placeholderTextColor="#64748B"
              value={decreeText}
              onChangeText={setDecreeText}
              multiline
            />

            <TouchableOpacity style={styles.publishBtn} activeOpacity={0.8} onPress={handlePublishDecree}>
              <LinearGradient colors={['#D4AF37', '#F59E0B', '#B45309']} style={styles.publishBtnGradient}>
                <ThemedText style={styles.publishBtnText}>🚀 EMITIR Y DIFUNDIR A LA LEGIÓN</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 4. GESTOR DEL DESAFÍO GLOBAL DE TEMPLE */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>⚡ DESAFÍO GLOBAL DE LA SEMANA</ThemedText>
            <ThemedText style={styles.challengeCurrentText}>Reto Activo: <ThemedText style={{ color: '#FDE68A', fontWeight: 'bold' }}>{globalChallenge}</ThemedText></ThemedText>
            
            <ThemedText style={styles.subPrompt}>Selecciona un reto para fijarlo a todos los usuarios:</ThemedText>
            
            <View style={styles.challengeList}>
              {[
                '🚿 Ducha de Agua Fría (60s) • Amor Fati',
                '📵 Desconexión Digital 30 min antes de dormir',
                '🍬 Cero Azúcar Añadido ni Ultraprocesados',
                '⏳ Ayuno Intermitente Matutino (16h+)',
                '🧘‍♂️ Caminata Consciente de 15 min en Silencio'
              ].map((ch, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.challengeItemBtn, globalChallenge === ch && styles.challengeItemActive]}
                  onPress={() => handleSetChallenge(ch)}
                >
                  <ThemedText style={[styles.challengeItemText, globalChallenge === ch && styles.challengeItemTextActive]}>
                    {globalChallenge === ch ? `✓ ${ch}` : ch}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 5. AUDITORÍA CENTINELA-1 */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <ThemedText style={styles.cardTitle}>🛡️ AUDITORÍA CENTINELA-1</ThemedText>
              <ThemedText style={{ fontSize: 10, color: '#10B981', fontFamily: 'monospace', fontWeight: 'bold' }}>
                {scanStatus}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={styles.scanBtn}
              activeOpacity={0.8}
              onPress={handleRunSecurityScan}
              disabled={isScanning}
            >
              <ThemedText style={styles.scanBtnText}>
                {isScanning ? '⏳ EJECUTANDO ANÁLISIS...' : '🛡️ EJECUTAR DIAGNÓSTICO DE SEGURIDAD'}
              </ThemedText>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </PearlElectricBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 18, gap: 16, maxWidth: 640, alignSelf: 'center', width: '100%', paddingBottom: 50 },
  header: { alignItems: 'center', gap: 4, marginBottom: 4 },
  badgeRow: { backgroundColor: 'rgba(212, 175, 55, 0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.4)' },
  goldBadge: { fontSize: 10.5, fontFamily: 'monospace', fontWeight: 'bold', color: '#D4AF37', letterSpacing: 2 },
  title: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  subtitle: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  card: { backgroundColor: 'rgba(14, 20, 36, 0.95)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.35)', gap: 10, shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 11.5, fontFamily: 'monospace', fontWeight: 'bold', color: '#D4AF37', letterSpacing: 1 },
  statusBadge: { fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' },
  cardDesc: { fontSize: 11.5, color: '#94A3B8' },
  toggleRow: { flexDirection: 'column', gap: 8 },
  toggleBtn: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(15, 23, 42, 0.8)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)', alignItems: 'center' },
  toggleBtnActiveFemale: { borderColor: '#FB7185', backgroundColor: 'rgba(251, 113, 133, 0.18)' },
  toggleBtnActiveMale: { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.18)' },
  toggleBtnText: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8' },
  toggleBtnTextActive: { color: '#FFFFFF' },
  previewBox: { backgroundColor: 'rgba(10, 14, 26, 0.9)', borderRadius: 12, padding: 12, borderWidth: 1, gap: 4 },
  previewHeader: { fontSize: 13, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  previewSub: { fontSize: 11.5, color: '#FDE68A', fontWeight: 'bold' },
  previewSenda: { fontSize: 11, color: '#CBD5E1' },
  previewQuote: { fontSize: 11, fontStyle: 'italic', color: '#94A3B8', marginTop: 4 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  statBox: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.15)' },
  statNum: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', fontFamily: 'monospace' },
  statLabel: { fontSize: 9, color: '#94A3B8', marginTop: 2, textAlign: 'center' },
  activeDecreeBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', gap: 2 },
  activeDecreeTitle: { fontSize: 9.5, fontFamily: 'monospace', fontWeight: 'bold', color: '#34D399' },
  activeDecreeText: { fontSize: 11.5, color: '#E2E8F0', fontStyle: 'italic' },
  textInput: { backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: 12, minHeight: 60, textAlignVertical: 'top' },
  publishBtn: { borderRadius: 14, overflow: 'hidden' },
  publishBtnGradient: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  publishBtnText: { fontSize: 12, fontWeight: '900', color: '#05070D', letterSpacing: 1 },
  challengeCurrentText: { fontSize: 12, color: '#94A3B8' },
  subPrompt: { fontSize: 11, color: '#64748B' },
  challengeList: { gap: 6 },
  challengeItemBtn: { padding: 10, borderRadius: 10, backgroundColor: 'rgba(15, 23, 42, 0.8)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)' },
  challengeItemActive: { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.15)' },
  challengeItemText: { fontSize: 11.5, color: '#94A3B8' },
  challengeItemTextActive: { color: '#FDE68A', fontWeight: 'bold' },
  scanBtn: { padding: 10, borderRadius: 10, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.4)', alignItems: 'center' },
  scanBtnText: { fontSize: 11, fontWeight: 'bold', color: '#6EE7B7', fontFamily: 'monospace' },
});
