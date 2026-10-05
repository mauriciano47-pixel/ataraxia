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
import * as Haptics from 'expo-haptics';
import { SafeStorage } from '@/utils/safeStorage';
import { buildCoachSystemPrompt, generateWelcomeMessage, extractExercisesFromText } from '@/lib/coachPrompt';
import { generateStoicMentorResponse } from '@/lib/stoicMentorEngine';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { COACH_ARCHETYPES, CoachArchetype, LegendaryPath } from '@/types/onboarding';
import { styles } from '@/styles/journal.styles';
import { logger } from '@/utils/logger';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const DISCLAIMER_TEXT =
  '⚕️ AVISO: Este coach es una herramienta de apoyo basada en IA y mentoría estoica. No reemplaza el consejo de un médico o especialista certificado. Si sientes dolor severo o agudo, consulta a un profesional.';

const QUICK_PROMPTS = [
  { icon: 'flame-outline', text: '🔥 Tengo pereza: activar Serie Única RPE 10' },
  { icon: 'shield-checkmark-outline', text: '🏛️ Examen socrático ante el desánimo' },
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
  const { setCustomRoutine, setCoachArchetype } = useDailyLog();
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
  const [applyingRoutineMsgId, setApplyingRoutineMsgId] = useState<string | null>(null);
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
          logger.warn("Gemini Oracle Timeout/Error. Activando respuesta de mentoría experta estoica:", e1);
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
      logger.warn("Falla en consulta de IA Gemini, usando respuesta de mentoría experta estoica:", error);
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
  }, [contextSummary, generateFallbackResponse, getPastContext, isLoading, messages, saveMessages, setMessages, currentArchetype, currentPath]);

  const sendMessage = () => {
    handleSendQuery(inputText);
  };

  const handleApplyWorkout = (exercises: ReturnType<typeof extractExercisesFromText>, msgKey: string) => {
    if (!exercises || exercises.length === 0) return;
    setApplyingRoutineMsgId(msgKey);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setCustomRoutine(exercises);
    try {
      SafeStorage.setItem('ataraxia_custom_routine_v1', JSON.stringify(exercises));
    } catch {}

    setTimeout(() => {
      setApplyingRoutineMsgId(null);
      router.push('/trainer');
    }, 400);
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
          removeClippedSubviews={false}
          overScrollMode="never"
        >
          {messages.map((msg, index) => {
            const detectedExercises = msg.sender === 'bot' && msg.text !== DISCLAIMER_TEXT ? extractExercisesFromText(msg.text) : [];
            const isWorkoutMsg = detectedExercises.length >= 2;

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

                {/* BOTÓN DE ACCIÓN DIRECTA: CARGAR RUTINA EN TRAINER */}
                {msg.sender === 'bot' && msg.text !== DISCLAIMER_TEXT && isWorkoutMsg && (
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.actionWorkoutBtn,
                        applyingRoutineMsgId === `${msg.timestamp}-${index}` && styles.actionWorkoutBtnSuccess,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleApplyWorkout(detectedExercises, `${msg.timestamp}-${index}`)}
                      disabled={applyingRoutineMsgId !== null}
                    >
                      <Ionicons
                        name={applyingRoutineMsgId === `${msg.timestamp}-${index}` ? "checkmark-circle" : "flash"}
                        size={15}
                        color="#050507"
                      />
                      <ThemedText style={styles.actionWorkoutBtnText}>
                        {applyingRoutineMsgId === `${msg.timestamp}-${index}`
                          ? "✅ ¡Rutina Cargada! Abriendo Trainer..."
                          : `⚡ Cargar Rutina en Trainer (${detectedExercises.length} Ejercicios) →`}
                      </ThemedText>
                    </TouchableOpacity>
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
                    ? 'ESTOICO DISCIPLINARIO (EPICTETO)...'
                    : currentArchetype === 'sports_scientist'
                    ? 'ESTOICO ANALÍTICO (CRISIPO)...'
                    : 'ESTOICO SABIO (MARCO AURELIO)...'}
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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
