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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenAI } from '@google/genai';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useCoachContext } from '@/hooks/useCoachContext';
import { useJournalHistory, JournalMessage } from '@/hooks/useJournalHistory';
import { buildCoachSystemPrompt, generateWelcomeMessage } from '@/lib/coachPrompt';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const DISCLAIMER_TEXT =
  '⚕️ AVISO: Este coach es una herramienta de apoyo basada en IA. No reemplaza el consejo de un médico, nutricionista o profesional de salud certificado. Si tienes condiciones médicas, consulta siempre a un especialista.';

const QUICK_PROMPTS = [
  { icon: 'barbell-outline', text: '🏋️ Sugiere rutina de hoy' },
  { icon: 'restaurant-outline', text: '🥗 Ideas de comida alta en proteína' },
  { icon: 'water-outline', text: '💧 ¿Cómo voy con el agua hoy?' },
  { icon: 'sparkles-outline', text: '🧠 Reflexión para motivarme' },
];

export default function JournalScreen() {
  const { today, patterns, contextSummary, loading: loadingContext } = useCoachContext();
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

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const typingDots = useRef(new Animated.Value(0)).current;
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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, isLoading]);

  // Inicialización contextual del Coach
  useEffect(() => {
    if (initialized || loadingContext || loadingHistory) return;
    if (messages.length > 0) {
      setInitialized(true);
      return;
    }

    const welcomeMsg = generateWelcomeMessage(
      patterns,
      today.trainingCompleted,
      today.mealsLogged,
      today.waterLitres,
      today.checkInDone || false
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
    setInitialized(true);
  }, [initialized, loadingContext, loadingHistory, messages.length, patterns, today, disclaimerShown]);

  // Generador inteligente de respaldo si Gemini no tiene API Key o falla red
  const generateFallbackResponse = (userPrompt: string): string => {
    const promptLower = userPrompt.toLowerCase();

    if (promptLower.includes('rutina') || promptLower.includes('entren') || promptLower.includes('ejercicio')) {
      if (today.trainingCompleted) {
        return '🏆 ¡Ya completaste tu entrenamiento de hoy! Enfoque ahora en recuperar: consume 30g-40g de proteína, hidrátate bien y estira 10 minutos. El crecimiento muscular ocurre en el descanso.';
      }
      return '💪 Para hoy te sugiero una rutina de 45 min dividida en: 1) Calentamiento dinámico (5m), 2) Sentadilla o Flexiones 4x10 (15m), 3) Remo o Dominadas 4x8 (15m), 4) Trabajo de core 3x1min. ¡Mantén la disciplina!';
    }

    if (promptLower.includes('comida') || promptLower.includes('prote') || promptLower.includes('nutri') || promptLower.includes('receta')) {
      return `🥗 Basado en tus metas (${today.targetCalories || 2200} kcal/día): Te recomiendo una comida rica en proteína limpia como pechuga de pollo/pavo a la plancha (250g), arroz integral (150g) y vegetales al vapor. Aporta ~45g de proteína y energía limpia.`;
    }

    if (promptLower.includes('agua') || promptLower.includes('hidrat')) {
      const remaining = Math.max(0, parseFloat((2.5 - today.waterLitres).toFixed(2)));
      if (remaining === 0) {
        return `💧 ¡Excelente trabajo! Has alcanzado ${today.waterLitres}L de agua hoy. Tu cuerpo y cerebro están perfectamente hidratados.`;
      }
      return `💧 Llevas ${today.waterLitres}L de agua hoy. Te faltan aproximadamente ${remaining}L para tu meta recomendada de 2.5L. ¡Bebe un vaso de agua ahora mismo!`;
    }

    if (promptLower.includes('reflex') || promptLower.includes('motiv') || promptLower.includes('frase')) {
      return '🏛️ "El valor no es la ausencia de miedo, sino el juicio de que hay algo más importante que el miedo." — Séneca.\n\nConcentra tu mente en lo que depende de ti hoy: tu entreno, tu nutrición y tu carácter.';
    }

    return `🏛️ Como Coach de Ataraxia, analizo tu estado de hoy: Llevas ${today.waterLitres}L de agua, ${today.totalCalories} kcal registradas y ${today.trainingCompleted ? 'entrenamiento completado' : 'entrenamiento pendiente'}. ¿En qué objetivo específico quieres enfocar tus esfuerzos hoy?`;
  };

  const handleSendQuery = async (textToSend: string) => {
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
        const systemPrompt = buildCoachSystemPrompt(contextSummary, pastContext);

        const conversationParts: string[] = [];
        updatedWithUser.slice(-8).forEach((msg) => {
          const prefix = msg.sender === 'user' ? 'USUARIO' : 'COACH';
          conversationParts.push(`${prefix}: ${msg.text}`);
        });

        const fullPrompt = conversationParts.join('\n\n');

        try {
          // Intento 1: Modelo primario de alta velocidad
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
              systemInstruction: systemPrompt,
            },
          });
          botText = response.text || '';
        } catch (e1) {
          console.warn("Reintentando Gemini con modelo 1.5-flash:", e1);
          // Intento 2: Fallback gemini-1.5-flash
          const response2 = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: fullPrompt,
            config: {
              systemInstruction: systemPrompt,
            },
          });
          botText = response2.text || '';
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
      console.warn("Falla en consulta de IA Gemini, usando respuesta inteligente contextual:", error);
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
  };

  const sendMessage = useCallback(() => {
    handleSendQuery(inputText);
  }, [inputText, isLoading, messages, contextSummary, getPastContext, saveMessages]);

  const getPlaceholder = () => {
    if (!today.trainingCompleted && !today.checkInDone) {
      return 'Consulta al Oráculo Gemini...';
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Fondo Fotográfico Estoico Profesional con Superposición Oscura Elegante */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require('../../assets/images/bg_stoic_cosmos.png')}
          style={[StyleSheet.absoluteFill, { opacity: 0.28 }]}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5, 5, 5, 0.88)' }]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.label}>MENTORÍA IA & DIARIO</ThemedText>
            <ThemedText style={styles.title}>Oráculo Gemini</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.coachBadge}>
              <Ionicons name="sparkles" size={14} color="#D32F2F" />
              <ThemedText style={styles.coachBadgeText}>
                {GEMINI_API_KEY ? 'GEMINI AI ACTIVO' : 'COACH LOCAL ACTIVO'}
              </ThemedText>
            </View>
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
          {messages.map((msg, index) => (
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
                  <Ionicons name="sparkles" size={12} color="#D32F2F" />
                  <ThemedText style={styles.coachLabelText}>COACH ORÁCULO</ThemedText>
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
              <ThemedText style={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            </View>
          ))}

          {/* Indicador animado de respuesta */}
          {isLoading && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <View style={styles.coachLabel}>
                <Ionicons name="sparkles" size={12} color="#D32F2F" />
                <ThemedText style={styles.coachLabelText}>GEMINI PENSANDO...</ThemedText>
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
                <Ionicons name={qp.icon as any} size={12} color="#FFF" />
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
            <Ionicons name="paper-plane-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
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
    color: '#888',
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
    borderBottomColor: 'rgba(211,47,47,0.25)',
  },
  headerLeft: {},
  headerRight: {},
  label: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#D32F2F',
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
    color: '#FFF',
  },
  coachBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(211,47,47,0.15)',
    borderWidth: 1,
    borderColor: '#D32F2F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  coachBadgeText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#FFF',
    letterSpacing: 1,
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
    maxWidth: '90%',
    borderRadius: 8,
    borderWidth: 1,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 15, 18, 0.92)',
    borderColor: 'rgba(211, 47, 47, 0.35)',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(211, 47, 47, 0.22)',
    borderColor: '#D32F2F',
  },
  disclaimerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  coachLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  coachLabelText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#D32F2F',
    letterSpacing: 1.5,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 21,
  },
  botText: {
    color: '#EEE',
    fontFamily: 'serif',
  },
  userText: {
    color: '#FFF',
    fontWeight: '600',
  },
  disclaimerText: {
    color: '#888',
    fontSize: 11,
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 9,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 6,
    alignSelf: 'flex-end',
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
    backgroundColor: '#D32F2F',
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
    backgroundColor: 'rgba(30, 30, 35, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.4)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  quickPromptText: {
    color: '#DDD',
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
    borderTopColor: 'rgba(211, 47, 47, 0.2)',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(211, 47, 47, 0.4)',
    backgroundColor: 'rgba(15, 15, 20, 0.95)',
    color: '#FFF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    minHeight: 44,
    maxHeight: 100,
    fontSize: 13.5,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
});
