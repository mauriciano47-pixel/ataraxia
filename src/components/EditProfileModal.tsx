import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  emailInput: string;
  setEmailInput: (v: string) => void;
  nameInput: string;
  setNameInput: (v: string) => void;
  ageInput: string;
  setAgeInput: (v: string) => void;
  weightInput: string;
  setWeightInput: (v: string) => void;
  heightInput: string;
  setHeightInput: (v: string) => void;
  targetCalInput: string;
  setTargetCalInput: (v: string) => void;
  targetStepInput: string;
  setTargetStepInput: (v: string) => void;
  handleSaveProfile: () => void;
  styles: any;
}

export function EditProfileModal({
  visible,
  onClose,
  emailInput,
  setEmailInput,
  nameInput,
  setNameInput,
  ageInput,
  setAgeInput,
  weightInput,
  setWeightInput,
  heightInput,
  setHeightInput,
  targetCalInput,
  setTargetCalInput,
  targetStepInput,
  setTargetStepInput,
  handleSaveProfile,
  styles,
}: EditProfileModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: '#0A0D16', borderColor: 'rgba(212, 175, 55, 0.45)' }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: '#FFE259' }]}>EDITAR BIOMETRÍA & DATOS</ThemedText>
            <TouchableOpacity onPress={onClose}>
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
  );
}
