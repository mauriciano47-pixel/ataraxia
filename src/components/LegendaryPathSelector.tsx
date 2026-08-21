import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import { ThemedText } from './themed-text';
import { LegendaryPath, LEGENDARY_PATHS } from '@/types/onboarding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  onSelectPath: (path: LegendaryPath) => void;
}

export function LegendaryPathSelector({ onSelectPath }: Props) {
  const [selectedPath, setSelectedPath] = useState<LegendaryPath>('spartan');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.03,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, buttonPulse]);

  const pathsList: LegendaryPath[] = ['spartan', 'hoplite', 'apollo', 'philosopher'];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* FONDO AURORA DORADA */}
      <View style={styles.backgroundCanvas}>
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="pathGlow" cx="50%" cy="30%" r="65%">
              <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.22" />
              <Stop offset="40%" stopColor="#D4AF37" stopOpacity="0.10" />
              <Stop offset="85%" stopColor="#040406" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#020204" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#pathGlow)" />
        </Svg>
      </View>

      {/* TARJETA PRINCIPAL DEL SANTUARIO */}
      <View style={styles.mainCard}>
        {/* HEADER */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeTop}>
            <ThemedText style={styles.badgeTopText}>🏛️ ELECCIÓN DEL DESTINO • CICLO DE 30 DÍAS</ThemedText>
          </View>
          <ThemedText style={styles.titleMain}>ELIGE TU SENDA DE ATARAXIA</ThemedText>
          <ThemedText style={styles.subtitleMain}>
            Tu elección forjará tu rutina de un mes, tus calorías y la exigencia del Coach. Al Día 30 serás juzgado: <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>ascenso a Semidiós o reprensión severa.</ThemedText>
          </ThemedText>
          <View style={styles.goldDivider} />
        </View>

        {/* LISTA DE LAS 4 SENDAS */}
        <ScrollView
          style={styles.pathsScroll}
          contentContainerStyle={styles.pathsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {pathsList.map((pathKey) => {
            const pathInfo = LEGENDARY_PATHS[pathKey];
            const isSelected = selectedPath === pathKey;

            return (
              <TouchableOpacity
                key={pathKey}
                style={[
                  styles.pathCard,
                  isSelected && styles.pathCardSelected,
                ]}
                onPress={() => setSelectedPath(pathKey)}
                activeOpacity={0.85}
              >
                {/* Header de la tarjeta */}
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                    <ThemedText style={styles.cardIcon}>{pathInfo.icon}</ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.pathName, isSelected && styles.pathNameSelected]}>
                      {pathInfo.name}
                    </ThemedText>
                    <ThemedText style={styles.pathSubtitle}>{pathInfo.subtitle}</ThemedText>
                  </View>
                  <View style={[styles.radioDot, isSelected && styles.radioDotSelected]}>
                    {isSelected && <View style={styles.radioDotInner} />}
                  </View>
                </View>

                {/* Descripción y Mote */}
                <ThemedText style={styles.pathDescription}>{pathInfo.description}</ThemedText>

                {/* Lema */}
                <View style={styles.mottoBox}>
                  <ThemedText style={styles.mottoText}>{pathInfo.motto}</ThemedText>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* ADVERTENCIA DEL DÍA 30 */}
          <View style={styles.warningBox}>
            <View style={styles.warningHeaderRow}>
              <ThemedText style={{ fontSize: 16 }}>⚖️</ThemedText>
              <ThemedText style={styles.warningTitle}>EL JUICIO DEL DÍA 30</ThemedText>
            </View>
            <ThemedText style={styles.warningBody}>
              Cada día se califica tu disciplina (Entreno, Pasos, Agua y Nutrición). Si al día 30 alcanzas el 80% de excelencia, <ThemedText style={{ color: '#00E676', fontWeight: 'bold' }}>ascenderás de Rango Olímpico</ThemedText>. Si muestras mediocridad, <ThemedText style={{ color: '#EF4444', fontWeight: 'bold' }}>el Coach te reprenderá y reiniciarás el ciclo desde cero</ThemedText>.
            </ThemedText>
          </View>

          {/* BOTÓN DE CONSAGRACIÓN */}
          <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonPulse }] }]}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => onSelectPath(selectedPath)}
              activeOpacity={0.85}
            >
              <View style={styles.confirmBtnInner}>
                <ThemedText style={{ fontSize: 16 }}>⚡</ThemedText>
                <ThemedText style={styles.confirmBtnText}>
                  CONSAGRAR {LEGENDARY_PATHS[selectedPath].name.toUpperCase()}
                </ThemedText>
                <ThemedText style={{ fontSize: 16 }}>⚡</ThemedText>
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.confirmHint}>
              Inicia tu Ciclo de 30 Días en el Templo del Autodominio
            </ThemedText>
          </Animated.View>
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#020204',
    zIndex: 100001,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingVertical: Platform.OS === 'web' ? 24 : 36,
  },
  backgroundCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainCard: {
    width: '100%',
    maxWidth: 540,
    height: '100%',
    maxHeight: 780,
    backgroundColor: 'rgba(9, 12, 22, 0.96)',
    borderRadius: 20,
    borderWidth: 1.8,
    borderColor: 'rgba(212, 175, 55, 0.60)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  headerBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  badgeTop: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 226, 89, 0.40)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeTopText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  titleMain: {
    fontSize: Platform.OS === 'web' ? 22 : 19,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
    textShadowColor: 'rgba(212, 175, 55, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitleMain: {
    fontSize: 11.5,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  goldDivider: {
    width: 120,
    height: 2,
    backgroundColor: '#D4AF37',
    marginTop: 10,
    borderRadius: 1,
  },
  pathsScroll: {
    flex: 1,
  },
  pathsScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 12,
  },
  pathCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 14,
    borderWidth: 1.3,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 14,
    gap: 8,
  },
  pathCardSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: '#FFE259',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.40,
    shadowRadius: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconBoxSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
    borderColor: '#FFE259',
  },
  cardIcon: {
    fontSize: 20,
  },
  pathName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: 0.5,
  },
  pathNameSelected: {
    color: '#FFE259',
  },
  pathSubtitle: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotSelected: {
    borderColor: '#FFE259',
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE259',
  },
  pathDescription: {
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16.5,
  },
  mottoBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderLeftWidth: 2.5,
    borderLeftColor: '#D4AF37',
  },
  mottoText: {
    fontSize: 10.5,
    fontStyle: 'italic',
    color: '#FDE68A',
    fontFamily: 'serif',
  },
  warningBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#FFE259',
    letterSpacing: 1.2,
  },
  warningBody: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15.5,
  },
  buttonWrapper: {
    marginTop: 10,
    alignItems: 'center',
    gap: 6,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.70,
    shadowRadius: 14,
    elevation: 8,
  },
  confirmBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#050507',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  confirmHint: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: 'rgba(212, 175, 55, 0.65)',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
