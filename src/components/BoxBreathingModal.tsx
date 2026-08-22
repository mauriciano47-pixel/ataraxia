import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';

interface BoxBreathingModalProps {
  visible: boolean;
  onClose: () => void;
}

type BreathPhase = 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

const PHASE_CONFIG: Record<BreathPhase, { label: string; sub: string; next: BreathPhase; color: string }> = {
  INHALE: { label: 'INHALA', sub: 'Llena tus pulmones de serenidad (4s)', next: 'HOLD_IN', color: '#10B981' },
  HOLD_IN: { label: 'SOSTÉN', sub: 'Retén el aire con firmeza estoica (4s)', next: 'EXHALE', color: '#D4AF37' },
  EXHALE: { label: 'EXHALA', sub: 'Libera toda tensión y cortisol (4s)', next: 'HOLD_OUT', color: '#38BDF8' },
  HOLD_OUT: { label: 'VACÍO', sub: 'Imperturbabilidad en el silencio (4s)', next: 'INHALE', color: '#A855F7' },
};

export function BoxBreathingModal({ visible, onClose }: BoxBreathingModalProps) {
  const [phase, setPhase] = useState<BreathPhase>('INHALE');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (visible) {
      setIsActive(true);
      setPhase('INHALE');
      setSecondsLeft(4);
      setCyclesCompleted(0);
    } else {
      setIsActive(false);
    }
  }, [visible]);

  // Manejo de la fase y animación del orbe
  useEffect(() => {
    if (!isActive || !visible) return;

    // Feedback táctil suave al cambiar de fase
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }

    if (phase === 'INHALE') {
      Animated.timing(scaleAnim, {
        toValue: 1.45,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (phase === 'EXHALE') {
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPhase((currPhase) => {
            const nextPhase = PHASE_CONFIG[currPhase].next;
            if (nextPhase === 'INHALE') {
              setCyclesCompleted((c) => c + 1);
            }
            return nextPhase;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isActive, visible, scaleAnim]);

  // Pulso de resplandor continuo
  useEffect(() => {
    if (!visible) return;
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [visible, pulseAnim]);

  const currentConf = PHASE_CONFIG[phase];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleCol}>
              <ThemedText style={styles.goldCategoryText}>RESPIRACIÓN TÁCTICA ESTOICA</ThemedText>
              <ThemedText style={styles.modalMainTitle}>Box Breathing 4-4-4-4</ThemedText>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <ThemedText style={styles.closeBtnText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Subtítulo filosófico */}
          <ThemedText style={styles.stoicSubtext}>
            "Cuando la mente esté agitada, no luches con los pensamientos; domina el aliento y la mente se calmará sola."
          </ThemedText>

          {/* Orbe Central Animado */}
          <View style={styles.orbContainer}>
            <Animated.View
              style={[
                styles.glowAura,
                {
                  opacity: pulseAnim,
                  backgroundColor: currentConf.color,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.breathingOrb,
                {
                  borderColor: currentConf.color,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.25)', 'rgba(14, 20, 36, 0.95)']}
                style={styles.orbGradient}
              >
                <ThemedText style={[styles.phaseLabelText, { color: currentConf.color }]}>
                  {currentConf.label}
                </ThemedText>
                <ThemedText style={styles.secondsCounterText}>{secondsLeft}s</ThemedText>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Instrucción de Fase */}
          <View style={styles.instructionBox}>
            <ThemedText style={styles.phaseDescText}>{currentConf.sub}</ThemedText>
          </View>

          {/* Métricas de la Sesión */}
          <View style={styles.sessionMetricsRow}>
            <View style={styles.metricItem}>
              <ThemedText style={styles.metricItemLabel}>Ciclos Completados</ThemedText>
              <ThemedText style={styles.metricItemVal}>⚡ {cyclesCompleted}</ThemedText>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <ThemedText style={styles.metricItemLabel}>Efecto Fisiológico</ThemedText>
              <ThemedText style={styles.metricItemVal}>Nervio Vago Activo</ThemedText>
            </View>
          </View>

          {/* Botón Finalizar */}
          <TouchableOpacity style={styles.finishBtn} activeOpacity={0.8} onPress={onClose}>
            <LinearGradient
              colors={['#D4AF37', '#F59E0B', '#B45309']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.finishBtnGradient}
            >
              <ThemedText style={styles.finishBtnText}>
                {cyclesCompleted >= 2 ? '🏆 Concluir en Paz Estoica' : 'Cerrar Sesión'}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 13, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(13, 17, 28, 0.98)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    padding: 20,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerTitleCol: {
    gap: 2,
  },
  goldCategoryText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 1.5,
  },
  modalMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  stoicSubtext: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  orbContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  glowAura: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  breathingOrb: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  orbGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  phaseLabelText: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  secondsCounterText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  instructionBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.30)',
  },
  phaseDescText: {
    fontSize: 12,
    color: '#FDE68A',
    fontWeight: '700',
    textAlign: 'center',
  },
  sessionMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  metricItemLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  metricItemVal: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  finishBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  finishBtnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#050507',
    letterSpacing: 0.5,
  },
});
