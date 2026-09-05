import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { SafeStorage } from '@/utils/safeStorage';
import { getLocalTodayDateString } from '@/utils/dateUtils';

interface DailyStoicChallengeCardProps {
  onChallengeToggle?: (completed: boolean) => void;
}

const STOIC_CHALLENGES = [
  {
    title: 'Ducha de Agua Fría (60 seg)',
    motto: 'Incomodidad voluntaria para templar el sistema nervioso.',
    pillar: 'TEMPLANZA',
    author: 'Séneca',
  },
  {
    title: 'Desconexión Digital (30 min antes de dormir)',
    motto: 'Cero pantallas para restaurar la paz mental y la melatonina.',
    pillar: 'AUTODOMINIO',
    author: 'Marco Aurelio',
  },
  {
    title: 'Cero Azúcar Añadido ni Ultraprocesados',
    motto: 'Alimenta el templo con pureza; la gula debilita la voluntad.',
    pillar: 'DISCIPLINA',
    author: 'Musonio Rufo',
  },
  {
    title: 'Caminata Consciente de 15 min en Silencio',
    motto: 'Sin música ni podcasts; solo tú, tus pasos y tu respiración.',
    pillar: 'ATARAXIA',
    author: 'Epicteto',
  },
  {
    title: 'Pausa de Serenidad ante la Frustración',
    motto: 'Ante cualquier contratiempo hoy, toma 10 respiraciones antes de hablar.',
    pillar: 'PACIENCIA',
    author: 'Marco Aurelio',
  },
  {
    title: 'Ayuno Intermitente Matutino (14h+)',
    motto: 'Permite que el cuerpo limpie sus células antes de ingerir alimento.',
    pillar: 'AUTOFAGIA',
    author: 'Hipócrates',
  },
  {
    title: 'Amor Fati: Agradece 3 Dificultades de la Semana',
    motto: 'El obstáculo no es un bloqueo; el obstáculo es el camino.',
    pillar: 'AMOR FATI',
    author: 'Marco Aurelio',
  },
];

export const DailyStoicChallengeCard = React.memo(function DailyStoicChallengeCard({ onChallengeToggle }: DailyStoicChallengeCardProps) {
  const todayStr = getLocalTodayDateString();
  const dayOfWeek = new Date().getDay(); // 0-6
  const currentChallenge = STOIC_CHALLENGES[dayOfWeek] || STOIC_CHALLENGES[0];

  const storageKey = `ataraxia_stoic_challenge_${todayStr}`;
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    const saved = SafeStorage.getItem(storageKey);
    setIsCompleted(saved === 'true');
  }, [storageKey]);

  const handleToggle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const nextState = !isCompleted;
    setIsCompleted(nextState);
    SafeStorage.setItem(storageKey, String(nextState));

    if (onChallengeToggle) {
      onChallengeToggle(nextState);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <ThemedText style={styles.categoryGoldText}>⚡ PRUEBA DIARIA DE TEMPLE</ThemedText>
          <ThemedText style={styles.challengeMainTitle}>{currentChallenge.title}</ThemedText>
        </View>
        <View style={styles.pillarBadge}>
          <ThemedText style={styles.pillarBadgeText}>{currentChallenge.pillar}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.mottoText}>
        "{currentChallenge.motto}"
      </ThemedText>

      <View style={styles.footerRow}>
        <ThemedText style={styles.authorText}>— {currentChallenge.author}</ThemedText>

        <TouchableOpacity
          style={styles.toggleTouch}
          activeOpacity={0.8}
          onPress={handleToggle}
        >
          <LinearGradient
            colors={isCompleted ? ['#059669', '#10B981'] : ['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.toggleGradient, isCompleted && styles.toggleGradientActive]}
          >
            <ThemedText style={[styles.toggleBtnText, isCompleted && styles.toggleBtnTextActive]}>
              {isCompleted ? '🏆 Temple Superado ✓' : '⚡ Marcar Cumplido'}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(14, 20, 36, 0.92)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  titleGroup: {
    flex: 1,
    flexShrink: 1,
    minWidth: 160,
    gap: 2,
  },
  categoryGoldText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 1.5,
  },
  challengeMainTitle: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  pillarBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignSelf: 'flex-start',
  },
  pillarBadgeText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 1,
  },
  mottoText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 16,
    flexShrink: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.12)',
  },
  authorText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#C5A869',
    flexShrink: 1,
  },
  toggleTouch: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  toggleGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  toggleGradientActive: {
    borderColor: '#10B981',
  },
  toggleBtnText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FDE68A',
    fontFamily: 'monospace',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
});
