import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, RadialGradient, G, Polygon } from 'react-native-svg';
import { ThemedText } from './themed-text';

export interface GlowArcGaugeProps {
  strengthProgress?: number; // 0.0 to 1.0
  virtueProgress?: number;   // 0.0 to 1.0
  overallProgress?: number;  // 0.0 to 1.0
  size?: number;
  steps?: number;
  stepGoal?: number;
  km?: number;
  calories?: number;               // Kcal Quemadas Activas (Daily Power Burn)
  targetCalories?: number;         // Meta de Kcal Quemadas
  consumedCalories?: number;       // Kcal Ingeridas
  targetConsumedCalories?: number; // Meta Nutricional
  waterLitres?: number;
  trainingCompleted?: boolean;
  streakDays?: number;
}

export const GlowArcGauge = React.memo(function GlowArcGauge({
  strengthProgress = 0.82,
  virtueProgress = 0.80,
  size = 320,
  calories = 2450,
  targetCalories = 2800,
  consumedCalories = 1850,
  targetConsumedCalories = 2200,
  steps = 10000,
  trainingCompleted = true,
}: GlowArcGaugeProps) {
  const [activeMetric, setActiveMetric] = useState<'burn' | 'nutrition' | 'power'>('burn');

  // Animaciones Eléctricas de Alta Tensión optimizadas por Hardware
  const boltPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulso suave de Plasma con aceleración nativa
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(boltPulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(boltPulseAnim, { toValue: 1.0, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [boltPulseAnim]);

  // Cálculos de Porcentajes según la métrica activa
  const burnPct = Math.round((calories / Math.max(1, targetCalories)) * 100);
  const nutritionPct = Math.round((consumedCalories / Math.max(1, targetConsumedCalories)) * 100);
  const overallPowerPct = Math.round(((strengthProgress * 0.6) + (virtueProgress * 0.4)) * 100);

  const displayPct = activeMetric === 'burn' ? burnPct : activeMetric === 'nutrition' ? nutritionPct : overallPowerPct;
  const currentRatio = Math.min(1, Math.max(0.02, displayPct / 100));

  const cx = size / 2;
  const cy = size / 2;

  // Outer 3D Gold Bezel
  const bezelRadius = (size - 18) / 2;
  
  // Power Progress Arc
  const arcStrokeWidth = 14;
  const arcRadius = bezelRadius - 20;

  // Angles: 135deg (bottom-left) to 405deg (bottom-right) => 270deg sweep
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const currentAngle = startAngle + totalAngle * currentRatio;
  const bgArc = describeArc(cx, cy, arcRadius, startAngle, endAngle);
  const progressArc = describeArc(cx, cy, arcRadius, startAngle, currentAngle);

  const capPos = polarToCartesian(cx, cy, arcRadius, currentAngle);
  const pctBadgePos = polarToCartesian(cx, cy, arcRadius + 22, Math.min(endAngle - 15, currentAngle + 12));

  // Generación de Chispas Eléctricas Dinámicas a lo largo del arco activo
  const midAngle1 = startAngle + (totalAngle * currentRatio * 0.35);
  const midAngle2 = startAngle + (totalAngle * currentRatio * 0.70);
  const sparkPos1 = polarToCartesian(cx, cy, arcRadius, midAngle1);
  const sparkPos2 = polarToCartesian(cx, cy, arcRadius, midAngle2);

  return (
    <View style={styles.container}>
      {/* 3D LUXURY GOLD & THUNDER DIAL */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() =>
          setActiveMetric((prev) => (prev === 'burn' ? 'nutrition' : prev === 'nutrition' ? 'power' : 'burn'))
        }
        style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      >
        <Svg width={size} height={size} style={styles.svgAbsolute}>
          <Defs>
            {/* Ambient Electric Atmosphere Halo */}
            <RadialGradient id="ambientBackglow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(245, 158, 11, 0.50)" />
              <Stop offset="45%" stopColor="rgba(255, 226, 89, 0.22)" />
              <Stop offset="80%" stopColor="rgba(212, 175, 55, 0.08)" />
              <Stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
            </RadialGradient>

            {/* 3D Metallic Gold Bezel Gradient */}
            <LinearGradient id="metallicBezel3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFDE0" />
              <Stop offset="20%" stopColor="#FFE259" />
              <Stop offset="45%" stopColor="#D4AF37" />
              <Stop offset="70%" stopColor="#8A6615" />
              <Stop offset="88%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#FFFBEB" />
            </LinearGradient>

            {/* Hyper-Luminous Thunder Gold Arc Gradient */}
            <LinearGradient id="thunderGlowArc" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="30%" stopColor="#D4AF37" />
              <Stop offset="65%" stopColor="#FFE259" />
              <Stop offset="90%" stopColor="#FFFBEB" />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </LinearGradient>

            {/* Central Bolt Corona Flare */}
            <RadialGradient id="boltBloomGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.98)" />
              <Stop offset="25%" stopColor="rgba(255, 226, 89, 0.85)" />
              <Stop offset="65%" stopColor="rgba(245, 158, 11, 0.45)" />
              <Stop offset="100%" stopColor="rgba(245, 158, 11, 0.00)" />
            </RadialGradient>

            {/* 3D Central Bolt Gradient */}
            <LinearGradient id="bolt3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="20%" stopColor="#FFFDE0" />
              <Stop offset="45%" stopColor="#FFE259" />
              <Stop offset="75%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#B45309" />
            </LinearGradient>

            {/* Inner Chisel Highlight for 3D Bolt */}
            <LinearGradient id="boltChiselGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="60%" stopColor="#FFE259" stopOpacity="0.80" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.30" />
            </LinearGradient>

            {/* Onyx Disc Background */}
            <RadialGradient id="onyxPlate" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#1E2333" />
              <Stop offset="55%" stopColor="#0F131E" />
              <Stop offset="85%" stopColor="#080A10" />
              <Stop offset="100%" stopColor="#040406" />
            </RadialGradient>

            {/* Electric Spark Gradient */}
            <LinearGradient id="electricSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="50%" stopColor="#FFE259" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </LinearGradient>
          </Defs>

          {/* 0. AMBIENT ELECTRIC ATMOSPHERE GLOW */}
          <Circle
            cx={cx}
            cy={cy}
            r={bezelRadius + 14}
            fill="url(#ambientBackglow)"
          />

          {/* 1. OUTER 3D METALLIC GOLD RIM */}
          <Circle
            cx={cx}
            cy={cy}
            r={bezelRadius}
            stroke="url(#metallicBezel3D)"
            strokeWidth={11}
            fill="none"
          />
          {/* Inner Golden Rim Line */}
          <Circle
            cx={cx}
            cy={cy}
            r={bezelRadius - 6}
            stroke="rgba(255, 253, 224, 0.65)"
            strokeWidth={1.8}
            fill="none"
          />

          {/* 2. INNER ONYX DISK */}
          <Circle
            cx={cx}
            cy={cy}
            r={bezelRadius - 8}
            fill="url(#onyxPlate)"
          />

          {/* 3. TRACK BACKGROUND (INACTIVE ARC) */}
          <Path
            d={bgArc}
            stroke="rgba(212, 175, 55, 0.16)"
            strokeWidth={arcStrokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* 4. ACTIVE POWER ARC GLOW BLOOM (CAPA 1: DIFUSA AMPLIA) */}
          <Path
            d={progressArc}
            stroke="rgba(245, 158, 11, 0.35)"
            strokeWidth={arcStrokeWidth + 18}
            strokeLinecap="round"
            fill="none"
          />

          {/* 4. ACTIVE POWER ARC GLOW BLOOM (CAPA 2: NEÓN INTENSO) */}
          <Path
            d={progressArc}
            stroke="rgba(255, 226, 89, 0.65)"
            strokeWidth={arcStrokeWidth + 9}
            strokeLinecap="round"
            fill="none"
          />

          {/* 4. ACTIVE POWER ARC (NÚCLEO ÁUREO INCANDESCENTE) */}
          <Path
            d={progressArc}
            stroke="url(#thunderGlowArc)"
            strokeWidth={arcStrokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* 5. ARCO DE DESCARGA ELÉCTRICA EN TIEMPO REAL (CHISPAS DE ALTA TENSIÓN) */}
          {currentRatio > 0.15 && (
            <>
              {/* Relámpago de Chispa 1 */}
              <Path
                d={`M ${sparkPos1.x - 6} ${sparkPos1.y - 8} L ${sparkPos1.x} ${sparkPos1.y} L ${sparkPos1.x - 3} ${sparkPos1.y + 1} L ${sparkPos1.x + 5} ${sparkPos1.y + 8}`}
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
                fill="none"
              />
              <Circle cx={sparkPos1.x} cy={sparkPos1.y} r={3} fill="#FFE259" />
            </>
          )}

          {currentRatio > 0.50 && (
            <>
              {/* Relámpago de Chispa 2 */}
              <Path
                d={`M ${sparkPos2.x - 8} ${sparkPos2.y - 6} L ${sparkPos2.x - 2} ${sparkPos2.y} L ${sparkPos2.x - 6} ${sparkPos2.y + 2} L ${sparkPos2.x + 6} ${sparkPos2.y + 7}`}
                stroke="#FFFFFF"
                strokeWidth={2.6}
                strokeLinecap="round"
                fill="none"
              />
              <Circle cx={sparkPos2.x} cy={sparkPos2.y} r={3.5} fill="#FFFFFF" />
            </>
          )}

          {/* 6. PUNTA DE DESCARGA ELÉCTRICA MULTI-CAPA */}
          {/* Halo Exterior Expandido */}
          <Circle
            cx={capPos.x}
            cy={capPos.y}
            r={arcStrokeWidth / 2 + 12}
            fill="rgba(245, 158, 11, 0.45)"
          />
          {/* Resplandor Eléctrico */}
          <Circle
            cx={capPos.x}
            cy={capPos.y}
            r={arcStrokeWidth / 2 + 6}
            fill="rgba(255, 226, 89, 0.90)"
          />
          {/* Núcleo Blanco Incandescente */}
          <Circle
            cx={capPos.x}
            cy={capPos.y}
            r={arcStrokeWidth / 2 + 1}
            fill="#FFFFFF"
          />

          {/* 7. RELÁMPAGO MONUMENTAL CENTRAL 3D */}
          <G transform={`translate(${cx - 24}, ${cy - 86})`}>
            {/* Corona Trasera de Plasma */}
            <Circle cx={26} cy={34} r={46} fill="url(#boltBloomGrad)" />

            {/* Resplandor Eléctrico de Borde */}
            <Polygon
              points="28,0 8,36 24,36 12,68 44,26 28,26"
              fill="rgba(245, 158, 11, 0.45)"
              stroke="rgba(255, 226, 89, 0.85)"
              strokeWidth={6}
            />

            {/* Sombra Cálida 3D */}
            <Polygon
              points="28,0 8,36 24,36 12,68 44,26 28,26"
              fill="rgba(180, 83, 9, 0.70)"
              transform="translate(2, 2.5)"
            />

            {/* Cuerpo Facetado en Oro y Platino */}
            <Polygon
              points="28,0 8,36 24,36 12,68 44,26 28,26"
              fill="url(#bolt3DGrad)"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />

            {/* Arista Cincelada de Luz */}
            <Polygon
              points="28,2 10,34 23,34 14,64 24,34 16,34 28,6"
              fill="url(#boltChiselGrad)"
            />
          </G>
        </Svg>

        {/* 8. LECTURA NUMÉRICA CENTRAL Y MODO */}
        <View style={[styles.centerContent, { pointerEvents: 'none' }]}>
          <View style={styles.calsNumberRow}>
            <ThemedText style={styles.mainCountText}>
              {activeMetric === 'burn'
                ? calories.toLocaleString()
                : activeMetric === 'nutrition'
                ? consumedCalories.toLocaleString()
                : `${displayPct}%`}
            </ThemedText>

            {activeMetric !== 'power' && (
              <ThemedText style={styles.targetDividerText}>
                {' '}/ {activeMetric === 'burn' ? targetCalories.toLocaleString() : targetConsumedCalories.toLocaleString()}
              </ThemedText>
            )}

            <View style={styles.unitBadgeCol}>
              <ThemedText style={styles.kcalUnitText}>
                {activeMetric === 'power' ? 'DISCIPLINA' : 'Kcal'}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.dailyPowerTitle}>
            {activeMetric === 'burn' ? 'DAILY POWER BURN' : activeMetric === 'nutrition' ? 'INGESTA NUTRICIONAL' : 'PODER ESTOICO'}
          </ThemedText>
          <ThemedText style={styles.dailyBurnSub}>
            {activeMetric === 'burn'
              ? '⚡ GASTO ENERGÉTICO ACTIVO'
              : activeMetric === 'nutrition'
              ? '🥗 COMIDAS REGISTRADAS'
              : '🏛️ FUERZA & TEMPLE'}
          </ThemedText>
        </View>

        {/* 9. INSIGNIA FLOTANTE DE PORCENTAJE EN LA PUNTA */}
        <View style={[styles.percentFloatingBadge, { top: pctBadgePos.y - 12, left: pctBadgePos.x - 18 }]}>
          <ThemedText style={styles.percentFloatingText}>{displayPct}%</ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  svgAbsolute: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  calsNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 4,
    maxWidth: 240,
  },
  mainCountText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: -0.5,
    lineHeight: 34,
    textShadowColor: 'rgba(255, 226, 89, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  targetDividerText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#CBD5E1',
    fontFamily: 'serif',
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  unitBadgeCol: {
    marginLeft: 6,
  },
  kcalUnitText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FDE68A',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    lineHeight: 14,
    textShadowColor: 'rgba(245, 158, 11, 0.70)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  dailyPowerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'sans-serif',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 2,
    textShadowColor: 'rgba(245, 158, 11, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  dailyBurnSub: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#CBD5E1',
    fontFamily: 'monospace',
    letterSpacing: 1.2,
    marginTop: 3,
    lineHeight: 13,
  },
  percentFloatingBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(10, 14, 24, 0.94)',
    borderWidth: 1.4,
    borderColor: '#FFE259',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 6,
    elevation: 5,
  },
  percentFloatingText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#FFFFFF',
  },
});
