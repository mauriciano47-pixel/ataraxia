import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import { DownloadIcon } from './ModuleSvgIcons';

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      alert("Para instalar Ataraxia en tu celular:\n• En Safari/iOS: Toca 'Compartir' -> 'Agregar a inicio'\n• En Chrome/Android: Toca los 3 puntos -> 'Instalar aplicación'");
    }
  };

  if (Platform.OS !== 'web' || installed) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.installBtn} onPress={handleInstallClick}>
        <ThemedText style={styles.btnText}>📲 INSTALAR ATARAXIA EN TU MÓVIL</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.two,
    alignItems: 'center',
  },
  installBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.15)',
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
