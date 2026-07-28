import { StyleSheet, View, Switch, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { auth } from '@/lib/firebase';

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  const [mementoMoriEnabled, setMementoMoriEnabled] = useState(true);
  const [fastingEnabled, setFastingEnabled] = useState(false);

  const uid = auth?.currentUser?.uid || 'Desconocido';
  const shortUid = uid.substring(0, 8);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header con botón de volver */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <ThemedText style={styles.label}>PROKOPTON</ThemedText>
            <ThemedText style={styles.title}>El Yo</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.description}>
          &ldquo;La felicidad de tu vida depende de la calidad de tus pensamientos.&rdquo; – Marco Aurelio
        </ThemedText>

        {/* Sección de Identidad */}
        <ThemedView style={[styles.section, { borderColor: colors.backgroundSelected }]}>
          <ThemedText style={styles.sectionTitle}>IDENTIDAD DEL ALMA</ThemedText>
          <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>ID de Ciudadano</ThemedText>
            <ThemedText style={styles.rowValue}>#{shortUid}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>Rango Estoico</ThemedText>
            <ThemedText style={styles.rowValue}>Prokopton (Aprendiz)</ThemedText>
          </View>
        </ThemedView>

        {/* Sección de Preferencias */}
        <ThemedView style={[styles.section, { borderColor: colors.backgroundSelected }]}>
          <ThemedText style={styles.sectionTitle}>PREFERENCIAS DE DISCIPLINA</ThemedText>
          
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.rowLabel}>Memento Mori</ThemedText>
              <ThemedText style={styles.hint}>Recordatorio matutino de tu mortalidad.</ThemedText>
            </View>
            <Switch 
              value={mementoMoriEnabled} 
              onValueChange={setMementoMoriEnabled} 
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={'#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.rowLabel}>Ayuno Intermitente</ThemedText>
              <ThemedText style={styles.hint}>Ocultar calorías hasta el mediodía.</ThemedText>
            </View>
            <Switch 
              value={fastingEnabled} 
              onValueChange={setFastingEnabled} 
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </ThemedView>

        {/* Sección de Peligro */}
        <ThemedView style={[styles.section, { borderColor: colors.backgroundSelected, marginTop: Spacing.four }]}>
          <TouchableOpacity style={styles.dangerButton}>
            <Ionicons name="flame-outline" size={20} color="#FF453A" />
            <ThemedText style={styles.dangerText}>Destruir Ego (Borrar Cuenta)</ThemedText>
          </TouchableOpacity>
        </ThemedView>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  backButton: {
    marginRight: Spacing.four,
    padding: Spacing.two,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.1)'
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#3D6BFF',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontFamily: 'serif',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: Spacing.five,
    color: '#888'
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#60646C',
    marginBottom: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 16,
    color: '#888'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  hint: {
    fontSize: 12,
    color: '#60646C',
    marginTop: 4,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  dangerText: {
    color: '#FF453A',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
