import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';

export default function ArchonThroneScreen() {
  const [viewMode, setViewMode] = useState<'female' | 'male'>('female');

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.35)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* CABECERA DEL TRONO */}
          <View style={styles.header}>
            <ThemedText style={styles.goldBadge}>👑 CONSOLA SUPREMA DE GOBERNANZA</ThemedText>
            <ThemedText style={styles.title}>TRONO DEL ARCONTE</ThemedText>
            <ThemedText style={styles.subtitle}>Soberanía absoluta y control de la legión de Ataraxia</ThemedText>
          </View>

          {/* 1. VISOR PANÓPTICO DE RECLUTAS */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>👁️ VISOR PANÓPTICO: SIMULADOR DE INTERFAZ</ThemedText>
            <ThemedText style={styles.cardDesc}>Previsualiza la app tal como la ve cada legión:</ThemedText>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, viewMode === 'female' && styles.btnActive]}
                onPress={() => setViewMode('female')}
              >
                <ThemedText style={styles.btnText}>🦉 Recluta Femenina (Atenea / Artemisa)</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, viewMode === 'male' && styles.btnActive]}
                onPress={() => setViewMode('male')}
              >
                <ThemedText style={styles.btnText}>⚔️ Recluta Masculino (Esparta / Leónidas)</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. CENSO GLOBAL */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>📊 CENSO GLOBAL DE RECLUTAS</ThemedText>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <ThemedText style={styles.statNum}>1,248</ThemedText>
                <ThemedText style={styles.statLabel}>Guerreros Activos</ThemedText>
              </View>
              <View style={styles.statBox}>
                <ThemedText style={styles.statNum}>89.4%</ThemedText>
                <ThemedText style={styles.statLabel}>Cumplimiento Pacto</ThemedText>
              </View>
              <View style={styles.statBox}>
                <ThemedText style={styles.statNum}>3.4M</ThemedText>
                <ThemedText style={styles.statLabel}>Kcal Quemadas</ThemedText>
              </View>
            </View>
          </View>

          {/* 3. EMISOR DE DECRETOS */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>📜 EMISOR DE DECRETOS GLOBALES</ThemedText>
            <TouchableOpacity style={styles.publishBtn} activeOpacity={0.8}>
              <ThemedText style={styles.publishBtnText}>🚀 PUBLICAR NUEVO DECRETO A LA LEGIÓN</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PearlElectricBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, gap: 16, maxWidth: 600, alignSelf: 'center', width: '100%' },
  header: { alignItems: 'center', gap: 6, marginBottom: 10 },
  goldBadge: { fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold', color: '#D4AF37', letterSpacing: 2 },
  title: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  subtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
  card: { backgroundColor: 'rgba(14, 20, 36, 0.95)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.35)', gap: 10 },
  cardTitle: { fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold', color: '#D4AF37', letterSpacing: 1 },
  cardDesc: { fontSize: 12, color: '#94A3B8' },
  row: { flexDirection: 'column', gap: 8, marginTop: 6 },
  btn: { padding: 12, borderRadius: 10, backgroundColor: 'rgba(15, 23, 42, 0.8)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)', alignItems: 'center' },
  btnActive: { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.15)' },
  btnText: { fontSize: 12, fontWeight: 'bold', color: '#F8FAFC' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  statBox: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: 10, borderRadius: 10, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', fontFamily: 'monospace' },
  statLabel: { fontSize: 9, color: '#94A3B8', marginTop: 2, textAlign: 'center' },
  publishBtn: { backgroundColor: '#D4AF37', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  publishBtnText: { fontSize: 12, fontWeight: '900', color: '#05070D', letterSpacing: 1 },
});
