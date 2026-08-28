import { StyleSheet, View, Switch, TouchableOpacity, Image, Modal, TextInput, ScrollView, Alert, Platform, Clipboard } from 'react-native';
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
import { GreekParchmentPact } from '@/components/GreekParchmentPact';
import { LegendaryPathSelector } from '@/components/LegendaryPathSelector';
import { COACH_ARCHETYPES, CoachArchetype, LegendaryPath, LEGENDARY_PATHS } from '@/types/onboarding';
import { HonorDiplomaModal } from '@/components/HonorDiplomaModal';
import { lockTempleAccess } from '@/components/TempleAccessGate';

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

  const metrics = log.userMetrics || { weightKg: 75, heightCm: 175, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'maintenance' };
  const [nameInput, setNameInput] = useState(log.userName || 'Ciudadano Prokopton');
  const [emailInput, setEmailInput] = useState(log.userEmail || '');
  const [ageInput, setAgeInput] = useState(metrics.age.toString());
  const [weightInput, setWeightInput] = useState(metrics.weightKg.toString());
  const [heightInput, setHeightInput] = useState(metrics.heightCm.toString());
  const [targetCalInput, setTargetCalInput] = useState((log.targetCalories || 2200).toString());
  const [targetStepInput, setTargetStepInput] = useState((log.stepGoal || 10000).toString());

  const activePathKey = (log.legendaryPath as LegendaryPath) || 'spartan';
  const pathInfo = LEGENDARY_PATHS[activePathKey] || LEGENDARY_PATHS.spartan;
  const cycle = log.monthlyCycle;
  const passedDays = cycle?.passedDaysCount ?? (cycle?.dailyGrades?.filter((g) => g.score >= 75).length || 0);
  const adherencePct = Math.round((passedDays / 30) * 100);
  const isWorthyHonor = (cycle?.averageScore ?? 100) >= 80 || cycle?.tier === 'Semidiós del Olimpo' || cycle?.tier === 'Guerrero de Élite';

  const uid = auth?.currentUser?.uid || null;
  const shortUid = uid ? uid.substring(0, 8) : '????????';

  type FirebaseStatus = 'online' | 'offline' | 'no_config' | 'checking';
  const firebaseStatus: FirebaseStatus = !auth ? 'no_config' : uid ? 'online' : 'offline';

  const handleOpenEditModal = () => {
    const currentMetrics = log.userMetrics || { weightKg: 75, heightCm: 175, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'maintenance' };
    setNameInput(log.userName || 'Ciudadano Prokopton');
    setEmailInput(log.userEmail || '');
    setAgeInput(currentMetrics.age.toString());
    setWeightInput(currentMetrics.weightKg.toString());
    setHeightInput(currentMetrics.heightCm.toString());
    setTargetCalInput((log.targetCalories || 2200).toString());
    setTargetStepInput((log.stepGoal || 10000).toString());
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
      if (typeof window !== 'undefined') {
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
        <ScrollView contentContainerStyle={styles.content}>
          
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

          {/* MÓDULO DE DISTINCIÓN DE RANGO, DIPLOMA DE HONOR & FASE II COMING SOON */}
          <View style={styles.condecorationCard}>
            <View style={styles.condecorationHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <ThemedText style={{ fontSize: 26 }}>👑</ThemedText>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.condecorationTag}>DISTINCIÓN OFICIAL DEL OLIMPO</ThemedText>
                  <ThemedText style={styles.condecorationRankTitle}>
                    {cycle?.tier || 'Novicio de Esparta'}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.condecorationBadge}>
                <ThemedText style={styles.condecorationBadgeText}>
                  {(cycle?.averageScore ?? 100) >= 80 ? '80%+ HONOR' : 'EN CURSO'}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.condecorationDesc}>
              {(cycle?.averageScore ?? 100) >= 80
                ? '🎖️ Has completado el Ciclo con templanza superior. Tu perfil cuenta con acreditación oficial del Santuario.'
                : '⚔️ Mantén tu disciplina diaria por encima del 80% durante los 30 días para consagrar tu rango.'}
            </ThemedText>

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
                  📜 VER DIPLOMA DE HONOR ESTOICO
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>

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

          {/* Zona de Seguridad del Templo */}
          <ThemedView style={[styles.section, { borderColor: 'rgba(212, 175, 55, 0.35)', marginTop: Spacing.two }]}>
            <TouchableOpacity 
              style={[styles.dangerButton, { backgroundColor: 'rgba(212, 175, 55, 0.08)', borderColor: 'rgba(212, 175, 55, 0.3)' }]} 
              onPress={() => {
                Alert.alert(
                  "🔒 Bloquear Templo",
                  "¿Deseas cerrar el acceso en este dispositivo? Deberás ingresar la Llave Maestra para volver a entrar.",
                  [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Bloquear Ahora", style: "destructive", onPress: lockTempleAccess }
                  ]
                );
              }} 
              activeOpacity={0.8}
            >
              <Ionicons name="lock-closed-outline" size={18} color="#FFE259" />
              <ThemedText style={[styles.dangerText, { color: '#FFE259' }]}>Bloquear Templo (Cerrar Sesión Privada)</ThemedText>
            </TouchableOpacity>
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
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#0A0D16', borderColor: 'rgba(212, 175, 55, 0.45)' }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: '#FFE259' }]}>EDITAR BIOMETRÍA & DATOS</ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <ThemedText style={styles.inputLabel}>Correo Electrónico (Llave Sagrada)</ThemedText>
              <TextInput 
                style={[styles.input, { color: '#FFF', borderColor: 'rgba(212, 175, 55, 0.30)', backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="tu.correo@ejemplo.com"
                placeholderTextColor="rgba(212, 175, 55, 0.40)"
              />

              <ThemedText style={[styles.inputLabel, { marginTop: Spacing.two }]}>Nombre o Pseudónimo Estoico</ThemedText>
              <TextInput 
                style={[styles.input, { color: '#FFF', borderColor: 'rgba(212, 175, 55, 0.30)', backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}
                value={nameInput}
                onChangeText={setNameInput}
              />

              <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two }}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.inputLabel}>Edad</ThemedText>
                  <TextInput 
                    style={[styles.input, { color: '#FFF', borderColor: 'rgba(212, 175, 55, 0.30)', backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}
                    value={ageInput}
                    onChangeText={setAgeInput}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.inputLabel}>Peso (kg)</ThemedText>
                  <TextInput 
                    style={[styles.input, { color: '#FFF', borderColor: 'rgba(212, 175, 55, 0.30)', backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.inputLabel}>Altura (cm)</ThemedText>
                  <TextInput 
                    style={[styles.input, { color: '#FFF', borderColor: 'rgba(212, 175, 55, 0.30)', backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}
                    value={heightInput}
                    onChangeText={setHeightInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <ThemedText style={[styles.inputLabel, { marginTop: Spacing.three }]}>Meta Calórica Diaria (kcal)</ThemedText>
              <TextInput 
                style={[styles.input, { color: '#FFF', borderColor: 'rgba(212, 175, 55, 0.30)', backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}
                value={targetCalInput}
                onChangeText={setTargetCalInput}
                keyboardType="numeric"
              />

              <ThemedText style={[styles.inputLabel, { marginTop: Spacing.three }]}>Meta de Pasos Diarios</ThemedText>
              <TextInput 
                style={[styles.input, { color: '#FFF', borderColor: 'rgba(212, 175, 55, 0.30)', backgroundColor: 'rgba(212, 175, 55, 0.08)' }]}
                value={targetStepInput}
                onChangeText={setTargetStepInput}
                keyboardType="numeric"
              />
            </ScrollView>

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: '#D4AF37', marginTop: Spacing.three, borderRadius: 10 }]}
              onPress={handleSaveProfile}
            >
              <ThemedText style={{ color: '#050507', fontWeight: '900', fontFamily: 'monospace', fontSize: 13 }}>
                GUARDAR CAMBIOS
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
          <GreekParchmentPact onAcceptPact={() => setShowParchmentModal(false)} />
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

      {/* Modal del Diploma de Honor */}
      <HonorDiplomaModal
        visible={showDiplomaModal}
        onClose={() => setShowDiplomaModal(false)}
        userName={log.userName || 'Ciudadano Prokopton'}
        path={activePathKey}
        scoreAverage={cycle?.averageScore ?? 100}
        adherencePct={adherencePct}
        tier={cycle?.tier || 'Novicio de Esparta'}
      />
      </SafeAreaView>
    </PearlElectricBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  content: {
    paddingBottom: Spacing.six,
  },
  header: {
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#D4AF37',
    letterSpacing: 3,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 26,
    fontFamily: 'serif',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '900',
    color: '#FFE259',
  },
  avatarHeroCard: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 16,
    marginBottom: Spacing.three,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.two,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#050507',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginTop: 4,
    color: '#FFFFFF',
  },
  userRoleText: {
    fontSize: 11,
    color: '#D4AF37',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  presetRow: {
    marginTop: Spacing.three,
    alignItems: 'center',
  },
  presetLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#94A3B8',
  },
  presetChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderRadius: 6,
  },
  presetChipText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  description: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: Spacing.four,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  section: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#D4AF37',
    marginBottom: Spacing.three,
    fontFamily: 'monospace',
  },
  calibrateButton: {
    marginTop: 12,
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  rowValue: {
    fontSize: 14,
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  hint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
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
    fontSize: 14,
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderRadius: 6,
    marginBottom: Spacing.three,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  uidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  uidText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#FFE259',
    letterSpacing: 1,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.three,
    padding: Spacing.three,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderLeftWidth: 2,
    borderLeftColor: '#F59E0B',
    borderRadius: 4,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#FDE68A',
    lineHeight: 17,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 7, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: Spacing.four,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 4,
    color: '#D4AF37',
  },
  input: {
    borderWidth: 1,
    padding: Spacing.two,
    fontFamily: 'monospace',
    fontSize: 14,
    borderRadius: 8,
  },
  saveBtn: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  archetypeOptionCard: {
    backgroundColor: 'rgba(13, 17, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    borderRadius: 12,
    padding: Spacing.three,
  },
  archetypeOptionCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.5,
  },
  archetypeOptionIconRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archetypeOptionName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
  },
  selectedPillBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
  },
  archetypeOptionTagline: {
    fontSize: 10.5,
    color: '#CBD5E1',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  changeLinkText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  condecorationCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFE259',
    gap: 12,
    marginBottom: Spacing.four,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  condecorationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 10,
  },
  condecorationTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  condecorationRankTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  condecorationBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  condecorationBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  condecorationDesc: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  openDiplomaBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 2,
  },
  openDiplomaBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  openDiplomaBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  nextLevelCard: {
    backgroundColor: 'rgba(5, 5, 8, 0.75)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
    gap: 6,
    marginTop: 4,
  },
  nextLevelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextLevelIcon: {
    fontSize: 16,
  },
  nextLevelSubtitle: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    color: '#38BDF8',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  nextLevelTitleText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#F59E0B',
    fontFamily: 'monospace',
  },
  nextLevelBodyText: {
    fontSize: 9.5,
    color: '#94A3B8',
    lineHeight: 14,
  },
});
