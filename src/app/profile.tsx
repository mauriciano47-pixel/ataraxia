import { StyleSheet, View, Switch, TouchableOpacity, Image, Modal, TextInput, ScrollView, Alert, Platform, Clipboard, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { auth } from '@/lib/firebase';
import { useDailyLog } from '@/hooks/useDailyLog';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { StoicOnboardingModal } from '@/components/StoicOnboardingModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { LockedDiplomaModal } from '@/components/LockedDiplomaModal';
import { styles } from '@/styles/profile.styles';
import { GreekParchmentPact } from '@/components/GreekParchmentPact';
import { LegendaryPathSelector } from '@/components/LegendaryPathSelector';
import { COACH_ARCHETYPES, CoachArchetype } from '@/types/onboarding';
import { HonorDiplomaModal } from '@/components/HonorDiplomaModal';
import { GuardianInviteModal } from '@/components/GuardianInviteModal';

const STOIC_PRESET_AVATARS = [
  { id: 'marcus', name: 'Marco Aurelio', uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Marcus_Aurelius_Louvre_MR561_n02.jpg/330px-Marcus_Aurelius_Louvre_MR561_n02.jpg' },
  { id: 'seneca', name: 'Séneca', uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Seneca_Prado.jpg/330px-Seneca_Prado.jpg' },
  { id: 'epictetus', name: 'Epicteto', uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Epicteti_Enchiridion_Latin_1596.jpg/330px-Epicteti_Enchiridion_Latin_1596.jpg' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { log, setStoicAvatar, saveFullProfile, setCoachArchetype, selectLegendaryPath, resetOnboarding, resetMonthlyCycle } = useDailyLog();

  const [mementoMoriEnabled, setMementoMoriEnabled] = useState(true);
  const [fastingEnabled, setFastingEnabled] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showParchmentModal, setShowParchmentModal] = useState(false);
  const [showPathModal, setShowPathModal] = useState(false);
  const [showDiplomaModal, setShowDiplomaModal] = useState(false);
  const [showLockedDiplomaModal, setShowLockedDiplomaModal] = useState(false);
  const [showGuardianInviteModal, setShowGuardianInviteModal] = useState(false);

  const metrics = log.userMetrics || { weightKg: 75, heightCm: 175, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'maintenance' };
  const [nameInput, setNameInput] = useState(log.userName || 'Ciudadano Prokopton');
  const [emailInput, setEmailInput] = useState(log.userEmail || '');
  const [ageInput, setAgeInput] = useState((metrics?.age ?? 28).toString());
  const [weightInput, setWeightInput] = useState((metrics?.weightKg ?? 75).toString());
  const [heightInput, setHeightInput] = useState((metrics?.heightCm ?? 175).toString());
  const [targetCalInput, setTargetCalInput] = useState((log?.targetCalories || 2200).toString());
  const [targetStepInput, setTargetStepInput] = useState((log?.stepGoal || 10000).toString());

  const cycle = log.monthlyCycle;
  const currentDay = cycle?.currentDay || 1;
  const isDay30Reached = currentDay >= 30 || Boolean(cycle?.isJudgmentReady);
  const passedDays = cycle?.passedDaysCount ?? (cycle?.dailyGrades?.filter((g) => g.score >= 75).length || 0);
  const adherencePct = Math.round((passedDays / 30) * 100);
  const isAboveThreshold = adherencePct >= 80;
  const isDiplomaUnlocked = isDay30Reached && isAboveThreshold;

  const uid = auth?.currentUser?.uid || null;
  const shortUid = uid ? uid.substring(0, 8) : '????????';

  type FirebaseStatus = 'online' | 'offline' | 'no_config' | 'checking';
  const firebaseStatus: FirebaseStatus = !auth ? 'no_config' : uid ? 'online' : 'offline';

  const handleOpenEditModal = () => {
    const currentMetrics = log.userMetrics || { weightKg: 75, heightCm: 175, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'maintenance' };
    setNameInput(log.userName || 'Ciudadano Prokopton');
    setEmailInput(log.userEmail || '');
    setAgeInput((currentMetrics?.age ?? 28).toString());
    setWeightInput((currentMetrics?.weightKg ?? 75).toString());
    setHeightInput((currentMetrics?.heightCm ?? 175).toString());
    setTargetCalInput((log?.targetCalories || 2200).toString());
    setTargetStepInput((log?.stepGoal || 10000).toString());
    setShowEditModal(true);
  };

  const handleCopyUID = useCallback(() => {
    if (!uid) return;
    if (Platform.OS === 'web') {
      navigator.clipboard?.writeText(uid).catch(() => {});
    } else {
      Clipboard.setString(uid);
    }
    Alert.alert('ID Copiado', 'Tu ID de Guardián ha sido copiado al portapapeles.');
  }, [uid]);

  const statusConfig: Record<FirebaseStatus, { label: string; color: string; icon: 'checkmark-circle' | 'close-circle' | 'warning' | 'time' }> = {
    online:    { label: 'SINCRONIZADO CON LA NUBE', color: '#D4AF37', icon: 'checkmark-circle' },
    offline:   { label: 'SIN CONEXIÓN (MODO LOCAL)', color: '#FF9800', icon: 'warning' },
    no_config: { label: 'FIREBASE NO CONFIGURADO',  color: '#FF453A', icon: 'close-circle' },
    checking:  { label: 'VERIFICANDO...',            color: '#888',    icon: 'time' },
  };
  const status = statusConfig[firebaseStatus];

  const handlePickAvatarPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permiso requerido", "Se requiere acceso a la galería para subir tu foto estoica.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setStoicAvatar(result.assets[0].uri);
        Alert.alert("Foto Estoica Actualizada", "Tu avatar ha sido guardado correctamente.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo actualizar la foto de perfil.");
    }
  };

  const handleSaveProfile = () => {
    const age = parseInt(ageInput, 10) || metrics.age;
    const weight = parseFloat(weightInput) || metrics.weightKg;
    const height = parseFloat(heightInput) || metrics.heightCm;
    const cals = parseInt(targetCalInput, 10) || 2200;
    const steps = parseInt(targetStepInput, 10) || 10000;

    saveFullProfile({
      userName: nameInput.trim() || 'Ciudadano Prokopton',
      userEmail: emailInput.trim(),
      targetCalories: cals,
      stepGoal: steps,
      age,
      weightKg: weight,
      heightCm: height,
    });

    setShowEditModal(false);
    Alert.alert("Perfil Calibrado", "Tus datos biométricos han sido actualizados con éxito.");
  };

  const handleDestroyEgo = () => {
    const executeWipe = () => {
      // 1. Limpiar todo el almacenamiento local de Ataraxia
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && (key.startsWith('ataraxia') || key.startsWith('stoic') || key.startsWith('daily_log') || key.startsWith('fasting'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      }

      // 2. Resetear Onboarding y Ciclo en Contexto
      if (resetOnboarding) resetOnboarding();
      if (resetMonthlyCycle) resetMonthlyCycle();

      // 3. Redirigir al inicio del Templo (Papiro Sagrado)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.replace('/');
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(
        '🔥 DESTRUCCIÓN DEL EGO: ¿Estás seguro de purificar todos tus registros?\n\nSe borrarán tus datos biométricos, racha, senda y pacto para renacer desde cero absoluto.'
      );
      if (confirmed) {
        executeWipe();
      }
    } else {
      Alert.alert(
        '🔥 Destruir Ego',
        '¿Estás seguro de purificar todos tus registros? Se borrarán tus datos, racha y pacto para comenzar de nuevo desde el Día 1.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Destruir y Renacer',
            style: 'destructive',
            onPress: executeWipe,
          },
        ]
      );
    }
  };

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          overScrollMode="never"
        >
          
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 6 }}>
              <TouchableOpacity
                onPress={() => router.navigate('/')}
                style={styles.backBtn}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.backBtnText}>← Volver al Santuario</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.label}>⚡ TEMPLO PERSONAL</ThemedText>
            </View>
            <ThemedText style={styles.title}>Perfil Estoico</ThemedText>
          </View>

          {/* Avatar Hero Card */}
          <View style={styles.avatarHeroCard}>
            <TouchableOpacity onPress={handlePickAvatarPhoto} activeOpacity={0.8} style={styles.avatarContainer}>
              {log.stoicAvatarUri ? (
                <Image source={{ uri: log.stoicAvatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
                  <Ionicons name="person" size={44} color="#D4AF37" />
                </View>
              )}
              <View style={[styles.cameraBadge, { backgroundColor: '#D4AF37' }]}>
                <Ionicons name="camera" size={14} color="#050507" />
              </View>
            </TouchableOpacity>

            <ThemedText style={styles.userNameText}>{log.userName || "Ciudadano Prokopton"}</ThemedText>
            <ThemedText style={styles.userRoleText}>🏛️ Filósofo Práctico & Guerrero Imperial</ThemedText>

            {/* Presets de Filósofos */}
            <View style={styles.presetRow}>
              <ThemedText style={styles.presetLabel}>Avatares de Sabiduría:</ThemedText>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                {STOIC_PRESET_AVATARS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.presetChip}
                    onPress={() => setStoicAvatar(p.uri)}
                  >
                    <ThemedText style={[styles.presetChipText, { color: '#FDE68A' }]}>{p.name}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* CÁMARAS DEL TEMPLO & ARCHIVOS (ACCESOS RÁPIDOS) */}
          <View style={styles.templeChambersCard}>
            <ThemedText style={styles.templeChambersTitle}>🏛️ CÁMARAS DEL TEMPLO & ARCHIVOS</ThemedText>
            <View style={styles.chambersGrid}>
              <TouchableOpacity
                style={styles.chamberBtn}
                onPress={() => router.push('/transformation')}
                activeOpacity={0.8}
              >
                <ThemedText style={{ fontSize: 22, marginBottom: 3 }}>📸</ThemedText>
                <ThemedText style={styles.chamberBtnText}>Escultura</ThemedText>
                <ThemedText style={styles.chamberBtnSub}>Progreso Visual</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chamberBtn}
                onPress={() => router.push('/archon')}
                activeOpacity={0.8}
              >
                <ThemedText style={{ fontSize: 22, marginBottom: 3 }}>👑</ThemedText>
                <ThemedText style={styles.chamberBtnText}>Trono Arconte</ThemedText>
                <ThemedText style={styles.chamberBtnSub}>Decretos & Censo</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chamberBtn}
                onPress={() => router.push('/about')}
                activeOpacity={0.8}
              >
                <ThemedText style={{ fontSize: 22, marginBottom: 3 }}>ℹ️</ThemedText>
                <ThemedText style={styles.chamberBtnText}>Manifiesto</ThemedText>
                <ThemedText style={styles.chamberBtnSub}>Filosofía Templo</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* MÓDULO DE DISTINCIÓN DE RANGO, DIPLOMA DE HONOR & FASE II COMING SOON */}
          <View style={styles.condecorationCard}>
            <View style={styles.condecorationHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <ThemedText style={{ fontSize: 26 }}>{isDiplomaUnlocked ? '👑' : '🔒'}</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.condecorationTag}>
                    {isDiplomaUnlocked ? 'DISTINCIÓN OFICIAL DEL OLIMPO' : 'EVALUACIÓN DE 30 DÍAS EN CURSO'}
                  </ThemedText>
                  <ThemedText style={styles.condecorationRankTitle}>
                    {isDiplomaUnlocked ? (cycle?.tier || 'Novicio de Esparta') : 'Diploma en Evaluación'}
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.condecorationBadge, isDiplomaUnlocked ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' } : { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B' }]}>
                <ThemedText style={[styles.condecorationBadgeText, isDiplomaUnlocked ? { color: '#34D399' } : { color: '#F59E0B' }]}>
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
                onPress={() => setShowDiplomaModal(true)}
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
                onPress={() => setShowLockedDiplomaModal(true)}
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

          <ThemedText style={styles.description}>
            &quot;Ningún hombre es libre si no es dueño de sí mismo.&quot; — Epicteto
          </ThemedText>

          {/* Sección de Identidad Biométrica */}
          <ThemedView style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <ThemedText style={styles.sectionTitle}>BIOMETRÍA Y METAS ESTOICAS</ThemedText>
              <TouchableOpacity onPress={handleOpenEditModal}>
                <ThemedText style={{ fontSize: 12, color: '#FFE259', fontWeight: 'bold', fontFamily: 'monospace' }}>Editar</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.row}>
              <ThemedText style={styles.rowLabel}>Edad</ThemedText>
              <ThemedText style={styles.rowValue}>{metrics.age} años</ThemedText>
            </View>

            <View style={styles.row}>
              <ThemedText style={styles.rowLabel}>Peso Corporal</ThemedText>
              <ThemedText style={styles.rowValue}>{metrics.weightKg} kg</ThemedText>
            </View>

            <View style={styles.row}>
              <ThemedText style={styles.rowLabel}>Altura</ThemedText>
              <ThemedText style={styles.rowValue}>{metrics.heightCm} cm</ThemedText>
            </View>

            <View style={styles.row}>
              <ThemedText style={styles.rowLabel}>Meta Calórica Diaria</ThemedText>
              <ThemedText style={[styles.rowValue, { color: '#FFE259', fontWeight: 'bold' }]}>{log.targetCalories || 2200} kcal</ThemedText>
            </View>

            <View style={styles.row}>
              <ThemedText style={styles.rowLabel}>Meta de Pasos Diarios</ThemedText>
              <ThemedText style={[styles.rowValue, { color: '#FFE259', fontWeight: 'bold' }]}>{log.stepGoal || 10000} pasos</ThemedText>
            </View>

            {log.prokoptonProfile && (
              <>
                <View style={styles.row}>
                  <ThemedText style={styles.rowLabel}>Enfoque del Prokopton</ThemedText>
                  <ThemedText style={[styles.rowValue, { color: '#FFE259' }]}>
                    {log.prokoptonProfile.focus === 'strength' ? 'Fuerza & Masa' :
                     log.prokoptonProfile.focus === 'fat_loss' ? 'Recomposición' :
                     log.prokoptonProfile.focus === 'longevity' ? 'Longevidad' : 'Mente Estoica'}
                  </ThemedText>
                </View>
                <View style={styles.row}>
                  <ThemedText style={styles.rowLabel}>Equipo / Duración</ThemedText>
                  <ThemedText style={styles.rowValue}>
                    {log.prokoptonProfile.equipment === 'gym' ? 'Gimnasio' :
                     log.prokoptonProfile.equipment === 'home_dumbbell' ? 'Mancuernas' : 'Calistenia'} ({log.prokoptonProfile.sessionDurationMinutes} min)
                  </ThemedText>
                </View>
                <View style={styles.row}>
                  <ThemedText style={styles.rowLabel}>Frecuencia Semanal</ThemedText>
                  <ThemedText style={styles.rowValue}>{log.prokoptonProfile.daysPerWeek} días / sem</ThemedText>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.calibrateButton}
              onPress={() => setShowOnboardingModal(true)}
            >
              <ThemedText style={{ color: '#050507', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 }}>
                ⚡ CALIBRAR FICHA DEL PROKOPTON (ESCÁNER IA)
              </ThemedText>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.calibrateButton, { flex: 1, backgroundColor: 'rgba(212, 175, 55, 0.15)', borderWidth: 1, borderColor: '#D4AF37' }]}
                onPress={() => setShowParchmentModal(true)}
              >
                <ThemedText style={{ color: '#FFE259', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, textAlign: 'center' }}>
                  📜 RELEER EL PACTO
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.calibrateButton, { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.18)' }]}
                onPress={() => setShowPathModal(true)}
              >
                <ThemedText style={{ color: '#F1F5F9', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, textAlign: 'center' }}>
                  🏛️ CAMBIAR SENDA
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Sección Arquetipo del Coach I.A. */}
          <ThemedView style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <ThemedText style={styles.sectionTitle}>ARQUETIPO DEL COACH I.A.</ThemedText>
              <ThemedText style={{ fontSize: 9.5, color: '#D4AF37', fontFamily: 'monospace', fontWeight: 'bold' }}>ORÁCULO ACTIVO</ThemedText>
            </View>
            <ThemedText style={styles.hint}>
              Elige la personalidad, vocabulario y nivel de exigencia con la que el Coach te guiará.
            </ThemedText>

            <View style={{ gap: 8, marginTop: 10 }}>
              {(Object.keys(COACH_ARCHETYPES) as CoachArchetype[]).map((key) => {
                const item = COACH_ARCHETYPES[key];
                const isSelected = (log.coachArchetype || 'stoic_mentor') === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.archetypeOptionCard,
                      isSelected && styles.archetypeOptionCardSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setCoachArchetype(item.id);
                      Alert.alert("Arquetipo Actualizado", `El Coach ahora te guiará como ${item.name}.`);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={[styles.archetypeOptionIconRing, isSelected && { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.20)' }]}>
                        <ThemedText style={{ fontSize: 18 }}>{item.icon}</ThemedText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <ThemedText style={[styles.archetypeOptionName, isSelected && { color: '#FFE259' }]}>
                            {item.name}
                          </ThemedText>
                          {isSelected && (
                            <View style={styles.selectedPillBadge}>
                              <ThemedText style={styles.selectedPillText}>ACTIVO</ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText style={styles.archetypeOptionTagline}>{item.tagline}</ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ThemedView>

          {/* Sección de Preferencias */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>PREFERENCIAS DE DISCIPLINA</ThemedText>
            
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.rowLabel}>Memento Mori</ThemedText>
                <ThemedText style={styles.hint}>Recordatorio matutino de tu mortalidad.</ThemedText>
              </View>
              {/* @ts-ignore */}
              <Switch 
                value={mementoMoriEnabled} 
                onValueChange={setMementoMoriEnabled} 
                trackColor={{ false: '#334155', true: '#D4AF37' }}
                thumbColor={'#FFF'}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.rowLabel}>Ayuno Intermitente</ThemedText>
                <ThemedText style={styles.hint}>Ocultar calorías hasta el mediodía.</ThemedText>
              </View>
              {/* @ts-ignore */}
              <Switch 
                value={fastingEnabled} 
                onValueChange={setFastingEnabled} 
                trackColor={{ false: '#334155', true: '#D4AF37' }}
                thumbColor={'#FFF'}
              />
            </View>
          </ThemedView>

          {/* Sección Senda Legendaria & Juramento */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>SENDA & JURAMENTO SAGRADO</ThemedText>

            <TouchableOpacity 
              style={styles.actionRow}
              onPress={() => setShowPathModal(true)}
            >
              <View style={styles.actionRowLeft}>
                <Ionicons name="compass-outline" size={20} color="#FFE259" />
                <View>
                  <ThemedText style={styles.rowLabel}>Senda Legendaria Activa</ThemedText>
                  <ThemedText style={styles.hint}>
                    {log.legendaryPath === 'spartan' ? '⚔️ Senda del Espartano' :
                     log.legendaryPath === 'hoplite' ? '🛡️ Senda del Hoplita' :
                     log.legendaryPath === 'apollo' ? '⚡ Senda de Apolo' : '🧘‍♂️ Senda del Filósofo Guerrero'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.changeLinkText}>CAMBIAR</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionRow, { borderTopWidth: 1, borderTopColor: 'rgba(212, 175, 55, 0.15)', marginTop: 8, paddingTop: 10 }]}
              onPress={() => setShowParchmentModal(true)}
            >
              <View style={styles.actionRowLeft}>
                <Ionicons name="document-text-outline" size={20} color="#D4AF37" />
                <View>
                  <ThemedText style={styles.rowLabel}>Pacto del Templo de Ataraxia</ThemedText>
                  <ThemedText style={styles.hint}>Releer el juramento solemne y advertencias</ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
            </TouchableOpacity>
          </ThemedView>

          {/* Sección de Convocatoria de Guardianes */}
          <ThemedView style={[styles.section, { borderColor: 'rgba(212, 175, 55, 0.45)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <ThemedText style={styles.sectionTitle}>CONSEJO DE LOS 4 GUARDIANES</ThemedText>
              <View style={styles.guardianCuposBadge}>
                <ThemedText style={styles.guardianCuposText}>3 CUPOS DISPONIBLES</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.hint}>
              Genera y envía enlaces únicos a tus 3 compañeros para que configuren su propia biometría, senda y pacto desde el principio sin interferir con tus registros.
            </ThemedText>

            <TouchableOpacity
              style={styles.guardianInviteBtn}
              onPress={() => setShowGuardianInviteModal(true)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#D4AF37', '#FFE259', '#B45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.guardianInviteBtnGradient}
              >
                <Ionicons name="paper-plane" size={16} color="#050507" />
                <ThemedText style={styles.guardianInviteBtnText}>
                  ⚡ CONVOCAR & ENVIAR ENLACES A GUARDIANES
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>

          {/* Sección Estado del Guardián */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>ESTADO DEL GUARDIÁN</ThemedText>

            {/* Indicador de estado */}
            <View style={styles.statusBadge}>
              <Ionicons name={status.icon} size={16} color={status.color} />
              <ThemedText style={[styles.statusText, { color: status.color }]}>{status.label}</ThemedText>
            </View>

            {/* Llave Sagrada (Correo) */}
            <View style={styles.row}>
              <ThemedText style={styles.rowLabel}>Llave Sagrada (Correo)</ThemedText>
              <ThemedText style={[styles.rowValue, { color: '#FFE259', fontFamily: 'monospace', fontSize: 11 }]}>
                {log.userEmail || 'Sin registrar'}
              </ThemedText>
            </View>

            {/* UID Copiable */}
            <View style={styles.row}>
              <ThemedText style={styles.rowLabel}>ID del Guardián</ThemedText>
              <TouchableOpacity onPress={handleCopyUID} style={styles.uidButton}>
                <ThemedText style={styles.uidText}>#{shortUid}...</ThemedText>
                <Ionicons name="copy-outline" size={12} color="#D4AF37" />
              </TouchableOpacity>
            </View>

            {/* Advertencia sesión anónima */}
            <View style={styles.warningBox}>
              <Ionicons name="shield-outline" size={14} color="#F59E0B" style={{ marginTop: 1 }} />
              <ThemedText style={styles.warningText}>
                {'Tu sesión está vinculada a este templo y respaldada con tu Llave Sagrada.'}
              </ThemedText>
            </View>
          </ThemedView>



          {/* Sección Centro de Actualizaciones & Vitrina Oficial */}
          <ThemedView style={[styles.section, { borderColor: 'rgba(212, 175, 55, 0.40)', backgroundColor: 'rgba(10, 14, 26, 0.90)' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <ThemedText style={styles.sectionTitle}>ACTUALIZACIONES & APK OFICIAL</ThemedText>
              <View style={styles.guardianCuposBadge}>
                <ThemedText style={styles.guardianCuposText}>v4.4.0 OFICIAL</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.hint}>
              Obtén la última versión optimizada del APK para Android directamente desde el portal de descarga canónico o la Vitrina de Aplicaciones.
            </ThemedText>

            <View style={{ gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                style={styles.guardianInviteBtn}
                onPress={() => Linking.openURL('https://ataraxia-stoic.vercel.app/download.html')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#D4AF37', '#FFE259', '#B45309']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.guardianInviteBtnGradient}
                >
                  <Ionicons name="cloud-download-outline" size={16} color="#050507" />
                  <ThemedText style={styles.guardianInviteBtnText}>
                    📥 DESCARGAR / ACTUALIZAR APK OFICIAL
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.guardianInviteBtn, { marginTop: 4 }]}
                onPress={() => Linking.openURL('https://mauriciano47-pixel.github.io/vitrina/')}
                activeOpacity={0.85}
              >
                <View style={[styles.guardianInviteBtnGradient, { backgroundColor: 'rgba(212, 175, 55, 0.12)', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.35)' }]}>
                  <Ionicons name="globe-outline" size={16} color="#FFE259" />
                  <ThemedText style={[styles.guardianInviteBtnText, { color: '#FFE259' }]}>
                    🏛️ VER ATARAXIA EN LA VITRINA DE APPS
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Sección de Peligro */}
          <ThemedView style={[styles.section, { borderColor: 'rgba(239, 68, 68, 0.35)', marginTop: Spacing.two }]}>
            <TouchableOpacity style={styles.dangerButton} onPress={handleDestroyEgo} activeOpacity={0.8}>
              <Ionicons name="flame-outline" size={20} color="#FF453A" />
              <ThemedText style={styles.dangerText}>Destruir Ego (Reiniciar Datos)</ThemedText>
            </TouchableOpacity>
          </ThemedView>

        </ScrollView>

      {/* Modal para Editar Biometría & Datos */}
      {/* Modal para Editar Biometría & Datos */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        nameInput={nameInput}
        setNameInput={setNameInput}
        ageInput={ageInput}
        setAgeInput={setAgeInput}
        weightInput={weightInput}
        setWeightInput={setWeightInput}
        heightInput={heightInput}
        setHeightInput={setHeightInput}
        targetCalInput={targetCalInput}
        setTargetCalInput={setTargetCalInput}
        targetStepInput={targetStepInput}
        setTargetStepInput={setTargetStepInput}
        handleSaveProfile={handleSaveProfile}
        styles={styles}
      />

      {/* Modal de Onboarding / Escáner del Prokopton */}
      <StoicOnboardingModal
        visible={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={() => {
          setShowOnboardingModal(false);
          Alert.alert("⚡ Perfil Calibrado", "Tu plan estoico y biométrico ha sido configurado con éxito.");
        }}
      />

      {/* Modal para Releer el Papiro Griego del Juramento */}
      {showParchmentModal && (
        <View style={StyleSheet.absoluteFill}>
          <GreekParchmentPact
            isReviewMode={true}
            onClose={() => setShowParchmentModal(false)}
            onAcceptPact={() => setShowParchmentModal(false)}
          />
        </View>
      )}

      {/* Modal para Cambiar la Senda Legendaria */}
      {showPathModal && (
        <View style={StyleSheet.absoluteFill}>
          <LegendaryPathSelector onSelectPath={(newPath) => {
            selectLegendaryPath(newPath);
            setShowPathModal(false);
            Alert.alert("⚡ Senda Consagrada", `Has activado la senda con éxito.`);
          }} />
        </View>
      )}

      {/* Modal Informativo de Diploma Bloqueado */}
      {/* Modal Informativo de Diploma Bloqueado */}
      <LockedDiplomaModal
        visible={showLockedDiplomaModal}
        onClose={() => setShowLockedDiplomaModal(false)}
        isDay30Reached={isDay30Reached}
        currentDay={currentDay}
        isAboveThreshold={isAboveThreshold}
        adherencePercent={adherencePct}
        victoriousDays={passedDays}
        styles={styles}
      />

      {/* Modal del Diploma de Honor */}
      <HonorDiplomaModal
        visible={showDiplomaModal}
        onClose={() => setShowDiplomaModal(false)}
        userName={log.userName || 'Ciudadano Prokopton'}
        path={log.legendaryPath || 'spartan'}
        scoreAverage={cycle?.averageScore ?? 100}
        adherencePct={adherencePct}
        tier={cycle?.tier || 'Novicio de Esparta'}
        coachArchetype={log.coachArchetype || 'stoic_mentor'}
      />

      {/* Modal de Convocatoria de Guardianes */}
      <GuardianInviteModal
        visible={showGuardianInviteModal}
        onClose={() => setShowGuardianInviteModal(false)}
      />
      </SafeAreaView>
    </PearlElectricBackground>
  );
}

