import { View, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useState } from 'react';

// Mock de la rutina (SesionEntreno)
const RUTINA_MOCK = [
  { id: '1', n: "Sentadilla", s: "4x8", done: false, rpe: null as number | null },
  { id: '2', n: "Peso muerto", s: "3x6", done: false, rpe: null as number | null },
  { id: '3', n: "Zancadas", s: "3x12", done: false, rpe: null as number | null },
  { id: '4', n: "Prensa", s: "3x15", done: false, rpe: null as number | null },
];

const CALISTENIA_MOCK = [
  { id: 'c1', n: "Flexiones (Push-ups)", s: "4 al fallo", done: false, rpe: null as number | null },
  { id: 'c2', n: "Sentadillas libres", s: "4x20", done: false, rpe: null as number | null },
  { id: 'c3', n: "Plancha Abdominal", s: "3x1min", done: false, rpe: null as number | null },
];

export default function TrainerScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  
  const [ejercicios, setEjercicios] = useState(RUTINA_MOCK);
  const [isAmorFati, setIsAmorFati] = useState(false);

  const toggleDone = (id: string) => {
    setEjercicios(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, done: !e.done, rpe: !e.done ? (e.rpe || 7) : null }; // Default RPE 7 si se marca done sin elegir
      }
      return e;
    }));
  };

  const setRPE = (id: string, value: number) => {
    setEjercicios(prev => prev.map(e => e.id === id ? { ...e, rpe: value, done: true } : e));
  };

  const checkDeload = () => {
    const doneExercises = ejercicios.filter(e => e.done && e.rpe !== null);
    if (doneExercises.length === 0) return;
    
    const avgRpe = doneExercises.reduce((acc, curr) => acc + (curr.rpe || 0), 0) / doneExercises.length;
    if (avgRpe > 8.5) {
      Alert.alert(
        "Semana de Descarga",
        "El arco que siempre está tenso termina por romperse. Tu esfuerzo (RPE) ha sido muy alto. Bajaremos la intensidad mañana. Lo que depende de ti es recuperar."
      );
    } else {
      Alert.alert("Entreno Finalizado", "Buen trabajo manteniendo el control.");
    }
  };

  const toggleAmorFati = () => {
    setIsAmorFati(!isAmorFati);
    setEjercicios(!isAmorFati ? CALISTENIA_MOCK : RUTINA_MOCK);
    Alert.alert("Amor Fati", !isAmorFati ? "No controlas tu entorno, pero controlas tu reacción. Rutina adaptada a peso corporal." : "Volviendo a tu rutina de gimnasio.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View>
              <ThemedText style={styles.label}>HOY</ThemedText>
              <ThemedText style={styles.title}>{isAmorFati ? "Calistenia" : "Tren inferior"}</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.amorFatiBtn, { borderColor: colors.accent, backgroundColor: isAmorFati ? colors.accent : 'transparent' }]}
              onPress={toggleAmorFati}
            >
              <ThemedText style={[styles.amorFatiText, { color: isAmorFati ? '#FFF' : colors.accent }]}>Amor Fati</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.list}>
          {ejercicios.map((e) => (
            <View key={e.id} style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
              <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => toggleDone(e.id)}
                activeOpacity={0.7}
              >
                <View>
                  <ThemedText style={styles.exerciseName}>{e.n}</ThemedText>
                  <ThemedText style={[styles.exerciseSets, { color: colors.textSecondary }]}>{e.s}</ThemedText>
                </View>
                
                <View style={[
                  styles.checkbox,
                  e.done ? { 
                    backgroundColor: colors.accent, 
                    borderColor: colors.accent,
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 6,
                    elevation: 4
                  } : { 
                    backgroundColor: 'transparent', 
                    borderColor: colors.backgroundSelected 
                  }
                ]} />
              </TouchableOpacity>
              
              <View style={styles.rpeContainer}>
                <ThemedText style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 6 }}>RPE (Esfuerzo 1-10):</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                  {[...Array(10)].map((_, i) => {
                    const rpeValue = i + 1;
                    const isSelected = e.rpe === rpeValue;
                    return (
                      <TouchableOpacity 
                        key={rpeValue} 
                        style={[
                          styles.rpeButton, 
                          { borderColor: colors.backgroundSelected },
                          isSelected && { backgroundColor: colors.accent, borderColor: colors.accent }
                        ]}
                        onPress={() => setRPE(e.id, rpeValue)}
                      >
                        <ThemedText style={isSelected ? { color: '#FFF' } : {}}>{rpeValue}</ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.finishBtn, { backgroundColor: colors.accent }]}
          onPress={checkDeload}
        >
          <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Finalizar Entreno</ThemedText>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  header: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#3D6BFF',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    marginTop: 4,
  },
  list: {
    gap: Spacing.three,
  },
  card: {
    padding: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseName: {
    fontSize: 14,
  },
  exerciseSets: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  rpeContainer: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#1E2A3F',
  },
  rpeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amorFatiBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  amorFatiText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  finishBtn: {
    marginTop: Spacing.four,
    padding: Spacing.four,
    borderRadius: 8,
    alignItems: 'center',
  }
});
