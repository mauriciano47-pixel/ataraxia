import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { styles } from '@/styles/transformation.styles';
import { logger } from '@/utils/logger';
import { useDailyLog } from '@/hooks/useDailyLog';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import {
  BodyZone,
  BODY_ZONES_INFO,
  BodySnapshot,
} from '@/types/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COMPRESSION_MAX_DIMENSION = 1280;
const COMPRESSION_QUALITY = 0.82;

async function compressImageToWebBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > COMPRESSION_MAX_DIMENSION) {
            height = Math.round((height * COMPRESSION_MAX_DIMENSION) / width);
            width = COMPRESSION_MAX_DIMENSION;
          }
        } else {
          if (height > COMPRESSION_MAX_DIMENSION) {
            width = Math.round((width * COMPRESSION_MAX_DIMENSION) / height);
            height = COMPRESSION_MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function TransformationScreen() {
  const { log, bodySnapshots, addBodySnapshot, deleteBodySnapshot } = useDailyLog();

  const cycle = log.monthlyCycle || {
    currentDay: 1,
    path: 'spartan',
    tier: 'Novicio de Esparta',
  };

  const currentDayNumber = cycle.currentDay || 1;
  const currentWeight = log.userMetrics?.weightKg || log.prokoptonProfile?.weightKg || 75;

  // Estados de modales y filtros
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<BodyZone>('full_front');
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filtro de galería
  const [galleryFilterZone, setGalleryFilterZone] = useState<BodyZone | 'all'>('all');

  // Lightbox modal
  const [lightboxSnapshot, setLightboxSnapshot] = useState<BodySnapshot | null>(null);

  // Estados para el comparador Día 1 vs Día 30
  const [comparatorZone, setComparatorZone] = useState<BodyZone | 'all'>('all');
  const [beforeSnapshotId] = useState<string | null>(null);
  const [afterSnapshotId] = useState<string | null>(null);

  const fileInputRef = useRef<any>(null);

  // Filtrado de fotos
  const filteredSnapshots = bodySnapshots.filter((s) => {
    if (galleryFilterZone === 'all') return true;
    return s.bodyZone === galleryFilterZone;
  });

  // Fotos para el comparador
  const comparatorAvailableSnapshots = bodySnapshots.filter((s) => {
    if (comparatorZone === 'all') return true;
    return s.bodyZone === comparatorZone;
  });

  // Orden cronológico (más antiguas primero para el "Antes", más nuevas para el "Después")
  const chronologicalSnapshots = [...comparatorAvailableSnapshots].sort(
    (a, b) => a.dayNumber - b.dayNumber || a.createdAt - b.createdAt
  );

  const defaultBefore = chronologicalSnapshots[0] || null;
  const defaultAfter =
    chronologicalSnapshots.length > 1
      ? chronologicalSnapshots[chronologicalSnapshots.length - 1]
      : null;

  const activeBefore =
    chronologicalSnapshots.find((s) => s.id === beforeSnapshotId) || defaultBefore;
  const activeAfter =
    chronologicalSnapshots.find((s) => s.id === afterSnapshotId) || defaultAfter;

  const handleOpenCaptureModal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCapturedBase64(null);
    setNotes('');
    setIsCaptureModalOpen(true);
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (Platform.OS === 'web') {
        const compressed = await compressImageToWebBase64(file);
        setCapturedBase64(compressed);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCapturedBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      logger.warn('Error al procesar fotografía:', err);
    }
  };

  const handleTriggerFileInput = async () => {
    if (Platform.OS === 'web') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso Denegado', 'Se requiere acceso a la galería para subir fotografías de tu escultura.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.82,
          base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          if (asset.base64) {
            setCapturedBase64(`data:image/jpeg;base64,${asset.base64}`);
          } else if (asset.uri) {
            setCapturedBase64(asset.uri);
          }
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
        }
      } catch (err) {
        logger.warn('Error al seleccionar imagen nativa:', err);
      }
    }
  };

  const handleSaveSnapshot = async () => {
    if (!capturedBase64) {
      if (Platform.OS === 'web') {
        window.alert('Por favor selecciona o toma una fotografía primero.');
      } else {
        Alert.alert('Atención', 'Por favor selecciona o toma una fotografía primero.');
      }
      return;
    }

    setIsSaving(true);
    try {
      await addBodySnapshot({
        dayNumber: currentDayNumber,
        date: new Date().toISOString(),
        bodyZone: selectedZone,
        photoBase64: capturedBase64,
        weightKg: currentWeight,
        notes: notes.trim() || undefined,
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      setIsCaptureModalOpen(false);
      setCapturedBase64(null);
      setNotes('');
    } catch (e) {
      logger.warn('Error guardando snapshot:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await deleteBodySnapshot(id);
    if (lightboxSnapshot?.id === id) {
      setLightboxSnapshot(null);
    }
  };

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          overScrollMode="never"
        >
          
          {/* HEADER PRINCIPAL */}
          <View style={styles.header}>
            <View style={styles.badgeTier}>
              <ThemedText style={styles.badgeTierText}>
                🏛️ REGISTRO DE ESCULTURA • 30 DÍAS
              </ThemedText>
            </View>
            <ThemedText style={styles.title}>ESPEJO & EVOLUCIÓN</ThemedText>
            <ThemedText style={styles.subtitle}>
              DÍA {currentDayNumber}/30 • {bodySnapshots.length} {bodySnapshots.length === 1 ? 'FOTO' : 'FOTOS'} EN EL TEMPLO
            </ThemedText>
          </View>

          {/* BOTÓN CTA PRINCIPAL PARA CAPTURAR */}
          <TouchableOpacity
            style={styles.ctaCaptureBtn}
            activeOpacity={0.85}
            onPress={handleOpenCaptureModal}
          >
            <LinearGradient
              colors={['#D4AF37', '#F59E0B', '#B45309']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaCaptureGradient}
            >
              <ThemedText style={{ fontSize: 20 }}>📸</ThemedText>
              <View>
                <ThemedText style={styles.ctaCaptureText}>
                  REGISTRAR ESCULTURA DE HOY (DÍA {currentDayNumber})
                </ThemedText>
                <ThemedText style={styles.ctaCaptureSub}>
                  Captura tu progreso por zona muscular para el juicio final
                </ThemedText>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* 1. SECCIÓN COMPARADOR ANTES VS DESPUÉS */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.sectionBadge}>
                <ThemedText style={styles.sectionBadgeText}>⚖️ JUICIO VISUAL</ThemedText>
              </View>
              <ThemedText style={styles.cardHeaderTitle}>COMPARADOR 30 DÍAS</ThemedText>
            </View>

            <ThemedText style={styles.comparatorDesc}>
              Compara tu punto de partida con tu estado actual para contemplar la forja de tu templo corporal.
            </ThemedText>

            {/* Selector de zona para el comparador */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              <TouchableOpacity
                style={[styles.zoneChip, comparatorZone === 'all' && styles.zoneChipActive]}
                onPress={() => setComparatorZone('all')}
              >
                <ThemedText style={[styles.zoneChipText, comparatorZone === 'all' && styles.zoneChipTextActive]}>
                  🌐 Todas las Zonas
                </ThemedText>
              </TouchableOpacity>
              {Object.keys(BODY_ZONES_INFO).map((key) => {
                const z = BODY_ZONES_INFO[key as BodyZone];
                const isActive = comparatorZone === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.zoneChip, isActive && styles.zoneChipActive]}
                    onPress={() => setComparatorZone(key as BodyZone)}
                  >
                    <ThemedText style={[styles.zoneChipText, isActive && styles.zoneChipTextActive]}>
                      {z.icon} {z.shortName}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* VISTA COMPARADORA DUAL */}
            {activeBefore && activeAfter && activeBefore.id !== activeAfter.id ? (
              <View style={styles.comparatorDualContainer}>
                {/* LADO A: ANTES */}
                <View style={styles.comparatorSide}>
                  <View style={styles.sideHeaderBadge}>
                    <ThemedText style={styles.sideBadgeText}>
                      DÍA {activeBefore.dayNumber} (INICIO)
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setLightboxSnapshot(activeBefore)}
                    style={styles.comparatorImageWrapper}
                  >
                    <Image source={{ uri: activeBefore.photoBase64 }} style={styles.comparatorImage} />
                  </TouchableOpacity>
                  <ThemedText style={styles.sideMetaText}>
                    {BODY_ZONES_INFO[activeBefore.bodyZone]?.icon} {BODY_ZONES_INFO[activeBefore.bodyZone]?.shortName} • {activeBefore.weightKg || '--'} kg
                  </ThemedText>
                </View>

                {/* DIVISOR DORADO */}
                <View style={styles.comparatorDivider}>
                  <ThemedText style={styles.dividerVsText}>VS</ThemedText>
                </View>

                {/* LADO B: DESPUÉS */}
                <View style={styles.comparatorSide}>
                  <View style={[styles.sideHeaderBadge, styles.sideHeaderBadgeAfter]}>
                    <ThemedText style={[styles.sideBadgeText, { color: '#6EE7B7' }]}>
                      DÍA {activeAfter.dayNumber} (ACTUAL)
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setLightboxSnapshot(activeAfter)}
                    style={styles.comparatorImageWrapper}
                  >
                    <Image source={{ uri: activeAfter.photoBase64 }} style={styles.comparatorImage} />
                  </TouchableOpacity>
                  <ThemedText style={styles.sideMetaText}>
                    {BODY_ZONES_INFO[activeAfter.bodyZone]?.icon} {BODY_ZONES_INFO[activeAfter.bodyZone]?.shortName} • {activeAfter.weightKg || '--'} kg
                  </ThemedText>
                </View>
              </View>
            ) : (
              <View style={styles.emptyComparatorBox}>
                <ThemedText style={{ fontSize: 32 }}>🏛️</ThemedText>
                <ThemedText style={styles.emptyComparatorTitle}>
                  {bodySnapshots.length === 0
                    ? 'Aún no has registrado tu primera fotografía'
                    : 'Registra al menos 2 fotografías para activar la comparación'}
                </ThemedText>
                <ThemedText style={styles.emptyComparatorDesc}>
                  Captura una foto de partida (Día 1) y otra en tus días de entreno. Al llegar al Día 30, verás aquí el cambio total de tu cuerpo.
                </ThemedText>
              </View>
            )}
          </View>

          {/* 2. SECCIÓN GALERÍA DE ESCULTURAS */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.sectionBadge}>
                <ThemedText style={styles.sectionBadgeText}>🖼️ GALERÍA SACRA</ThemedText>
              </View>
              <ThemedText style={styles.cardHeaderTitle}>REGISTROS DEL CICLO</ThemedText>
            </View>

            {/* FILTROS DE GALERÍA */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              <TouchableOpacity
                style={[styles.zoneChip, galleryFilterZone === 'all' && styles.zoneChipActive]}
                onPress={() => setGalleryFilterZone('all')}
              >
                <ThemedText style={[styles.zoneChipText, galleryFilterZone === 'all' && styles.zoneChipTextActive]}>
                  Todas ({bodySnapshots.length})
                </ThemedText>
              </TouchableOpacity>
              {Object.keys(BODY_ZONES_INFO).map((key) => {
                const z = BODY_ZONES_INFO[key as BodyZone];
                const count = bodySnapshots.filter((s) => s.bodyZone === key).length;
                const isActive = galleryFilterZone === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.zoneChip, isActive && styles.zoneChipActive]}
                    onPress={() => setGalleryFilterZone(key as BodyZone)}
                  >
                    <ThemedText style={[styles.zoneChipText, isActive && styles.zoneChipTextActive]}>
                      {z.icon} {z.shortName} ({count})
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* CUADRÍCULA DE FOTOS */}
            {filteredSnapshots.length > 0 ? (
              <View style={styles.galleryGrid}>
                {filteredSnapshots.map((snap) => {
                  const zoneInfo = BODY_ZONES_INFO[snap.bodyZone] || BODY_ZONES_INFO.full_front;
                  const dateFormatted = snap.date ? new Date(snap.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '';
                  return (
                    <TouchableOpacity
                      key={snap.id}
                      style={styles.galleryCard}
                      activeOpacity={0.85}
                      onPress={() => setLightboxSnapshot(snap)}
                    >
                      <Image source={{ uri: snap.photoBase64 }} style={styles.galleryCardImage} />
                      <LinearGradient
                        colors={['transparent', 'rgba(5, 5, 7, 0.95)']}
                        style={styles.galleryCardOverlay}
                      >
                        <View style={styles.galleryCardBadgeRow}>
                          <View style={styles.dayTagBadge}>
                            <ThemedText style={styles.dayTagText}>DÍA {snap.dayNumber}</ThemedText>
                          </View>
                          <ThemedText style={styles.galleryZoneTag}>
                            {zoneInfo.icon} {zoneInfo.shortName}
                          </ThemedText>
                        </View>
                        <View style={styles.galleryCardFooter}>
                          <ThemedText style={styles.galleryDateText}>{dateFormatted}</ThemedText>
                          {snap.weightKg ? (
                            <ThemedText style={styles.galleryWeightText}>{snap.weightKg} kg</ThemedText>
                          ) : null}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyGalleryBox}>
                <ThemedText style={{ fontSize: 28 }}>📷</ThemedText>
                <ThemedText style={styles.emptyGalleryText}>
                  No hay fotografías registradas en esta categoría.
                </ThemedText>
              </View>
            )}
          </View>

          {/* MODAL DE CAPTURA & REGISTRO */}
          <Modal
            visible={isCaptureModalOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setIsCaptureModalOpen(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.captureModalCard}>
                <View style={styles.captureModalHeader}>
                  <ThemedText style={styles.captureModalTitle}>📸 REGISTRO DE ESCULTURA</ThemedText>
                  <TouchableOpacity onPress={() => setIsCaptureModalOpen(false)} style={styles.closeModalCircle}>
                    <ThemedText style={{ color: '#94A3B8', fontWeight: 'bold' }}>✕</ThemedText>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                  <ThemedText style={styles.modalFieldLabel}>1. SELECCIONA LA ZONA CORPORAL:</ThemedText>
                  <View style={styles.zoneSelectorGrid}>
                    {Object.keys(BODY_ZONES_INFO).map((key) => {
                      const z = BODY_ZONES_INFO[key as BodyZone];
                      const isSelected = selectedZone === key;
                      return (
                        <TouchableOpacity
                          key={key}
                          style={[styles.modalZoneChip, isSelected && styles.modalZoneChipSelected]}
                          onPress={() => setSelectedZone(key as BodyZone)}
                        >
                          <ThemedText style={styles.modalZoneIcon}>{z.icon}</ThemedText>
                          <ThemedText style={[styles.modalZoneName, isSelected && styles.modalZoneNameSelected]}>
                            {z.shortName}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <ThemedText style={styles.zoneDescriptionText}>
                    💡 {BODY_ZONES_INFO[selectedZone]?.description}
                  </ThemedText>

                  <ThemedText style={styles.modalFieldLabel}>2. FOTOGRAFÍA (CÁMARA O GALERÍA):</ThemedText>
                  
                  {/* INPUT HTML OCULTO PARA WEB */}
                  {Platform.OS === 'web' && (
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  )}

                  {capturedBase64 ? (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: capturedBase64 }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.retakeBtn}
                        onPress={handleTriggerFileInput}
                      >
                        <ThemedText style={styles.retakeBtnText}>🔄 CAMBIAR FOTO</ThemedText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.takePhotoBox}
                      activeOpacity={0.8}
                      onPress={handleTriggerFileInput}
                    >
                      <ThemedText style={{ fontSize: 36 }}>📷</ThemedText>
                      <ThemedText style={styles.takePhotoTitle}>TOCAR PARA ABRIR CÁMARA O GALERÍA</ThemedText>
                      <ThemedText style={styles.takePhotoSub}>
                        Compresión óptica automática de alta definición (~200KB)
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  <ThemedText style={styles.modalFieldLabel}>3. NOTAS / SENSACIÓN MUSCULAR (OPCIONAL):</ThemedText>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Ej. Buena congestión tras press, definición visible en hombros..."
                    placeholderTextColor="#64748B"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                  />

                  <View style={styles.metaRowInfo}>
                    <ThemedText style={styles.metaRowText}>📅 Día del Ciclo: <ThemedText style={{ color: '#FFE259', fontWeight: 'bold' }}>Día {currentDayNumber}/30</ThemedText></ThemedText>
                    <ThemedText style={styles.metaRowText}>⚖️ Peso: <ThemedText style={{ color: '#38BDF8', fontWeight: 'bold' }}>{currentWeight} kg</ThemedText></ThemedText>
                  </View>

                  <TouchableOpacity
                    style={styles.saveSnapshotBtn}
                    activeOpacity={0.85}
                    onPress={handleSaveSnapshot}
                    disabled={isSaving}
                  >
                    <LinearGradient
                      colors={['#059669', '#10B981', '#047857']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.saveSnapshotGradient}
                    >
                      <ThemedText style={styles.saveSnapshotBtnText}>
                        {isSaving ? 'GUARDANDO...' : '⚔️ CONSERVAR ESCULTURA EN EL TEMPLO'}
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* LIGHTBOX MODAL (PANTALLA COMPLETA) */}
          <Modal
            visible={Boolean(lightboxSnapshot)}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setLightboxSnapshot(null)}
          >
            <View style={styles.lightboxBackdrop}>
              {lightboxSnapshot ? (
                <View style={styles.lightboxCard}>
                  <View style={styles.lightboxHeader}>
                    <View>
                      <ThemedText style={styles.lightboxDayText}>
                        DÍA {lightboxSnapshot.dayNumber} • {BODY_ZONES_INFO[lightboxSnapshot.bodyZone]?.name}
                      </ThemedText>
                      <ThemedText style={styles.lightboxDateText}>
                        {new Date(lightboxSnapshot.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })} • {lightboxSnapshot.weightKg} kg
                      </ThemedText>
                    </View>
                    <TouchableOpacity onPress={() => setLightboxSnapshot(null)} style={styles.closeModalCircle}>
                      <ThemedText style={{ color: '#FFFFFF', fontWeight: 'bold' }}>✕</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.lightboxImageContainer}>
                    <Image
                      source={{ uri: lightboxSnapshot.photoBase64 }}
                      style={styles.lightboxImage}
                      resizeMode="contain"
                    />
                  </View>

                  {lightboxSnapshot.notes ? (
                    <View style={styles.lightboxNotesBox}>
                      <ThemedText style={styles.lightboxNotesText}>
                        📝 "{lightboxSnapshot.notes}"
                      </ThemedText>
                    </View>
                  ) : null}

                  <View style={styles.lightboxActionsRow}>
                    <TouchableOpacity
                      style={styles.deletePhotoBtn}
                      onPress={() => handleDeleteSnapshot(lightboxSnapshot.id)}
                    >
                      <ThemedText style={styles.deletePhotoText}>🗑️ ELIMINAR FOTO</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.closeLightboxBtn}
                      onPress={() => setLightboxSnapshot(null)}
                    >
                      <ThemedText style={styles.closeLightboxText}>CERRAR VISOR</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          </Modal>

        </ScrollView>
      </SafeAreaView>
    </PearlElectricBackground>
  );
}

