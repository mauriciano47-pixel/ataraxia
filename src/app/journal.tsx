import { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useColorScheme,
  Animated,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenAI } from '@google/genai';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useCoachContext } from '@/hooks/useCoachContext';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useJournalHistory, JournalMessage } from '@/hooks/useJournalHistory';
import { buildCoachSystemPrompt, generateWelcomeMessage, extractExercisesFromText } from '@/lib/coachPrompt';
import { generateStoicMentorResponse } from '@/lib/stoicMentorEngine';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { COACH_ARCHETYPES, CoachArchetype, LegendaryPath } from '@/types/onboarding';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const DISCLAIMER_TEXT =
  '⚕️ AVISO: Este coach es una herramienta de apoyo basada en IA y mentoría estoica. No reemplaza el consejo de un médico o especialista certificado. Si sientes dolor severo o agudo, consulta a un profesional.';

const QUICK_PROMPTS = [
  { icon: 'moon-outline', text: '😴 No puedo dormir / Mejorar sueño' },
  { icon: 'body-outline', text: '🩺 Me duele el cuello / trapecios' },
  { icon: 'help-circle-outline', text: '⚔️ Dudo si llegaré al Día 30' },
  { icon: 'battery-dead-outline', text: '🧠 Siento fatiga mental y desmotivación' },
  { icon: 'restaurant-outline', text: '🥗 Qué comer según mi Senda' },
  { icon: 'flash-outline', text: '⚡ Sugiere rutina de hoy' },
  { icon: 'fitness-outline', text: '💊 Suplementación con evidencia' },
];

export default function JournalScreen() {
  const router = useRouter();
  const { today, patterns, contextSummary, loading: loadingContext } = useCoachContext();
  const { setCustomRoutine, addWater, setCoachArchetype } = useDailyLog();
  const {
    messages,
    setMessages,
    loading: loadingHistory,
    disclaimerShown,
    setDisclaimerShown,
    saveMessages,
    getPastContext,
  } = useJournalHistory();

  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const currentArchetype: CoachArchetype = today.coachArchetype || 'stoic_mentor';
  const archetypeInfo = COACH_ARCHETYPES[currentArchetype] || COACH_ARCHETYPES.stoic_mentor;

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showArchetypeModal, setShowArchetypeModal] = useState(false);
  const initializedRef = useRef(false);

  const [typingDots] = useState(() => new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);

  // Animación "escribiendo..."
  useEffect(() => {
    if (isLoading) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isLoading, typingDots]);

  // Scroll automático al final
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Inicialización contextual del Coach
  useEffect(() => {
    if (initializedRef.current || loadingContext || loadingHistory) return;
    if (messages.length > 0) {
      initializedRef.current = true;
      return;
    }

    initializedRef.current = true;

    const timer = setTimeout(() => {
      const welcomeMsg = generateWelcomeMessage(
        patterns,
        today.trainingCompleted,
        today.mealsLogged,
        today.waterLitres,
        today.checkInDone || false,
        currentArchetype
      );

      const initialMessages: JournalMessage[] = [];

      if (!disclaimerShown) {
        initialMessages.push({
          text: DISCLAIMER_TEXT,
          sender: 'bot',
          timestamp: Date.now(),
        });
        setDisclaimerShown(true);
      }

      initialMessages.push({
        text: welcomeMsg,
        sender: 'bot',
        timestamp: Date.now() + 1,
      });

      setMessages(initialMessages);
      saveMessages(initialMessages);
    }, 0);

    return () => clearTimeout(timer);
  }, [loadingContext, loadingHistory, messages.length, patterns, today, disclaimerShown, saveMessages, setDisclaimerShown, setMessages, currentArchetype]);

  const currentPath: LegendaryPath = today.legendaryPath || 'spartan';

  // Generador de Mentoría Experta & Psicología Estoica (Cero Respuestas Genéricas / Cero Volcado de Datos)
  const generateFallbackResponse = useCallback((userPrompt: string): string => {
    return generateStoicMentorResponse(userPrompt, currentPath, currentArchetype, today.userMetrics, today);
  }, [currentPath, currentArchetype, today]);

  const handleSendQuery = useCallback(async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: JournalMessage = {
      text: trimmed,
      sender: 'user',
      timestamp: Date.now(),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    setInputText('');
    setIsLoading(true);

    await saveMessages(updatedWithUser);

    try {
      let botText = '';

      if (ai) {
        const pastContext = getPastContext();
        const systemPrompt = buildCoachSystemPrompt(contextSummary, pastContext, currentArchetype, currentPath);

        const conversationParts: string[] = [];
        updatedWithUser.slice(-10).forEach((msg) => {
          const prefix = msg.sender === 'user' ? 'USUARIO' : 'COACH';
          conversationParts.push(`${prefix}: ${msg.text}`);
        });

        const fullPrompt = conversationParts.join('\n\n');

        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 7500)
          );

          const apiCall = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.90,
              topP: 0.95,
            },
          });

          const response = await Promise.race([apiCall, timeoutPromise]);
          botText = response.text || '';
        } catch (e1) {
          console.warn("Gemini Oracle Timeout/Error. Activando respuesta de mentoría experta estoica:", e1);
        }
      }

      if (!botText) {
        botText = generateFallbackResponse(trimmed);
      }

      const botMsg: JournalMessage = {
        text: botText,
        sender: 'bot',
        timestamp: Date.now(),
      };

      const updatedWithBot = [...updatedWithUser, botMsg];
      setMessages(updatedWithBot);
      await saveMessages(updatedWithBot);
    } catch (error) {
      console.warn("Falla en consulta de IA Gemini, usando respuesta de mentoría experta estoica:", error);
      const fallbackText = generateFallbackResponse(trimmed);
      const botMsg: JournalMessage = {
        text: fallbackText,
        sender: 'bot',
        timestamp: Date.now(),
      };
      const updatedWithFallback = [...updatedWithUser, botMsg];
      setMessages(updatedWithFallback);
      await saveMessages(updatedWithFallback);
    } finally {
      setIsLoading(false);
    }
  }, [contextSummary, generateFallbackResponse, getPastContext, isLoading, messages, saveMessages, setMessages, currentArchetype]);

  const sendMessage = () => {
    handleSendQuery(inputText);
  };

  const handleApplyWorkout = (exercises: ReturnType<typeof extractExercisesFromText>) => {
    setCustomRoutine(exercises);
    Alert.alert(
      "⚡ Rutina Cargada con Éxito",
      `Se han importado ${exercises.length} ejercicios a tu sesión de entrenamiento. ¿Deseas ir al Trainer ahora?`,
      [
        { text: "Seguir en el Chat", style: "cancel" },
        { text: "Ir al Trainer 🏋️‍♂️", onPress: () => router.navigate('/trainer') }
      ]
    );
  };

  const handleQuickAddWater = () => {
    addWater(0.5);
    Alert.alert("💧 Hidratación Registrada", "Se han sumado +0.5L (500 ml) a tu registro diario.");
  };

  const handleSelectArchetype = (archetype: CoachArchetype) => {
    setCoachArchetype(archetype);
    setShowArchetypeModal(false);
    const selected = COACH_ARCHETYPES[archetype];
    
    // Mensaje de confirmación del coach en el chat
    const switchMsg: JournalMessage = {
      text: `${selected.icon} **Arquetipo cambiado a ${selected.name}**\n\n*${selected.tagline}*\n\nEstoy listo para guiarte bajo este nuevo enfoque. ¿En qué objetivo trabajamos hoy?`,
      sender: 'bot',
      timestamp: Date.now(),
    };
    const updated = [...messages, switchMsg];
    setMessages(updated);
    saveMessages(updated);
  };

  const getPlaceholder = () => {
    if (currentArchetype === 'spartan_commander') {
      return 'Reporta a tu Comandante Espartano...';
    }
    if (currentArchetype === 'sports_scientist') {
      return 'Consulta biomarcadores o fisiología...';
    }
    if (today.trainingCompleted) {
      return '¿Cómo fue el entreno? Pregunta aquí...';
    }
    return 'Pregunta al Coach sobre tu plan de hoy...';
  };

  if (loadingContext || loadingHistory) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <ThemedText style={styles.loadingText}>Iniciando Oráculo Gemini AI...</ThemedText>
      </View>
    );
  }

  return (
    <PearlElectricBackground glowColor="rgba(212, 175, 55, 0.28)">
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.label}>⚡ MENTORÍA IA & DIARIO</ThemedText>
            <ThemedText style={styles.title}>Oráculo Gemini</ThemedText>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.archetypeSelectorBtn}
              activeOpacity={0.8}
              onPress={() => setShowArchetypeModal(true)}
            >
              <ThemedText style={styles.archetypeBtnIcon}>{archetypeInfo.icon}</ThemedText>
              <View style={styles.archetypeBtnTextGroup}>
                <ThemedText style={styles.archetypeBtnLabel}>ARQUETIPO</ThemedText>
                <ThemedText style={styles.archetypeBtnName}>{archetypeInfo.shortName.toUpperCase()}</ThemedText>
              </View>
              <Ionicons name="chevron-down" size={12} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => {
            const detectedExercises = msg.sender === 'bot' && msg.text !== DISCLAIMER_TEXT ? extractExercisesFromText(msg.text) : [];
            const isWorkoutMsg = detectedExercises.length >= 2;
            const isWaterMsg = msg.sender === 'bot' && (msg.text.toLowerCase().includes('agua') || msg.text.toLowerCase().includes('hidrat') || msg.text.includes('💧'));
            const isMealMsg = msg.sender === 'bot' && (msg.text.toLowerCase().includes('comida') || msg.text.toLowerCase().includes('receta') || msg.text.toLowerCase().includes('macros'));

            return (
              <View
                key={`${msg.timestamp}-${index}`}
                style={[
                  styles.messageBubble,
                  msg.sender === 'user'
                    ? styles.userMessage
                    : msg.text === DISCLAIMER_TEXT
                    ? styles.disclaimerMessage
                    : styles.botMessage,
                ]}
              >
                {msg.sender === 'bot' && msg.text !== DISCLAIMER_TEXT && (
                  <View style={styles.coachLabel}>
                    <ThemedText style={{ fontSize: 12 }}>{archetypeInfo.icon}</ThemedText>
                    <ThemedText style={styles.coachLabelText}>
                      COACH {archetypeInfo.shortName.toUpperCase()}
                    </ThemedText>
                  </View>
                )}
                {msg.text === DISCLAIMER_TEXT && (
                  <View style={styles.coachLabel}>
                    <Ionicons name="medical-outline" size={12} color="#888" />
                    <ThemedText style={[styles.coachLabelText, { color: '#888' }]}>AVISO DE SALUD</ThemedText>
                  </View>
                )}
                <ThemedText
                  style={[
                    styles.messageText,
                    msg.sender === 'user'
                      ? styles.userText
                      : msg.text === DISCLAIMER_TEXT
                      ? styles.disclaimerText
                      : styles.botText,
                  ]}
                >
                  {msg.text}
                </ThemedText>

                {/* BOTONES DE ACCIÓN DIRECTA (SMART ACTION CARDS) */}
                {msg.sender === 'bot' && msg.text !== DISCLAIMER_TEXT && (
                  <View style={styles.actionsContainer}>
                    {/* Botón de cargar rutina al Trainer */}
                    {isWorkoutMsg && (
                      <TouchableOpacity
                        style={styles.actionWorkoutBtn}
                        activeOpacity={0.8}
                        onPress={() => handleApplyWorkout(detectedExercises)}
                      >
                        <Ionicons name="flash" size={14} color="#050507" />
                        <ThemedText style={styles.actionWorkoutBtnText}>
                          ⚡ Cargar Rutina en Trainer ({detectedExercises.length} ej.)
                        </ThemedText>
                      </TouchableOpacity>
                    )}

                    <View style={styles.actionPillsRow}>
                      {/* Botón rápido de agua */}
                      {isWaterMsg && (
                        <TouchableOpacity
                          style={styles.actionPillChip}
                          activeOpacity={0.8}
                          onPress={handleQuickAddWater}
                        >
                          <Ionicons name="water" size={12} color="#60A5FA" />
                          <ThemedText style={styles.actionPillText}>+0.5L Agua</ThemedText>
                        </TouchableOpacity>
                      )}

                      {/* Botón rápido de Nutrición */}
                      {isMealMsg && (
                        <TouchableOpacity
                          style={styles.actionPillChip}
                          activeOpacity={0.8}
                          onPress={() => router.navigate('/nutrition')}
                        >
                          <Ionicons name="restaurant" size={12} color="#34D399" />
                          <ThemedText style={styles.actionPillText}>Abrir Nutrición</ThemedText>
                        </TouchableOpacity>
                      )}

                      {/* Botón al Trainer */}
                      {isWorkoutMsg && (
                        <TouchableOpacity
                          style={styles.actionPillChip}
                          activeOpacity={0.8}
                          onPress={() => router.navigate('/trainer')}
                        >
                          <Ionicons name="barbell" size={12} color="#F59E0B" />
                          <ThemedText style={styles.actionPillText}>Ver Trainer</ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                <ThemedText style={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </View>
            );
          })}

          {/* Indicador animado de respuesta */}
          {isLoading && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <View style={styles.coachLabel}>
                <ThemedText style={{ fontSize: 12 }}>{archetypeInfo.icon}</ThemedText>
                <ThemedText style={styles.coachLabelText}>
                  {currentArchetype === 'spartan_commander'
                    ? 'COMANDANTE FORJANDO ESTRATEGIA...'
                    : currentArchetype === 'sports_scientist'
                    ? 'CALCULANDO BIOFÍSICA & MÉTRICAS...'
                    : 'GEMINI CONSULTANDO EL TEMPLO...'}
                </ThemedText>
              </View>
              <Animated.View style={[styles.typingIndicator, { opacity: typingDots }]}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </Animated.View>
            </View>
          )}
        </ScrollView>

        {/* Quick Prompts Bar */}
        <View style={styles.quickPromptsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsContent}>
            {QUICK_PROMPTS.map((qp, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickPromptChip}
                onPress={() => handleSendQuery(qp.text)}
                disabled={isLoading}
              >
                <Ionicons name={qp.icon as any} size={12} color="#FFE259" />
                <ThemedText style={styles.quickPromptText}>{qp.text}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={getPlaceholder()}
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            multiline
            maxLength={1000}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="paper-plane" size={18} color="#050507" />
          </TouchableOpacity>
        </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* MODAL SELECTOR DE ARQUETIPO DEL COACH */}
      <Modal visible={showArchetypeModal} transparent animationType="slide" onRequestClose={() => setShowArchetypeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText style={styles.modalSub}>PERSONALIZACIÓN DEL COACH I.A.</ThemedText>
                <ThemedText style={styles.modalTitle}>Elige tu Arquetipo</ThemedText>
              </View>
              <TouchableOpacity onPress={() => setShowArchetypeModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.archetypesList}>
              {(Object.keys(COACH_ARCHETYPES) as CoachArchetype[]).map((key) => {
                const item = COACH_ARCHETYPES[key];
                const isSelected = item.id === currentArchetype;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.archetypeCard, isSelected && styles.archetypeCardSelected]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectArchetype(item.id)}
                  >
                    <View style={styles.archetypeHeaderRow}>
                      <View style={styles.archetypeIconRing}>
                        <ThemedText style={{ fontSize: 22 }}>{item.icon}</ThemedText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <ThemedText style={styles.archetypeCardName}>{item.name}</ThemedText>
                          {isSelected && (
                            <View style={styles.activeBadge}>
                              <ThemedText style={styles.activeBadgeText}>ACTIVO</ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText style={styles.archetypeCardTagline}>{item.tagline}</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.archetypeCardDesc}>{item.description}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </PearlElectricBackground>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'center',
  },
  archetypeBtnLabel: {
    fontSize: 7.5,
    fontFamily: 'monospace',
    color: '#94A3B8',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  archetypeBtnName: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#FDE68A',
    letterSpacing: 0.5,
  },

  // Chat Area
  chatArea: {
    flex: 1,
    marginTop: Spacing.two,
  },
  chatContent: {
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },

  // Mensajes
  messageBubble: {
    padding: Spacing.three,
    maxWidth: '92%',
    borderRadius: 12,
    borderWidth: 1,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13, 17, 28, 0.94)',
    borderColor: 'rgba(212, 175, 55, 0.35)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37',
  },
  disclaimerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13, 17, 28, 0.80)',
    borderColor: 'rgba(148, 163, 184, 0.20)',
  },
  coachLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  coachLabelText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFE259',
    letterSpacing: 1.5,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 21,
  },
  botText: {
    color: '#F1F5F9',
    fontFamily: 'serif',
  },
  userText: {
    color: '#FFF',
    fontWeight: '600',
  },
  disclaimerText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 6,
    alignSelf: 'flex-end',
  },

  // Actions Container (Smart Action Cards)
  actionsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.20)',
    gap: 6,
  },
  actionWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionWorkoutBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#050507',
    letterSpacing: 0.5,
  },
  actionPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  actionPillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionPillText: {
    fontSize: 10.5,
    fontFamily: 'monospace',
    color: '#FDE68A',
    fontWeight: 'bold',
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

