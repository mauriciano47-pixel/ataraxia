import { StyleSheet, Platform } from 'react-native';
import { Spacing } from '@/constants/theme';

export const trainerModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 7, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0A0D16',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'serif',
    letterSpacing: 1,
  },
  modalSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 4,
    lineHeight: 16,
  },

  // FORM INPUTS & CHIPS
  formGroup: {
    gap: 4,
    marginTop: 4,
  },
  formLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 13,
  },
  quickChipsSection: {
    gap: 4,
  },
  quickChipsLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  sugChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  sugChipText: {
    color: '#CBD5E1',
    fontSize: 10.5,
  },
  muscleChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  muscleChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderColor: '#D4AF37',
  },
  muscleChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  muscleChipTextActive: {
    color: '#FFE259',
    fontWeight: 'bold',
  },
  saveExerciseModalBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  saveExerciseModalBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // PRESETS LIST
  presetCard: {
    backgroundColor: 'rgba(13, 17, 28, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    borderRadius: 12,
    padding: Spacing.three,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  presetSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  presetCount: {
    fontSize: 10,
    color: '#38BDF8',
    fontFamily: 'monospace',
    marginTop: 2,
  },

  // AI GENERATOR MODAL CONTROLS
  paramSection: {
    gap: 4,
  },
  paramLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paramChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  paramChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    borderColor: '#D4AF37',
  },
  paramChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  paramChipTextActive: {
    color: '#FDE68A',
    fontWeight: 'bold',
  },
  generateActionBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  generateActionBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 1,
  },
  generatedPreviewBox: {
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    gap: 6,
    marginTop: 6,
  },
  genTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFE259',
    fontFamily: 'serif',
  },
  genList: {
    gap: 4,
  },
  genExerciseItem: {
    fontSize: 11.5,
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  loadRoutineBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  loadRoutineBtnText: {
    color: '#050507',
    fontWeight: '900',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  closeModalBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
});
