import { StyleSheet, View, Switch, TouchableOpacity, Image, Modal, TextInput, ScrollView, Alert, Platform, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { auth } from '@/lib/firebase';
import { useDailyLog } from '@/hooks/useDailyLog';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { StoicOnboardingModal } from '@/components/StoicOnboardingModal';

const STOIC_PRESET_AVATARS = [
  { id: 'marcus', name: 'Marco Aurelio', uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Marcus_Aurelius_Louvre_MR561_n02.jpg/330px-Marcus_Aurelius_Louvre_MR561_n02.jpg' },
  { id: 'seneca', name: 'Séneca', uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Seneca_Prado.jpg/330px-Seneca_Prado.jpg' },
  { id: 'epictetus', name: 'Epicteto', uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Epicteti_Enchiridion_Latin_1596.jpg/330px-Epicteti_Enchiridion_Latin_1596.jpg' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { log, setStoicAvatar, saveFullProfile } = useDailyLog();

  const [mementoMoriEnabled, setMementoMoriEnabled] = useState(true);
  const [fastingEnabled, setFastingEnabled] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Editable fields
  const metrics = log.userMetrics || { weightKg: 75, heightCm: 175, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'maintenance' };
  const [nameInput, setNameInput] = useState(log.userName || 'Ciudadano Prokopton');
  const [ageInput, setAgeInput] = useState(metrics.age.toString());
  const [weightInput, setWeightInput] = useState(metrics.weightKg.toString());
  const [heightInput, setHeightInput] = useState(metrics.heightCm.toString());
  const [targetCalInput, setTargetCalInput] = useState((log.targetCalories || 2200).toString());
  const [targetStepInput, setTargetStepInput] = useState((log.stepGoal || 10000).toString());

  const uid = auth?.currentUser?.uid || null;
  const shortUid = uid ? uid.substring(0, 8) : '????????';

  type FirebaseStatus = 'online' | 'offline' | 'no_config' | 'checking';
  const firebaseStatus: FirebaseStatus = !auth ? 'no_config' : uid ? 'online' : 'offline';

  const handleOpenEditModal = () => {
    const currentMetrics = log.userMetrics || { weightKg: 75, heightCm: 175, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'maintenance' };
    setNameInput(log.userName || 'Ciudadano Prokopton');
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
      targetCalories: cals,
      stepGoal: steps,
      age,
      weightKg: weight,
      heightCm: height,
    });

    setShowEditModal(false);
    Alert.alert("Perfil Calibrado", "Tus datos biométricos han sido actualizados con éxito.");
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

          {/* Sección Estado del Guardián */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>ESTADO DEL GUARDIÁN</ThemedText>

            {/* Indicador de estado */}
            <View style={styles.statusBadge}>
              <Ionicons name={status.icon} size={16} color={status.color} />
              <ThemedText style={[styles.statusText, { color: status.color }]}>{status.label}</ThemedText>
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
                {'Tu sesión está vinculada a este templo y respaldada con tu ID de Guardián.'}
              </ThemedText>
            </View>
          </ThemedView>

          {/* Sección de Peligro */}
          <ThemedView style={[styles.section, { borderColor: 'rgba(239, 68, 68, 0.35)', marginTop: Spacing.two }]}>
            <TouchableOpacity style={styles.dangerButton} onPress={() => Alert.alert("Destruir Ego", "Esta acción limpiará permanentemente tu cuenta.")}>
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
              <ThemedText style={styles.inputLabel}>Nombre o Pseudónimo Estoico</ThemedText>
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
});
