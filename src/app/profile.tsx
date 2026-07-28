import { StyleSheet, View, Switch, TouchableOpacity, useColorScheme, Image, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { auth } from '@/lib/firebase';
import { useDailyLog } from '@/hooks/useDailyLog';

const STOIC_PRESET_AVATARS = [
  { id: 'marcus', name: 'Marco Aurelio', uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Marcus_Aurelius_Louvre_MR561_n02.jpg/330px-Marcus_Aurelius_Louvre_MR561_n02.jpg' },
  { id: 'seneca', name: 'Séneca', uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Seneca_Prado.jpg/330px-Seneca_Prado.jpg' },
  { id: 'epictetus', name: 'Epicteto', uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Epicteti_Enchiridion_Latin_1596.jpg/330px-Epicteti_Enchiridion_Latin_1596.jpg' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { log, updateUserMetrics, setStoicAvatar, setUserName, setStepGoal } = useDailyLog();
  
  const [mementoMoriEnabled, setMementoMoriEnabled] = useState(true);
  const [fastingEnabled, setFastingEnabled] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Editable fields
  const metrics = log.userMetrics || { weightKg: 75, heightCm: 175, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'maintenance' };
  const [nameInput, setNameInput] = useState(log.userName || 'Ciudadano Prokopton');
  const [ageInput, setAgeInput] = useState(metrics.age.toString());
  const [weightInput, setWeightInput] = useState(metrics.weightKg.toString());
  const [heightInput, setHeightInput] = useState(metrics.heightCm.toString());
  const [targetCalInput, setTargetCalInput] = useState((log.targetCalories || 2200).toString());
  const [targetStepInput, setTargetStepInput] = useState((log.stepGoal || 10000).toString());

  const uid = auth?.currentUser?.uid || 'Desconocido';
  const shortUid = uid.substring(0, 8);

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

  const handleSaveProfileData = () => {
    const age = parseInt(ageInput, 10) || 28;
    const weight = parseFloat(weightInput) || 75;
    const height = parseFloat(heightInput) || 175;
    const targetCals = parseInt(targetCalInput, 10) || 2200;
    const targetSteps = parseInt(targetStepInput, 10) || 10000;

    setUserName(nameInput.trim() || 'Ciudadano Prokopton');
    updateUserMetrics({ age, weightKg: weight, heightCm: height }, targetCals);
    setStepGoal(targetSteps);
    setShowEditModal(false);
    Alert.alert("Datos Guardados", "Tu biometría y metas estoicas han sido actualizadas.");
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={{ paddingBottom: Spacing.five }}>
          
          {/* Header con botón de volver */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.label}>PROKOPTON</ThemedText>
              <ThemedText style={styles.title}>El Yo & Biometría</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.editBtn, { backgroundColor: colors.accent }]}
              onPress={() => setShowEditModal(true)}
            >
              <Ionicons name="create-outline" size={16} color="#FFF" />
              <ThemedText style={styles.editBtnText}>EDITAR</ThemedText>
            </TouchableOpacity>
          </View>

          {/* AVATAR ESTOICO & FOTO DE PERFIL */}
          <View style={[styles.avatarCard, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
            <View style={styles.avatarWrapper}>
              {log.stoicAvatarUri ? (
                <Image source={{ uri: log.stoicAvatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.backgroundSelected }]}>
                  <Ionicons name="person" size={44} color={colors.accent} />
                </View>
              )}

              <TouchableOpacity style={[styles.cameraBadge, { backgroundColor: colors.accent }]} onPress={handlePickAvatarPhoto}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.userNameText}>{log.userName || 'Ciudadano Prokopton'}</ThemedText>
            <ThemedText style={styles.userRoleText}>Aprendiz Stoic-Fitness • ID: #{shortUid}</ThemedText>

            <View style={styles.presetRow}>
              <ThemedText style={styles.presetLabel}>Avatares Filosóficos:</ThemedText>
              <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: 4 }}>
                {STOIC_PRESET_AVATARS.map((av) => (
                  <TouchableOpacity key={av.id} onPress={() => setStoicAvatar(av.uri)} style={styles.presetChip}>
                    <ThemedText style={styles.presetChipText}>{av.name}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <ThemedText style={styles.description}>
            &ldquo;La felicidad de tu vida depende de la calidad de tus pensamientos y de la fuerza de tu cuerpo.&rdquo; – Marco Aurelio
          </ThemedText>

          {/* Sección de Identidad Biométrica */}
          <ThemedView style={[styles.section, { borderColor: colors.backgroundSelected }]}>
            <ThemedText style={styles.sectionTitle}>BIOMETRÍA Y METAS ESTOICAS</ThemedText>
            
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
              <ThemedText style={[styles.rowValue, { color: colors.accent, fontWeight: 'bold' }]}>{log.targetCalories || 2200} kcal</ThemedText>
            </View>

            <View style={styles.row}>
              <ThemedText style={styles.rowLabel}>Meta de Pasos Diarios</ThemedText>
              <ThemedText style={[styles.rowValue, { color: colors.accent, fontWeight: 'bold' }]}>{log.stepGoal || 10000} pasos</ThemedText>
            </View>
          </ThemedView>

          {/* Sección de Preferencias */}
          <ThemedView style={[styles.section, { borderColor: colors.backgroundSelected }]}>
            <ThemedText style={styles.sectionTitle}>PREFERENCIAS DE DISCIPLINA</ThemedText>
            
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.rowLabel}>Memento Mori</ThemedText>
                <ThemedText style={styles.hint}>Recordatorio matutino de tu mortalidad.</ThemedText>
              </View>
              <Switch 
                value={mementoMoriEnabled} 
                onValueChange={setMementoMoriEnabled} 
                trackColor={{ false: '#767577', true: colors.accent }}
                thumbColor={'#f4f3f4'}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.rowLabel}>Ayuno Intermitente</ThemedText>
                <ThemedText style={styles.hint}>Ocultar calorías hasta el mediodía.</ThemedText>
              </View>
              <Switch 
                value={fastingEnabled} 
                onValueChange={setFastingEnabled} 
                trackColor={{ false: '#767577', true: colors.accent }}
                thumbColor={'#f4f3f4'}
              />
            </View>
          </ThemedView>

          {/* Sección de Peligro */}
          <ThemedView style={[styles.section, { borderColor: colors.backgroundSelected, marginTop: Spacing.four }]}>
            <TouchableOpacity style={styles.dangerButton} onPress={() => Alert.alert("Destruir Ego", "Esta acción limpiará permanentemente tu cuenta anónima.")}>
              <Ionicons name="flame-outline" size={20} color="#FF453A" />
              <ThemedText style={styles.dangerText}>Destruir Ego (Borrar Cuenta)</ThemedText>
            </TouchableOpacity>
          </ThemedView>

        </ScrollView>
      </SafeAreaView>

      {/* Modal para Editar Biometría & Datos */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.backgroundSelected }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>EDITAR BIOMETRÍA & DATOS</ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <ThemedText style={styles.inputLabel}>Nombre o Pseudónimo Estoico</ThemedText>
              <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                value={nameInput}
                onChangeText={setNameInput}
              />

              <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two }}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.inputLabel}>Edad</ThemedText>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    value={ageInput}
                    onChangeText={setAgeInput}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.inputLabel}>Peso (kg)</ThemedText>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    value={weightInput}
                    onChangeText={setWeightInput}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.inputLabel}>Altura (cm)</ThemedText>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                    value={heightInput}
                    onChangeText={setHeightInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <ThemedText style={[styles.inputLabel, { marginTop: Spacing.three }]}>Meta Calórica Diaria (kcal)</ThemedText>
              <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                value={targetCalInput}
                onChangeText={setTargetCalInput}
                keyboardType="numeric"
              />

              <ThemedText style={[styles.inputLabel, { marginTop: Spacing.three }]}>Meta de Pasos Diarios</ThemedText>
              <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected }]}
                value={targetStepInput}
                onChangeText={setTargetStepInput}
                keyboardType="numeric"
              />
            </ScrollView>

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: colors.accent, marginTop: Spacing.four }]}
              onPress={handleSaveProfileData}
            >
              <ThemedText style={styles.saveBtnText}>GUARDAR CAMBIOS</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  backButton: {
    marginRight: Spacing.three,
    padding: Spacing.two,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.1)'
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#D32F2F',
    letterSpacing: 2,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 24,
    fontFamily: 'serif',
    marginTop: 2,
    fontWeight: 'bold',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  editBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  avatarCard: {
    padding: Spacing.four,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.two,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D32F2F',
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
    borderColor: '#000',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginTop: 4,
  },
  userRoleText: {
    fontSize: 12,
    color: '#888',
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
    color: '#888',
  },
  presetChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#555',
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
    color: '#888',
    textAlign: 'center',
  },
  section: {
    borderWidth: 1,
    borderRadius: 0,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#888',
    marginBottom: Spacing.three,
    fontFamily: 'monospace',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'monospace',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  hint: {
    fontSize: 11,
    color: '#60646C',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    padding: Spacing.four,
    borderWidth: 2,
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
    color: '#888',
  },
  input: {
    borderWidth: 1,
    padding: Spacing.two,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  saveBtn: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 12,
  }
});
