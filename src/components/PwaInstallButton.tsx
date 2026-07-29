import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // 1. Check if user already installed or dismissed the banner
    try {
      const alreadyInstalled = localStorage.getItem('ataraxia_pwa_installed') === 'true';
      const alreadyDismissed = localStorage.getItem('ataraxia_pwa_dismissed') === 'true';
      if (alreadyInstalled || alreadyDismissed) {
        setIsDismissed(true);
        return;
      }
    } catch (e) {
      // Storage access error fallback
    }

    // 2. Check if app is running in Standalone PWA mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsDismissed(true);
      try {
        localStorage.setItem('ataraxia_pwa_installed', 'true');
      } catch (e) {}
      return;
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 4. Listen for successful installation event
    const handleAppInstalled = () => {
      setIsDismissed(true);
      try {
        localStorage.setItem('ataraxia_pwa_installed', 'true');
      } catch (e) {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsDismissed(true);
        try {
          localStorage.setItem('ataraxia_pwa_installed', 'true');
        } catch (e) {}
      }
      setDeferredPrompt(null);
    } else {
      alert("Para instalar Ataraxia en tu celular:\n\n• Safari / iOS: Toca 'Compartir' ➔ 'Agregar a inicio'\n• Chrome / Android: Toca '⋮' (Menú) ➔ 'Instalar aplicación'");
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('ataraxia_pwa_dismissed', 'true');
    } catch (e) {}
  };

  if (Platform.OS !== 'web' || isDismissed) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bannerRow}>
        <TouchableOpacity style={styles.installBtn} onPress={handleInstallClick}>
          <ThemedText style={styles.btnText}>📲 INSTALAR ATARAXIA EN TU MÓVIL</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
          <ThemedText style={styles.closeText}>✕</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.two,
    alignItems: 'center',
    width: '100%',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.15)',
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    borderRadius: 8,
    overflow: 'hidden',
  },
  installBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  closeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(211, 47, 47, 0.4)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeText: {
    color: '#AAA',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
