import { StyleSheet } from 'react-native';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.three,
    color: '#D4AF37',
    fontFamily: 'monospace',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.25)',
  },
  headerLeft: {},
  headerRight: {},
  label: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#D4AF37',
    letterSpacing: 2,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 22,
    fontFamily: 'serif',
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '900',
    color: '#FFE259',
  },

  // Archetype Selector Button in Header
  archetypeSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13, 17, 28, 0.90)',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  archetypeBtnIcon: {
    fontSize: 14,
  },
  archetypeBtnTextGroup: {
    flexDirection: 'column',
  },
  archetypeBtnLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontFamily: 'monospace',
    letterSpacing: 0.8,
  },
  archetypeBtnValue: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFE259',
  },
  archetypeBtnName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFE259',
  },

  // Disclaimer
  disclaimerBubble: {
    backgroundColor: 'rgba(13, 17, 28, 0.95)',
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    padding: Spacing.three,
    borderRadius: 8,
    marginVertical: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
    fontFamily: 'monospace',
  },

  // Message List
  messageList: {
    flex: 1,
    paddingVertical: Spacing.three,
  },
  chatArea: {
    flex: 1,
    paddingVertical: Spacing.three,
  },
  messageListContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  chatContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: Spacing.three,
    borderRadius: 14,
    gap: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13, 17, 28, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.40)',
    borderBottomLeftRadius: 2,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13, 17, 28, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.40)',
    borderBottomLeftRadius: 2,
  },
  disclaimerMessage: {
    backgroundColor: 'rgba(13, 17, 28, 0.95)',
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    padding: Spacing.three,
    borderRadius: 8,
    marginVertical: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.20)',
  },
  coachLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coachLabelText: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  actionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  senderLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  userSender: {
    color: '#050507',
  },
  botSender: {
    color: '#D4AF37',
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  userText: {
    color: '#050507',
    fontWeight: '600',
  },
  botText: {
    color: '#F8FAFC',
  },
  timestamp: {
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  userTimestamp: {
    color: 'rgba(5, 5, 7, 0.6)',
    alignSelf: 'flex-end',
  },
  botTimestamp: {
    color: '#64748B',
    alignSelf: 'flex-start',
  },

  // Action Button in Workout Message
  actionWorkoutContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  actionWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionWorkoutBtnSuccess: {
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
  },
  actionWorkoutBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#050507',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },

  // Typing indicator
  typingIndicator: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },

  // Quick Prompts
  quickPromptsContainer: {
    marginVertical: Spacing.two,
  },
  quickPromptsContent: {
    gap: 8,
    paddingHorizontal: 2,
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13, 17, 28, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  quickPromptText: {
    color: '#FDE68A',
    fontSize: 10.5,
    fontFamily: 'monospace',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.25)',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(13, 17, 28, 0.95)',
    color: '#FFF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    minHeight: 44,
    maxHeight: 100,
    fontSize: 13.5,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },

  // Modal Archetypes
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 7, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0D111C',
    borderTopWidth: 1.5,
    borderTopColor: '#D4AF37',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.20)',
  },
  modalSub: {
    fontSize: 8.5,
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFE259',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  archetypesList: {
    gap: 12,
    paddingBottom: Spacing.four,
  },
  archetypeCard: {
    backgroundColor: 'rgba(18, 24, 38, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    padding: Spacing.three,
    gap: 8,
  },
  archetypeCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1.8,
  },
  archetypeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  archetypeIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archetypeCardName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
  activeBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#050507',
    fontFamily: 'monospace',
  },
  archetypeCardTagline: {
    fontSize: 11,
    color: '#FDE68A',
    fontWeight: '600',
    marginTop: 1,
  },
  archetypeCardDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
});
