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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenAI } from '@google/genai';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useCoachContext } from '@/hooks/useCoachContext';
import { useJournalHistory, JournalMessage } from '@/hooks/useJournalHistory';
import { buildCoachSystemPrompt, generateWelcomeMessage } from '@/lib/coachPrompt';
import { OledBackground } from '@/components/OledBackground';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const DISCLAIMER_TEXT =
  '⚕️ AVISO: Este coach es una herramienta de apoyo basada en IA. No reemplaza el consejo de un médico, nutricionista o profesional de salud certificado. Si tienes condiciones médicas, consulta siempre a un especialista.';

const QUICK_PROMPTS = [
  { icon: 'barbell-outline', text: '🏋️ Sugiere rutina de hoy' },
  { icon: 'restaurant-outline', text: '🥗 Ideas de comida alta en proteína' },
  { icon: 'fitness-outline', text: '💊 ¿Qué suplementos me recomiendas?' },
  { icon: 'water-outline', text: '💧 ¿Cómo voy con el agua hoy?' },
  { icon: 'moon-outline', text: '😴 Cómo mejorar mi sueño y recuperar' },
  { icon: 'sparkles-outline', text: '🧠 Lección estoica para motivarme' },
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
    }, 0);

    return () => clearTimeout(timer);
  }, [loadingContext, loadingHistory, messages.length, patterns, today, disclaimerShown, saveMessages, setDisclaimerShown, setMessages]);

  // Índices para rotación continua anti-repetición de respaldos
  const workoutIndexRef = useRef(0);
  const mealIndexRef = useRef(0);
  const stoicIndexRef = useRef(0);

  // Generador contextual amplio y variado de respaldo (Rotación Cero Repetición)
  const generateFallbackResponse = useCallback((userPrompt: string): string => {
    const p = userPrompt.toLowerCase();

    // 1. ENTRENAMIENTO & RUTINAS (4 Variantes totalmente distintas)
    if (p.includes('rutina') || p.includes('entren') || p.includes('ejercicio') || p.includes('pesas') || p.includes('gym')) {
      if (today.trainingCompleted) {
        return '🏆 ¡Ya cumpliste con tu entrenamiento de hoy! Excelente sobrecarga. Tu foco ahora debe estar en la recuperación activa:\n\n• 🍳 **Proteína**: 35-45g de rápida asimilación (pollo, atún o batido whey).\n• 💧 **Agua & Electrólitos**: Mínimo 500ml con pizca de sal rosa.\n• 🛌 **Descanso**: Al menos 7.5h de sueño profundo para la supercompensación.';
      }

      const workoutOptions = [
        '💪 **Propuesta A — Empuje & Fuerza Superior (45 min)**:\n\n1. **Press de Banca o Mancuernas**: 4x8-10 reps (RIR 2).\n2. **Press Militar de Hombro**: 3x10 reps.\n3. **Fondos en Paralelas / Flexiones**: 3x12 reps al fallo técnico.\n4. **Elevaciones Laterales**: 3x15 reps.\n5. **Plancha Abdominal**: 3x45s.\n\n*La constancia en la sobrecarga es la clave del progreso real.*',
        '🏋️‍♂️ **Propuesta B — Tracción & Cadena Posterior (50 min)**:\n\n1. **Peso Muerto Rumano**: 4x8 reps (foco en isquios y glúteos).\n2. **Remo con Barra o Mancuerna**: 4x10 reps.\n3. **Dominadas o Jalón al Pecho**: 3x10 reps.\n4. **Curl de Bíceps con Barra**: 3x12 reps.\n5. **Face Pulls para Hombro Posterior**: 3x15 reps.\n\n*Tu espalda sostiene tu postura y tu carácter estoico.*',
        '🦵 **Propuesta C — Tren Inferior & Potencia (45 min)**:\n\n1. **Sentadilla Trasera o Frontal**: 4x8 reps (RIR 2).\n2. **Zancadas Búlgaras**: 3x10 reps por pierna.\n3. **Prensa Inclinada**: 3x12 reps.\n4. **Elevaciones de Talón (Gemelos)**: 4x15 reps.\n5. **Elevación de Piernas para Core**: 3x15 reps.\n\n*Las piernas fuertes son el cimiento de un templo indestructible.*',
        '🛡️ **Propuesta D — Calistenia Espartana en Casa (35 min)**:\n\n1. **Flexiones Declinadas o Diamante**: 4 series al fallo técnico.\n2. **Sentadillas Libres Explosivas**: 4x20 reps.\n3. **Zancadas Alternas**: 3x16 reps.\n4. **Plancha de Oso & Core**: 4x50s.\n\n*No necesitas máquinas caras para forjar una voluntad de hierro.*'
      ];

      const chosen = workoutOptions[workoutIndexRef.current % workoutOptions.length];
      workoutIndexRef.current += 1;
      return chosen;
    }

    // 2. NUTRICIÓN & MACROS (4 Variantes totalmente distintas)
    if (p.includes('comida') || p.includes('prote') || p.includes('nutri') || p.includes('receta') || p.includes('macro') || p.includes('calor')) {
      const mealOptions = [
        `🥗 **Opción A — Proteína Magra & Compleja (Meta: ${today.targetCalories || 2200} kcal)**:\n\n• **Plato Principal**: 220g de Pechuga de Pollo al Limón + 150g de Arroz Integral + Ensalada verde con aceite de oliva extra virgen.\n• **Macros Aproximados**: 45g Proteína | 50g Carbos | 12g Grasas (520 kcal).`,
        `🐟 **Opción B — Omega-3 & Recomposición**: 200g de Salmón o Atún a la plancha + Quinoa hervida + Espárragos salteados en Ghee.\n• **Macros Aproximados**: 42g Proteína | 45g Carbos | 16g Grasas (550 kcal).`,
        `🍳 **Opción C — Comida Proteica Rápida**: Omelette de 4 Huevos enteros + 100g de Queso Cottage + Champiñones + 2 Tostadas de Avena integral.\n• **Macros Aproximados**: 40g Proteína | 35g Carbos | 18g Grasas (490 kcal).`,
        `🥩 **Opción D — Lomo Magro & Carbohidratos Complejos**: 200g de Lomo Magro salteado con pimientos + Camote al horno + Semillas de Chía o Almendras.\n• **Macros Aproximados**: 44g Proteína | 48g Carbos | 14g Grasas (530 kcal).`
      ];

      const chosen = mealOptions[mealIndexRef.current % mealOptions.length];
      mealIndexRef.current += 1;
      return chosen;
    }

    // 3. SUPLEMENTACIÓN
    if (p.includes('suplement') || p.includes('creatina') || p.includes('whey') || p.includes('vitamina') || p.includes('cafeina')) {
      return '💊 **Guía de Suplementación con Evidencia Científica**:\n\n1. **Creatina Monohidrato**: 3-5g diarios (mejora fuerza, potencia y volumen celular no retenido en piel).\n2. **Proteína Whey/Aislada**: Útil para alcanzar fácilmente tus 1.6-2.2g/kg de proteína.\n3. **Cafeína (150-200mg)**: Tomar 45 min antes de entrenar (evitar 6 horas antes de dormir).\n4. **Omega 3 & Vitamina D3**: Apoyan la salud articular, cardiovascular y hormonal.\n\n*Nota: Los suplementos complementan, la comida real y el sueño construyen.*';
    }

    // 4. HIDRATACIÓN
    if (p.includes('agua') || p.includes('hidrat') || p.includes('beber')) {
      const remaining = Math.max(0, parseFloat((2.5 - today.waterLitres).toFixed(2)));
      if (remaining === 0) {
        return `💧 **Estado de Hidratación Óptimo**: Has registrado **${today.waterLitres}L** de agua hoy. Tus músculos están 75% compuestos de agua; la hidratación mantiene tu fuerza y transporte de nutrientes al máximo.`;
      }
      return `💧 **Métrica de Agua**: Llevas **${today.waterLitres}L** hoy. Te faltan **${remaining}L** para tu meta óptima de 2.5L. ¡Aprovecha este momento y bebe un gran vaso de agua fresca ahora mismo!`;
    }

    // 5. SUEÑO & RECUPERACIÓN
    if (p.includes('sueño') || p.includes('dormir') || p.includes('cansad') || p.includes('recupera') || p.includes('descans')) {
      return '😴 **Optimización de Sueño y Cortisol**:\n\n• **Luz Solar Matutina**: Recibe 10 min de luz solar al despertar para alinear tu ritmo circadiano.\n• **Corte de Pantallas**: Apaga pantallas o usa filtro azul 60 min antes de acostarte.\n• **Magnesio Bisglicinato**: 200-400mg antes de dormir favorece la relajación muscular profunda y reduce despertares nocturnos.';
    }

    // 6. ESTOICISMO & MENTALIDAD (4 Variantes rotativas)
    if (p.includes('reflex') || p.includes('motiv') || p.includes('frase') || p.includes('perez') || p.includes('mente') || p.includes('estoic')) {
      const stoicOptions = [
        '🏛️ *"No nos atrevemos a muchas cosas porque son difíciles, pero son difíciles porque no nos atrevemos."* — Séneca.\n\nHoy no buscas ganas, buscas disciplina. Cumple tu deber sin negociar con la pereza.',
        '🏛️ *"Tienes poder sobre tu mente, no sobre los acontecimientos externos. Date cuenta de esto y encontrarás tu fuerza."* — Marco Aurelio.\n\nEnfoca todo tu ímpetu en las decisiones que sí controlas hoy.',
        '🏛️ *"No expliques tu filosofía; encárnala en tus actos de hoy."* — Epicteto.\n\nEl sudor de tu entrenamiento es tu mejor discurso.',
        '🏛️ *"Si haces algo noble con esfuerzo, el esfuerzo pasa y lo noble queda."* — Musonio Rufo.\n\nEl cansancio de hoy se convertirá en la fortaleza de mañana.'
      ];

      const chosen = stoicOptions[stoicIndexRef.current % stoicOptions.length];
      stoicIndexRef.current += 1;
      return chosen;
    }

    return `🏛️ **Status de tu Coach Ataraxia**:\n\n• **Pasos**: ${(today.steps || 0).toLocaleString()} / ${(today.stepGoal || 10000).toLocaleString()}\n• **Nutrición**: ${today.totalCalories} / ${today.targetCalories || 2200} kcal\n• **Agua**: ${today.waterLitres}L / 2.5L\n• **Entreno**: ${today.trainingCompleted ? 'COMPLETADO 🏆' : 'PENDIENTE ⏳'}\n\n¿En qué área específica (rutina, suplementos, comidas, mentalidad) necesitas mi asesoramiento en este instante?`;
  }, [today]);

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
        const systemPrompt = buildCoachSystemPrompt(contextSummary, pastContext);

        const conversationParts: string[] = [];
        updatedWithUser.slice(-10).forEach((msg) => {
          const prefix = msg.sender === 'user' ? 'USUARIO' : 'COACH';
          conversationParts.push(`${prefix}: ${msg.text}`);
        });

        const fullPrompt = conversationParts.join('\n\n');

        try {
          // Intento 1: Modelo primario con temperatura alta para máxima variedad
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.90,
              topP: 0.95,
            },
          });
          botText = response.text || '';
        } catch (e1) {
          console.warn("Reintentando Gemini con modelo 1.5-flash y alta variabilidad:", e1);
          // Intento 2: Fallback gemini-1.5-flash
          const response2 = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: fullPrompt,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.90,
              topP: 0.95,
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
  }, [contextSummary, generateFallbackResponse, getPastContext, isLoading, messages, saveMessages, setMessages]);

  const sendMessage = () => {
    handleSendQuery(inputText);
  };

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
    <OledBackground glowColor="rgba(16, 185, 129, 0.08)">
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.label}>MENTORÍA IA & DIARIO</ThemedText>
            <ThemedText style={styles.title}>Oráculo Gemini</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.coachBadge}>
              <Ionicons name="sparkles" size={14} color="#10B981" />
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
                  <Ionicons name="sparkles" size={12} color="#10B981" />
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
                <Ionicons name="sparkles" size={12} color="#10B981" />
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
    </OledBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B131F',
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
    borderBottomColor: 'rgba(16, 185, 129, 0.20)',
  },
  headerLeft: {},
  headerRight: {},
  label: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#10B981',
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
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10B981',
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
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: '#10B981',
  },
  disclaimerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderColor: 'rgba(148, 163, 184, 0.15)',
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
    color: '#10B981',
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
    backgroundColor: '#10B981',
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
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
    borderTopColor: 'rgba(16, 185, 129, 0.15)',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.30)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
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
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
});
