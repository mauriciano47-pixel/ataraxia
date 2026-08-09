import { Link, Stack } from 'expo-router';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';

export default function NotFoundScreen() {
  return (
    <PearlElectricBackground>
      <Stack.Screen options={{ title: 'Ruta No Encontrada', headerShown: false }} />
      <View style={styles.container}>
        <ThemedText style={styles.icon}>🏛️</ThemedText>
        <ThemedText style={styles.title}>404 — Ruta Fuera del Camino</ThemedText>
        <ThemedText style={styles.subtitle}>
          &quot;Lo que se interpone en el camino se convierte en el camino.&quot;
        </ThemedText>
        <ThemedText style={styles.author}>— Marco Aurelio</ThemedText>

        <Link href="/" asChild>
          <TouchableOpacity style={styles.homeBtn} activeOpacity={0.8}>
            <ThemedText style={styles.homeBtnText}>⚡ Volver al Santuario Hoy</ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
    </PearlElectricBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFE259',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 14,
    color: '#FDE68A',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
    maxWidth: 320,
  },
  author: {
    fontSize: 11,
    color: '#CBD5E1',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  homeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  homeBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
