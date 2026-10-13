import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from './themed-text';
import { styles } from '@/styles/profile.styles';

interface CondecorationRankCardProps {
  isDiplomaUnlocked: boolean;
  tier: string;
  currentDay: number;
  adherencePct: number;
  passedDays: number;
  onOpenDiploma: () => void;
  onOpenLockedDiploma: () => void;
}

export function CondecorationRankCard({
  isDiplomaUnlocked,
  tier,
  currentDay,
  adherencePct,
  passedDays,
  onOpenDiploma,
  onOpenLockedDiploma,
}: CondecorationRankCardProps) {
  return (
    <View style={styles.condecorationCard}>
      <View style={styles.condecorationHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <ThemedText style={{ fontSize: 26 }}>{isDiplomaUnlocked ? '👑' : '🔒'}</ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.condecorationTag}>
              {isDiplomaUnlocked ? 'DISTINCIÓN OFICIAL DEL OLIMPO' : 'EVALUACIÓN DE 30 DÍAS EN CURSO'}
            </ThemedText>
            <ThemedText style={styles.condecorationRankTitle}>
              {isDiplomaUnlocked ? tier : 'Diploma en Evaluación'}
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.condecorationBadge,
            isDiplomaUnlocked
              ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' }
              : { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B' },
          ]}
        >
          <ThemedText
            style={[
              styles.condecorationBadgeText,
              isDiplomaUnlocked ? { color: '#34D399' } : { color: '#F59E0B' },
            ]}
          >
            {isDiplomaUnlocked ? 'OTORGADO (80%+)' : `DÍA ${currentDay}/30 • ${adherencePct}%`}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.condecorationDesc}>
        {isDiplomaUnlocked
          ? '🎖️ Has completado los 30 Días con más del 80% de días gobernados. Tu Diploma de Honor Estoico y la Evaluación del Coach han sido desbloqueados.'
          : `⚔️ El Diploma se otorgará en el Día 30 si alcanzas al menos el 80% de días gobernados (${passedDays}/24 días dignos actuales - ${adherencePct}%).`}
      </ThemedText>

      {isDiplomaUnlocked ? (
        <TouchableOpacity
          style={styles.openDiplomaBtn}
          onPress={onOpenDiploma}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#D4AF37', '#FFE259', '#B45309']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.openDiplomaBtnGradient}
          >
            <Ionicons name="ribbon" size={18} color="#050507" />
            <ThemedText style={styles.openDiplomaBtnText}>
              📜 VER DIPLOMA & EVALUACIÓN DEL COACH
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.openDiplomaBtn, { borderColor: 'rgba(245, 158, 11, 0.4)' }]}
          onPress={onOpenLockedDiploma}
          activeOpacity={0.85}
        >
          <View style={[styles.openDiplomaBtnGradient, { backgroundColor: 'rgba(15, 23, 42, 0.9)' }]}>
            <Ionicons name="lock-closed" size={18} color="#F59E0B" />
            <ThemedText style={[styles.openDiplomaBtnText, { color: '#F59E0B' }]}>
              🔒 DIPLOMA BLOQUEADO (DÍA {currentDay}/30 • {adherencePct}%/80%)
            </ThemedText>
          </View>
        </TouchableOpacity>
      )}

      {/* Módulo Próximo Nivel: Fase II - La Forja de los Titanes */}
      <View style={styles.nextLevelCard}>
        <View style={styles.nextLevelHeaderRow}>
          <ThemedText style={styles.nextLevelIcon}>⚡</ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.nextLevelSubtitle}>PREPARADO PARA EL SIGUIENTE NIVEL</ThemedText>
            <ThemedText style={styles.nextLevelTitleText}>FASE II: LA FORJA DE LOS TITANES</ThemedText>
          </View>
          <View style={styles.comingSoonBadge}>
            <ThemedText style={styles.comingSoonText}>COMING SOON</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.nextLevelBodyText}>
          Has sido registrado en la lista de honor del Templo Superior. Nuevas rutinas de sobrecarga avanzada, protocolos de hipertrofia y pruebas estoicas supremas estarán disponibles en la próxima fase.
        </ThemedText>
      </View>
    </View>
  );
}
