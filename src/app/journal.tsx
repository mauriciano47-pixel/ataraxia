import { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, useColorScheme, Animated, ActivityIndicator } from 'react-native';
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

const DISCLAIMER_TEXT = '⚕️ AVISO: Este coach es una herramienta de apoyo basada en IA. No reemplaza el consejo de un médico, nutricionista o profesional de salud certificado. Si tienes condiciones médicas, consulta siempre a un especialista.';

export default function JournalScreen() {
  const { today, patterns, contextSummary, loading: loadingContext } = useCoachContext();
  const {
    messages,
    setMessages,
    loading: loadingHistory,
    disclaimerShown,
    setDisclaimerShown,
    addMessage,
    saveMessages,
    getPastContext,
  } = useJournalHistory();

  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Animaciones
  const typingDots = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Animación de "escribiendo..." con puntos pulsantes
  useEffect(() => {
    if (isLoading) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isLoading, typingDots]);

  // Auto-scroll al final cuando cambian los mensajes
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, isLoading]);

  // Inicializar el coach con bienvenida contextual + disclaimer
  useEffect(() => {
    if (initialized || loadingContext || loadingHistory) return;
    if (messages.length > 0) {
      // Ya hay conversación de hoy, no reinicializar
      setInitialized(true);
      return;
    }

    // Generar bienvenida contextual
    const welcomeMsg = generateWelcomeMessage(
      patterns,
      today.trainingCompleted,
      today.mealsLogged,
      today.waterLitres,
      today.checkInDone || false,
    );

    const initialMessages: JournalMessage[] = [];

    // Disclaimer la primera vez
    if (!disclaimerShown) {
      initialMessages.push({
        text: DISCLAIMER_TEXT,
        sender: 'bot',
        timestamp: Date.now(),
      });
      setDisclaimerShown(true);
    }

    // Bienvenida contextual
    initialMessages.push({
      text: welcomeMsg,
      sender: 'bot',
      timestamp: Date.now() + 1,
    });

    setMessages(initialMessages);
    saveMessages(initialMessages);
    setInitialized(true);
  }, [initialized, loadingContext, loadingHistory, messages.length, patterns, today, disclaimerShown]);

  const sendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    // Añadir mensaje del usuario
    const userMsg: JournalMessage = {
      text: trimmed,
      sender: 'user',
      timestamp: Date.now(),
    };
    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    setInputText('');
    setIsLoading(true);

    // Guardar inmediatamente el mensaje del usuario
    await saveMessages(updatedWithUser);

    try {
      // Construir el system prompt con todo el contexto
      const pastContext = getPastContext();
      const systemPrompt = buildCoachSystemPrompt(contextSummary, pastContext);

      // Construir historial multi-turno para Gemini
      // Incluimos los últimos mensajes de la conversación para coherencia
      const conversationParts: string[] = [];
      updatedWithUser.forEach((msg) => {
        const prefix = msg.sender === 'user' ? 'USUARIO' : 'COACH';
        conversationParts.push(`${prefix}: ${msg.text}`);
      });

      const fullPrompt = conversationParts.join('\n\n');

      if (!ai) {
        const errorMsg: JournalMessage = {
          text: 'La integración con Gemini no está configurada. Revisa las variables de entorno para habilitar el coach.',
          sender: 'bot',
          timestamp: Date.now(),
        };
        const updatedWithConfigError = [...updatedWithUser, errorMsg];
        setMessages(updatedWithConfigError);
        await saveMessages(updatedWithConfigError);
        return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: fullPrompt,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      const botText = response.text || 'No pude generar una respuesta. Inténtalo de nuevo.';

      const botMsg: JournalMessage = {
        text: botText,
        sender: 'bot',
        timestamp: Date.now(),
      };
      const updatedWithBot = [...updatedWithUser, botMsg];
      setMessages(updatedWithBot);
      await saveMessages(updatedWithBot);

    } catch (error) {
      console.error('Error del Coach: unable to generate response.');
      const errorMsg: JournalMessage = {
        text: 'Error de conexión con el Oráculo. La sabiduría estoica no requiere conexión — reflexiona por ti mismo mientras tanto.',
        sender: 'bot',
        timestamp: Date.now(),
      };
      const updatedWithError = [...updatedWithUser, errorMsg];
      setMessages(updatedWithError);
      await saveMessages(updatedWithError);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, contextSummary, getPastContext, saveMessages]);

  // Placeholder dinámico basado en contexto
  const getPlaceholder = () => {
    if (!today.trainingCompleted && !today.checkInDone) {
      return '¿Cómo va tu día? Escribe aquí...';
    }
    if (today.trainingCompleted) {
      return '¿Cómo fue el entreno? Reflexiona aquí...';
    }
    return 'Escribe tu reflexión estoica...';
  };

  if (loadingContext || loadingHistory) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <ThemedText style={styles.loadingText}>Consultando al Oráculo...</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.label}>REFLEXIÓN</ThemedText>
            <ThemedText style={styles.title}>Diario</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.coachBadge}>
              <Ionicons name="eye-outline" size={14} color="#D32F2F" />
              <ThemedText style={styles.coachBadgeText}>COACH ACTIVO</ThemedText>
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
                    : styles.botMessage
              ]}
            >
              {msg.sender === 'bot' && msg.text !== DISCLAIMER_TEXT && (
                <View style={styles.coachLabel}>
                  <Ionicons name="sparkles-outline" size={12} color="#D32F2F" />
                  <ThemedText style={styles.coachLabelText}>ORÁCULO</ThemedText>
                </View>
              )}
              {msg.text === DISCLAIMER_TEXT && (
                <View style={styles.coachLabel}>
                  <Ionicons name="medical-outline" size={12} color="#888" />
                  <ThemedText style={[styles.coachLabelText, { color: '#888' }]}>AVISO</ThemedText>
                </View>
              )}
              <ThemedText style={[
                styles.messageText,
                msg.sender === 'user'
                  ? styles.userText
                  : msg.text === DISCLAIMER_TEXT
                    ? styles.disclaimerText
                    : styles.botText
              ]}>
                {msg.text}
              </ThemedText>
              <ThemedText style={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            </View>
          ))}

          {/* Indicador de "escribiendo" animado */}
          {isLoading && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <View style={styles.coachLabel}>
                <Ionicons name="sparkles-outline" size={12} color="#D32F2F" />
                <ThemedText style={styles.coachLabelText}>ORÁCULO</ThemedText>
              </View>
              <Animated.View style={[styles.typingIndicator, { opacity: typingDots }]}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </Animated.View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={getPlaceholder()}
            placeholderTextColor="#555"
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
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    color: '#666',
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
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {},
  headerRight: {},
  label: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#D32F2F',
    letterSpacing: 3,
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
    gap: 4,
    backgroundColor: 'rgba(211,47,47,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(211,47,47,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  coachBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#D32F2F',
    letterSpacing: 1,
  },

  // Chat
  chatArea: {
    flex: 1,
    marginTop: Spacing.three,
  },
  chatContent: {
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },

  // Mensajes
  messageBubble: {
    padding: Spacing.three,
    maxWidth: '88%',
    borderWidth: 2,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(10,10,10,0.9)',
    borderColor: 'rgba(211,47,47,0.2)',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(211,47,47,0.12)',
    borderColor: 'rgba(211,47,47,0.4)',
  },
  disclaimerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(10,10,10,0.6)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  coachLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  coachLabelText: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#D32F2F',
    letterSpacing: 1.5,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  botText: {
    color: '#CCC',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  userText: {
    color: '#FFF',
  },
  disclaimerText: {
    color: '#777',
    fontSize: 11,
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 9,
    color: '#444',
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

  // Input
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'flex-end',
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(10,10,10,0.8)',
    color: '#FFF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 14,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#D32F2F',
    borderWidth: 2,
    borderColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
