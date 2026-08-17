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
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { COACH_ARCHETYPES, CoachArchetype } from '@/types/onboarding';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const DISCLAIMER_TEXT =
  '⚕️ AVISO: Este coach es una herramienta de apoyo basada en IA. No reemplaza el consejo de un médico, nutricionista o profesional de salud certificado. Si tienes condiciones médicas, consulta siempre a un especialista.';

const QUICK_PROMPTS = [
  { icon: 'flash-outline', text: '⚡ Sugiere rutina de hoy' },
  { icon: 'restaurant-outline', text: '🥗 Ideas de comida alta en proteína' },
  { icon: 'fitness-outline', text: '💊 ¿Qué suplementos me recomiendas?' },
  { icon: 'water-outline', text: '💧 ¿Cómo voy con el agua hoy?' },
  { icon: 'moon-outline', text: '😴 Cómo mejorar mi sueño y recuperar' },
  { icon: 'sparkles-outline', text: '🏛️ Lección estoica para motivarme' },
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

  // Índices para rotación continua anti-repetición de respaldos
  const workoutIndexRef = useRef(0);
  const mealIndexRef = useRef(0);
  const stoicIndexRef = useRef(0);

  // Generador contextual amplio y variado de respaldo (Rotación Cero Repetición)
  const generateFallbackResponse = useCallback((userPrompt: string): string => {
    const p = userPrompt.toLowerCase();

    // 1. ENTRENAMIENTO & RUTINAS
    if (p.includes('rutina') || p.includes('entren') || p.includes('ejercicio') || p.includes('pesas') || p.includes('gym')) {
      if (today.trainingCompleted) {
        return '🏆 ¡Ya cumpliste con tu entrenamiento de hoy! Excelente sobrecarga. Tu foco ahora debe estar en la recuperación activa:\n\n• 🍳 **Proteína**: 35-45g de rápida asimilación (pollo, atún o batido whey).\n• 💧 **Agua & Electrólitos**: Mínimo 500ml con pizca de sal rosa.\n• 🛌 **Descanso**: Al menos 7.5h de sueño profundo para la supercompensación.';
      }

      const workoutOptions = [
        '💪 **Propuesta A — Empuje & Fuerza Superior (45 min)**:\n\n1. **Press de Banca o Mancuernas**: 4x8-10 reps (RIR 2)\n2. **Press Militar de Hombro**: 3x10 reps\n3. **Fondos en Paralelas / Flexiones**: 3x12 reps al fallo\n4. **Elevaciones Laterales**: 3x15 reps\n5. **Plancha Abdominal**: 3x45s\n\n*La constancia en la sobrecarga es la clave del progreso real.*',
        '🏋️‍♂️ **Propuesta B — Tracción & Cadena Posterior (50 min)**:\n\n1. **Peso Muerto Rumano**: 4x8 reps (foco en isquios y glúteos)\n2. **Remo con Barra o Mancuerna**: 4x10 reps\n3. **Dominadas o Jalón al Pecho**: 3x10 reps\n4. **Curl de Bíceps con Barra**: 3x12 reps\n5. **Face Pulls para Hombro Posterior**: 3x15 reps\n\n*Tu espalda sostiene tu postura y tu carácter estoico.*',
        '🦵 **Propuesta C — Tren Inferior & Potencia (45 min)**:\n\n1. **Sentadilla Trasera o Frontal**: 4x8 reps (RIR 2)\n2. **Zancadas Búlgaras**: 3x10 reps por pierna\n3. **Prensa Inclinada**: 3x12 reps\n4. **Elevaciones de Talón (Gemelos)**: 4x15 reps\n5. **Elevación de Piernas para Core**: 3x15 reps\n\n*Las piernas fuertes son el cimiento de un templo indestructible.*',
        '🛡️ **Propuesta D — Calistenia Espartana en Casa (35 min)**:\n\n1. **Flexiones Declinadas o Diamante**: 4 series al fallo técnico\n2. **Sentadillas Libres Explosivas**: 4x20 reps\n3. **Zancadas Alternas**: 3x16 reps\n4. **Plancha de Oso & Core**: 4x50s\n\n*No necesitas máquinas caras para forjar una voluntad de hierro.*'
      ];

      const chosen = workoutOptions[workoutIndexRef.current % workoutOptions.length];
      workoutIndexRef.current += 1;
      return chosen;
    }

    // 2. NUTRICIÓN & MACROS
    if (p.includes('comida') || p.includes('prote') || p.includes('nutri') || p.includes('receta') || p.includes('macro') || p.includes('calor')) {
      const mealOptions = [
        `🥗 **Opción A — Proteína Magra & Compleja (Meta: ${today.targetCalories || 2200} kcal)**:\n\n• **Plato**: 220g de Pechuga de Pollo al Limón + 150g de Arroz Integral + Ensalada verde con aceite de oliva extra virgen.\n• **Macros**: 45g Proteína | 50g Carbos | 12g Grasas (520 kcal).`,
        `🐟 **Opción B — Omega-3 & Recomposición**: 200g de Salmón o Atún a la plancha + Quinoa hervida + Espárragos salteados en Ghee.\n• **Macros**: 42g Proteína | 45g Carbos | 16g Grasas (550 kcal).`,
        `🍳 **Opción C — Comida Proteica Rápida**: Omelette de 4 Huevos enteros + 100g de Queso Cottage + Champiñones + 2 Tostadas de Avena integral.\n• **Macros**: 40g Proteína | 35g Carbos | 18g Grasas (490 kcal).`,
        `🥩 **Opción D — Lomo Magro & Carbohidratos Complejos**: 200g de Lomo Magro salteado con pimientos + Camote al horno + Semillas de Chía o Almendras.\n• **Macros**: 44g Proteína | 48g Carbos | 14g Grasas (530 kcal).`
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

    // 6. ESTOICISMO & MENTALIDAD
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
        const systemPrompt = buildCoachSystemPrompt(contextSummary, pastContext, currentArchetype);

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
          console.warn("Gemini Oracle Timeout/Error. Activando respuesta contextual socrática:", e1);
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

