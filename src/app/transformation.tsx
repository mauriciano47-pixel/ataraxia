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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
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
  const [beforeSnapshotId, setBeforeSnapshotId] = useState<string | null>(null);
  const [afterSnapshotId, setAfterSnapshotId] = useState<string | null>(null);

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
      console.warn('Error al procesar fotografía:', err);
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
      console.warn('Error guardando snapshot:', e);
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  badgeTier: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#FFE259',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeTierText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#D4AF37',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginTop: 2,
  },
  ctaCaptureBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  ctaCaptureGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaCaptureText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  ctaCaptureSub: {
    fontSize: 9.5,
    color: '#3B2800',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  cardContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#FFE259',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFE259',
    letterSpacing: 1,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  comparatorDesc: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  zoneChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  zoneChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#FFE259',
  },
  zoneChipText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  zoneChipTextActive: {
    color: '#FFE259',
  },
  comparatorDualContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5, 5, 7, 0.6)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  comparatorSide: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  sideHeaderBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sideHeaderBadgeAfter: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  sideBadgeText: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFE259',
  },
  comparatorImageWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#000000',
  },
  comparatorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sideMetaText: {
    fontSize: 9.5,
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
  comparatorDivider: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderWidth: 1,
    borderColor: '#FFE259',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerVsText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  emptyComparatorBox: {
    backgroundColor: 'rgba(5, 5, 7, 0.5)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyComparatorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  emptyComparatorDesc: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryCard: {
    width: (SCREEN_WIDTH - 32 - 32 - 10) / 2 > 160 ? (SCREEN_WIDTH - 32 - 32 - 10) / 2 : 160,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: '#000000',
  },
  galleryCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    justifyContent: 'flex-end',
    gap: 2,
  },
  galleryCardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTagBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  dayTagText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  galleryZoneTag: {
    fontSize: 8.5,
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
  galleryCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  galleryDateText: {
    fontSize: 8,
    color: '#94A3B8',
  },
  galleryWeightText: {
    fontSize: 8.5,
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  emptyGalleryBox: {
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyGalleryText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 8, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  captureModalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    gap: 12,
  },
  captureModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 10,
  },
  captureModalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  closeModalCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFieldLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D4AF37',
    fontFamily: 'monospace',
    marginTop: 10,
    marginBottom: 6,
  },
  zoneSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalZoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  modalZoneChipSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderColor: '#FFE259',
  },
  modalZoneIcon: {
    fontSize: 12,
  },
  modalZoneName: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  modalZoneNameSelected: {
    color: '#FFE259',
    fontWeight: 'bold',
  },
  zoneDescriptionText: {
    fontSize: 9.5,
    color: '#CBD5E1',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 13,
  },
  takePhotoBox: {
    backgroundColor: 'rgba(5, 5, 7, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  takePhotoTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  takePhotoSub: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    gap: 8,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  retakeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retakeBtnText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  notesInput: {
    backgroundColor: 'rgba(5, 5, 7, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderRadius: 10,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 11,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  metaRowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  metaRowText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  saveSnapshotBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 10,
  },
  saveSnapshotGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveSnapshotBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  lightboxCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    gap: 12,
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lightboxDayText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  lightboxDateText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  lightboxImageContainer: {
    width: '100%',
    height: 380,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },
  lightboxNotesBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    padding: 8,
  },
  lightboxNotesText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontStyle: 'italic',
  },
  lightboxActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  deletePhotoBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deletePhotoText: {
    fontSize: 10,
    color: '#FCA5A5',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  closeLightboxBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
  },
  closeLightboxText: {
    fontSize: 10.5,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});
