import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { checkAppUpdate, dismissAppUpdate, UpdateInfo } from '../services/updateCheckService';
import { APP_VERSION } from '../constants/appVersion';

interface UpdateNotificationBannerProps {
  currentVersion?: string;
  onDismissCustom?: () => void;
}

export function UpdateNotificationBanner({
  currentVersion = APP_VERSION,
  onDismissCustom,
}: UpdateNotificationBannerProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    checkAppUpdate(currentVersion)
      .then((info) => {
        if (isMounted && info.isUpdateAvailable) {
          setUpdateInfo(info);
          setIsVisible(true);
        }
      })
      .catch(() => {
        // En caso de error, el componente no interrumpe la experiencia de usuario
      });

    return () => {
      isMounted = false;
    };
  }, [currentVersion]);

  if (!isVisible || !updateInfo) {
    return null;
  }

  const handleUpdatePress = async () => {
    try {
      const targetUrl = updateInfo.downloadUrl || 'https://ataraxia-stoic.vercel.app/download';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        await Linking.openURL(targetUrl);
      }
    } catch (_err) {
      // Fallback seguro
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    dismissAppUpdate(updateInfo.latestVersion);
    if (onDismissCustom) {
      onDismissCustom();
    }
  };

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.glowLine} />
      <View style={styles.contentRow}>
        <View style={styles.iconCircle}>
          <ThemedText style={{ fontSize: 18 }}>👑</ThemedText>
        </View>

        <View style={styles.textColumn}>
          <View style={styles.titleBadgeRow}>
            <ThemedText style={styles.bannerTitle}>
              ACTUALIZACIÓN DISPONIBLE • v{updateInfo.latestVersion}
            </ThemedText>
            <View style={styles.pulseDot} />
          </View>

          <ThemedText style={styles.bannerDesc} numberOfLines={2}>
            {updateInfo.releaseHighlights ||
              'Nuevo motor de rendimiento estoico, optimizaciones biomecánicas y mejoras de estabilidad.'}
          </ThemedText>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.updateBtn}
              activeOpacity={0.85}
              onPress={handleUpdatePress}
              accessibilityLabel="Descargar e instalar nueva versión de Ataraxia"
            >
              <ThemedText style={styles.updateBtnText}>⚡ ACTUALIZAR APK AHORA</ThemedText>
              <Ionicons name="arrow-forward" size={13} color="#040406" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {!updateInfo.isMandatory && (
              <TouchableOpacity
                style={styles.laterBtn}
                activeOpacity={0.7}
                onPress={handleDismiss}
                accessibilityLabel="Posponer actualización de versión"
              >
                <ThemedText style={styles.laterBtnText}>Más tarde</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!updateInfo.isMandatory && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleDismiss}
            activeOpacity={0.7}
            accessibilityLabel="Cerrar aviso de actualización"
          >
            <Ionicons name="close" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: '#0F1218',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 226, 89, 0.45)',
    overflow: 'hidden',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  glowLine: {
    height: 2.5,
    backgroundColor: '#FFE259',
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderWidth: 1,
    borderColor: '#FFE259',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textColumn: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  bannerDesc: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 15,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE259',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  updateBtnText: {
    color: '#040406',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  laterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  laterBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 2,
  },
});
