import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleGenAI } from '@google/genai';

import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import { useDailyLog } from '@/context/DailyLogContext';

export interface ExerciseGuideData {
  id: string;
  name: string;
  setsReps: string;
  targetRpe?: number;
  muscleGroup: string;
  cue: string;
  setupGuide?: string;
  executionGuide?: string;
  criticalMistakes?: string[];
  alternative?: string;
}

// DICCIONARIO BIOMECÁNICO COMPLETO PARA LOS EJERCICIOS DEL PROGRAMA DE 30 DÍAS
export const EXERCISE_GUIDE_DATABASE: Record<string, Omit<ExerciseGuideData, 'id' | 'name' | 'setsReps' | 'targetRpe' | 'muscleGroup' | 'cue'>> = {
  // --- ESPARTANO ---
  'Sentadilla Trasera Pesada con Barra': {
    setupGuide: 'Coloca la barra sobre los trapecios (barra alta) o deltoides posteriores (barra baja). Pies a la anchura de hombros, puntas abiertas 15-30°. Inhala aire al abdomen creando presión intra-abdominal.',
    executionGuide: 'Desciende flexionando rodillas y cadera simultáneamente hasta que las caderas queden paralelas o por debajo de las rodillas. Empuja el suelo con fuerza desde la mitad del pie y talones manteniendo el pecho erguido.',
    criticalMistakes: ['Colapsar las rodillas hacia adentro (valgo de rodilla).', 'Despegar los talones del suelo al bajar.', 'Redondear la zona lumbar (guiño de glúteo severo).'],
    alternative: 'Sentadilla Goblet con mancuerna pesada o Prensa de Piernas a 45°.',
  },
  'Press de Banca Plano Olímpico': {
    setupGuide: 'Túmbate con ojos alineados bajo la barra. Junta y deprime tus escápulas contra el banco creando un arco natural. Apoya firmemente los pies en el suelo (Leg Drive). Agarre a 1.5 veces el ancho de hombros.',
    executionGuide: 'Desencaja la barra y desciende de forma controlada hacia la parte baja del esternón con los codos a 45° del torso. Toca suavemente el pecho y empuja explosivamente hacia arriba y ligeramente hacia atrás.',
    criticalMistakes: ['Abrir los codos a 90° respecto al torso (peligro para el manguito rotador).', 'Despegar los glúteos del banco durante el empuje.', 'Rebotar la barra contra el esternón.'],
    alternative: 'Press con mancuernas en banco plano o Flexiones con pies elevados.',
  },
  'Peso Muerto Convencional Pesado': {
    setupGuide: 'Pies a la anchura de caderas con la barra pegada a las espinillas (sobre el empeine). Agarre justo por fuera de las piernas. Lleva las caderas hacia atrás, activa los dorsales («dobla la barra») y mantén la espalda neutra.',
    executionGuide: 'Inhala profundamente y empuja el suelo con las piernas manteniendo la barra pegada al cuerpo en todo el recorrido. Al pasar las rodillas, extiende la cadera bloqueando glúteos sin arquear hacia atrás.',
    criticalMistakes: ['Iniciar el levantamiento con la espalda baja redondeada.', 'Alejar la barra del cuerpo durante el ascenso.', 'Hiper-extender la zona lumbar en el bloqueo.'],
    alternative: 'Peso Muerto Rumano con mancuernas o Trap Bar Deadlift.',
  },
  'Press Militar de Pie con Barra': {
    setupGuide: 'Barra apoyada sobre las clavículas y deltoides frontales. Pies a la anchura de hombros. Aprieta glúteos, cuádriceps y abdomen con máxima rigidez.',
    executionGuide: 'Empuja la barra verticalmente en línea recta retrayendo ligeramente la cabeza para que pase la barra. Una vez sobre la cabeza, mete la cabeza entre los brazos y bloquea los codos.',
    criticalMistakes: ['Arquear excesivamente la espalda baja para compensar.', 'Usar impulso de las piernas (eso sería Push Press).', 'Mirar hacia el techo en lugar de al frente.'],
    alternative: 'Press Militar sentado con mancuernas o Flexiones en Pica.',
  },
  'Remo Pendlay con Barra': {
    setupGuide: 'Barra en el suelo en cada repetición. Torso completamente paralelo al suelo (90°). Espalda recta y rodillas ligeramente flexionadas.',
    executionGuide: 'Tira de la barra de forma explosiva hacia el abdomen alto/esternón llevando los codos hacia atrás y arriba. Devuelve la barra al suelo con control y apóyala antes de la siguiente rep.',
    criticalMistakes: ['Erguir el torso para impulsarse con las piernas.', 'Tirar con los bíceps en lugar de juntar escápulas.', 'Redondear la columna dorsal.'],
    alternative: 'Remo con mancuerna a una mano apoyado en banco.',
  },
  'Sentadilla Goblet Pesada con Mancuerna': {
    setupGuide: 'Sostén una mancuerna verticalmente pegada a tu esternón con ambas manos bajo el disco superior. Pies abiertos al ancho de hombros.',
    executionGuide: 'Baja las caderas controladamente manteniendo el torso erguido. Los codos deben deslizarse por dentro de las rodillas en la parte más profunda. Empuja desde el suelo con fuerza.',
    criticalMistakes: ['Inclinar el torso demasiado hacia adelante.', 'Alejar la mancuerna del pecho.', 'Levantar los talones del suelo.'],
    alternative: 'Sentadilla con mochila cargada o Sentadillas búlgaras.',
  },
  'Press de Pecho en Suelo/Banco con Mancuernas': {
    setupGuide: 'Túmbate en el suelo o banco con las mancuernas sobre el pecho. Escápulas retraídas y pies firmes.',
    executionGuide: 'Baja las mancuernas hasta que los tríceps toquen suavemente el suelo (o rocen el pecho si es en banco). Pausa 1 segundo y empuja arriba contrayendo el pectoral.',
    criticalMistakes: ['Dejar caer los codos bruscamente contra el suelo.', 'Juntar o chocar las mancuernas arriba.', 'Perder la retracción escapular.'],
    alternative: 'Flexiones declinadas con pausa.',
  },
  'Peso Muerto Rumano con Mancuernas': {
    setupGuide: 'De pie con una mancuerna en cada mano frente a los muslos. Rodillas con micro-flexión fija (no rígidas, pero sin doblarse al bajar).',
    executionGuide: 'Empuja las caderas hacia atrás como si quisieras tocar una pared con los glúteos. Las mancuernas bajan rozando las piernas hasta justo debajo de las rodillas. Siente el estiramiento en isquiosurales y contrae glúteos al subir.',
    criticalMistakes: ['Doblar las rodillas como en una sentadilla.', 'Dejar que la espalda baja se encorve.', 'Mirar hacia arriba tensionando el cuello.'],
    alternative: 'Buenos días con banda elástica o Peso Muerto a una pierna.',
  },

  // --- CALISTENIA & HOPLITA / APOLO ---
  'Dominadas Pronas Estrictas': {
    setupGuide: 'Agarre prono (palmas hacia adelante) ligeramente más ancho que los hombros. Cuelga en suspensión pasiva antes de iniciar.',
    executionGuide: 'Inicia deprimiendo las escápulas (retracción escapular activa). Tira con los codos hacia abajo y atrás hasta que tu barbilla supere con claridad la barra. Desciende con control total de 2-3 segundos.',
    criticalMistakes: ['Usar balanceo o patada (kipping).', 'No completar el rango de bajada (brazos estirados).', 'Encoger los hombros hacia las orejas.'],
    alternative: 'Dominadas con banda de resistencia o Remos invertidos en mesa.',
  },
  'Fondos en Paralelas / Dips': {
    setupGuide: 'Súbete a las barras paralelas con los brazos bloqueados. Inclina el torso unos 15-20° hacia adelante para enfatizar el pecho.',
    executionGuide: 'Desciende flexionando los codos hasta que los brazos formen un ángulo de 90°. Empuja con fuerza las barras hacia abajo extendiendo los brazos sin encoger los hombros.',
    criticalMistakes: ['Bajar en exceso dañando la cápsula anterior del hombro.', 'Mantener el torso 100% vertical (sobrecarga los tríceps y clavícula).', 'Balancear las piernas.'],
    alternative: 'Fondos entre dos sillas estables o Flexiones diamante.',
  },
  'Pistol Squats Asistidas / Búlgaras al Fallo': {
    setupGuide: 'Apóyate sobre una sola pierna. Si es búlgara, apoya el empeine del pie trasero sobre un banco/silla a 40cm de altura.',
    executionGuide: 'Desciende verticalmente flexionando la pierna delantera hasta que el muslo quede paralelo al suelo y la rodilla trasera casi toque el suelo. Empuja desde el talón delantero.',
    criticalMistakes: ['Cargar todo el peso en la pierna trasera.', 'Colapsar la rodilla delantera hacia adentro.', 'Arquear la zona lumbar.'],
    alternative: 'Zancadas estáticas o Sentadilla goblet con ambos pies.',
  },
  'Flexiones en Pica Elevadas (Pike Push-ups)': {
    setupGuide: 'Colócate en posición de flexión con las caderas elevadas hacia el techo formando una "V" invertida. Pies en suelo o elevados sobre silla.',
    executionGuide: 'Flexiona los codos descendiendo la cabeza hacia adelante en forma de trípode (no entre las manos). Empuja el suelo alejándote hacia la posición inicial.',
    criticalMistakes: ['Bajar la cabeza directamente entre las manos.', 'Separar los codos en exceso.', 'Dejar caer las caderas.'],
    alternative: 'Press militar con mancuernas o Flexiones estándar.',
  },
  'Elevaciones Laterales Estrictas con Mancuerna': {
    setupGuide: 'De pie o sentado con mancuernas a los lados. Codos con una micro-flexión fija de 10-15° y torso ligeramente inclinado 5° al frente.',
    executionGuide: 'Eleva los brazos en el plano escapular (30° hacia adelante respecto al torso) guiando el movimiento con los codos hasta la altura de los hombros. Pausa de 1 segundo arriba y baja en 3 segundos.',
    criticalMistakes: ['Usar balanceo del cuerpo para subir el peso.', 'Elevar las manos por encima de los codos.', 'Subir demasiado alto activando los trapecios.'],
    alternative: 'Elevaciones laterales con botellas de agua o bandas de resistencia.',
  },
  'Paseo del Granjero Pesado (Farmer Walk)': {
    setupGuide: 'Toma dos pesos pesados (mancuernas, garrafas o barras) a los costados del cuerpo. Pecho erguido, hombros atrás y mirada al frente.',
    executionGuide: 'Camina con pasos cortos, firmes y controlados manteniendo el abdomen apretado como una roca. No permitas que el peso oscile ni se balancee.',
    criticalMistakes: ['Inclinarse hacia los lados o encorvar la espalda.', 'Dar pasos demasiado largos perdiendo el equilibrio.', 'Dejar que los hombros se vayan hacia adelante.'],
    alternative: 'Sostenimiento estático de peso de pie (Farmer Hold).',
  },
  'Plancha Abdominal de Acero': {
    setupGuide: 'Apoya los antebrazos en el suelo alineados bajo los hombros. Pies juntos apoyados en las puntas.',
    executionGuide: 'Realiza una retroversión pélvica (aprieta glúteos y mete el ombligo hacia adentro). Mantén una línea recta desde la cabeza hasta los talones con tensión máxima.',
    criticalMistakes: ['Dejar caer la cadera hacia el suelo (hiperlordosis).', 'Elevar los glúteos formando una carpa.', 'Contener la respiración.'],
    alternative: 'Plancha con rodillas apoyadas o Deadbug.',
  },
};

interface Props {
  visible: boolean;
  exercise: ExerciseGuideData | null;
  onClose: () => void;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || '';
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export function ExerciseTechniqueModal({ visible, exercise, onClose }: Props) {
  const { log } = useDailyLog();
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [showAiBox, setShowAiBox] = useState<boolean>(false);

  if (!exercise) return null;

  // Buscar datos biomecánicos en la base de datos o generar genéricos de alta calidad
  const guideDetail = EXERCISE_GUIDE_DATABASE[exercise.name] || {
    setupGuide: `Adopta una postura sólida con los pies firmes y el core activo. Inhala aire diafragmático para estabilizar la columna antes de iniciar ${exercise.name}.`,
    executionGuide: `Ejecuta el movimiento controlando la fase de descenso en 2-3 segundos. En la fase concéntrica, empuja o tira de forma potente concentrándote en el grupo muscular: ${exercise.muscleGroup}.`,
    criticalMistakes: [
      'Usar impulso corporal excesivo en lugar de tensión muscular controlada.',
      'Perder la alineación de la columna vertebral.',
      'Descuidar la respiración intra-abdominal en cargas altas.',
    ],
    alternative: 'Adaptar el rango de movimiento o reducir el peso en un 20% manteniendo la técnica estricta.',
  };

  const handleAskMentor = async () => {
    if (!aiQuestion.trim() && !exercise.name) return;
    setIsAiLoading(true);
    setAiResponse(null);

    try {
      if (!ai) {
        setAiResponse(
          `Mentor Estoico: Para dominar «${exercise.name}», enfócate en la conexión mente-músculo y la respiración. Nunca sacrifiques la forma por el ego del peso.`
        );
        setIsAiLoading(false);
        return;
      }

      const athleteName = log.userName && log.userName !== 'Ciudadano Prokopton' ? log.userName : 'Guerrero';
      const path = log.legendaryPath || 'spartan';
      const experienceLevel = log.prokoptonProfile?.experienceLevel || 'intermediate';
      const protectedZones = log.prokoptonProfile?.protectedZones && log.prokoptonProfile.protectedZones.length > 0 && !log.prokoptonProfile.protectedZones.includes('none' as any)
        ? log.prokoptonProfile.protectedZones.join(', ')
        : 'ninguna';

      const prompt = `Eres el Mentor de Entrenamiento y Biomecánica de Ataraxia. Explica de forma concisa, estoica y anatómicamente precisa cómo realizar este ejercicio para el atleta ${athleteName} (Senda: ${path.toUpperCase()}, Nivel: ${experienceLevel}):
Ejercicio: "${exercise.name}"
Grupo Muscular: "${exercise.muscleGroup}"
Zonas anatómicas protegidas / articulaciones a cuidar: "${protectedZones}" (Si el ejercicio involucra o impacta estas áreas, incluye advertencias biomecánicas y adaptaciones específicas)
Duda del alumno: "${aiQuestion || '¿Cuáles son las claves para hacerlo perfecto y no lesionarme?'}"

Responde en máximo 3 párrafos breves con viñetas:
1. Posición y técnica clave adaptada a su nivel.
2. Cómo sentir el músculo correcto y proteger articulaciones.
3. Máxima de disciplina estoica para este levantamiento.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      setAiResponse(response.text?.trim() || 'Ejecuta con control y paciencia estoica.');
    } catch {
      setAiResponse(
        `Mentor Estoico: La clave de ${exercise.name} es la sobriedad en la carga: 2 segundos de bajada controlada, 1 segundo de pausa y empuje firme sin balanceos.`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* HEADER DEL MODAL */}
          <View style={styles.modalHeaderRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <ThemedText style={styles.categoryBadgeText}>
                    {exercise.muscleGroup.toUpperCase()}
                  </ThemedText>
                </View>
                {exercise.targetRpe && (
                  <View style={styles.rpeBadge}>
                    <ThemedText style={styles.rpeBadgeText}>
                      RPE {exercise.targetRpe}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={styles.exerciseTitle}>{exercise.name}</ThemedText>
              <ThemedText style={styles.exerciseSetsSub}>
                📋 Meta: {exercise.setsReps}
              </ThemedText>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeIconBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* 1. CLAVE RÁPIDA / CUE */}
            <View style={styles.cueBox}>
              <Ionicons name="bulb-outline" size={18} color="#FFE259" />
              <ThemedText style={styles.cueBoxText}>
                <ThemedText style={styles.boldGold}>Clave Maestra: </ThemedText>
                {exercise.cue}
              </ThemedText>
            </View>

            {/* 2. PASO A PASO BIOMECÁNICO */}
            <View style={styles.sectionBlock}>
              <ThemedText style={styles.sectionHeaderTitle}>🏛️ GUÍA DE EJECUCIÓN PASO A PASO</ThemedText>

              {/* FASE 1: PREPARACIÓN */}
              <View style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <ThemedText style={styles.stepNumberText}>1</ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.stepTitle}>Posición Inicial & Ajuste (Setup)</ThemedText>
                  <ThemedText style={styles.stepDesc}>{guideDetail.setupGuide}</ThemedText>
                </View>
              </View>

              {/* FASE 2: EJECUCIÓN Y DESCENSO */}
              <View style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <ThemedText style={styles.stepNumberText}>2</ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.stepTitle}>Fase Excéntrica & Empuje</ThemedText>
                  <ThemedText style={styles.stepDesc}>{guideDetail.executionGuide}</ThemedText>
                </View>
              </View>
            </View>

            {/* 3. ERRORES CRÍTICOS A EVITAR */}
            {guideDetail.criticalMistakes && (
              <View style={styles.mistakesBlock}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Ionicons name="warning-outline" size={16} color="#EF4444" />
                  <ThemedText style={styles.mistakesTitle}>⚠️ ERRORES A EVITAR (PREVENCIÓN):</ThemedText>
                </View>
                {guideDetail.criticalMistakes.map((mistake, i) => (
                  <View key={i} style={styles.mistakeItemRow}>
                    <ThemedText style={styles.mistakeBullet}>❌</ThemedText>
                    <ThemedText style={styles.mistakeText}>{mistake}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* 4. ALTERNATIVA / REGRESIÓN */}
            {guideDetail.alternative && (
              <View style={styles.altBox}>
                <Ionicons name="swap-horizontal-outline" size={18} color="#38BDF8" />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.altTitle}>¿Muy difícil o te falta equipo?</ThemedText>
                  <ThemedText style={styles.altText}>
                    Alternativa recomendada: <ThemedText style={styles.boldWhite}>{guideDetail.alternative}</ThemedText>
                  </ThemedText>
                </View>
              </View>
            )}

            {/* 5. CONSULTA CON EL MENTOR IA */}
            <View style={styles.mentorSection}>
              <TouchableOpacity
                style={styles.toggleMentorBtn}
                activeOpacity={0.8}
                onPress={() => setShowAiBox(!showAiBox)}
              >
                <Ionicons name="chatbubbles-outline" size={16} color="#FFE259" />
                <ThemedText style={styles.toggleMentorBtnText}>
                  {showAiBox ? 'Ocultar Oráculo IA' : '¿Dudas con este ejercicio? Preguntar al Oráculo IA'}
                </ThemedText>
                <Ionicons
                  name={showAiBox ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#FFE259"
                />
              </TouchableOpacity>

              {showAiBox && (
                <View style={styles.aiBoxInner}>
                  <TextInput
                    style={styles.aiInput}
                    placeholder="Ej: Siento molestia en la rodilla, ¿cómo la coloco?"
                    placeholderTextColor="#64748B"
                    value={aiQuestion}
                    onChangeText={setAiQuestion}
                  />

                  <TouchableOpacity
                    style={styles.askAiButton}
                    onPress={handleAskMentor}
                    disabled={isAiLoading}
                    activeOpacity={0.8}
                  >
                    {isAiLoading ? (
                      <ActivityIndicator size="small" color="#050507" />
                    ) : (
                      <>
                        <Ionicons name="flash" size={14} color="#050507" />
                        <ThemedText style={styles.askAiButtonText}>CONSULTAR AL MENTOR</ThemedText>
                      </>
                    )}
                  </TouchableOpacity>

                  {aiResponse && (
                    <View style={styles.aiResponseCard}>
                      <ThemedText style={styles.aiResponseTitle}>⚡ GUÍA DEL MENTOR ESTOICO:</ThemedText>
                      <ThemedText style={styles.aiResponseContent}>{aiResponse}</ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* BOTÓN ENTENDIDO */}
          <TouchableOpacity style={styles.gotItButton} onPress={onClose} activeOpacity={0.85}>
            <LinearGradient
              colors={['#D4AF37', '#F59E0B', '#B45309']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gotItGradient}
            >
              <ThemedText style={styles.gotItText}>ENTENDIDO, A ENTRENAR ⚔️</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0C101C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFE259',
    fontFamily: 'monospace',
  },
  rpeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rpeBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FBBF24',
    fontFamily: 'monospace',
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  exerciseSetsSub: {
    fontSize: 12,
    color: '#CBD5E1',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    marginVertical: 12,
  },
  cueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 226, 89, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  cueBoxText: {
    flex: 1,
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  boldGold: {
    fontWeight: '900',
    color: '#FFE259',
  },
  boldWhite: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionBlock: {
    gap: 8,
    marginBottom: 14,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#050507',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  mistakesBlock: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 14,
  },
  mistakesTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F87171',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  mistakeItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  mistakeBullet: {
    fontSize: 11,
    marginTop: 2,
  },
  mistakeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#FECACA',
    lineHeight: 16,
  },
  altBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  altTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 2,
  },
  altText: {
    fontSize: 11.5,
    color: '#E0F2FE',
    lineHeight: 16,
  },
  mentorSection: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 10,
    marginBottom: 10,
  },
  toggleMentorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 4,
  },
  toggleMentorBtnText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFE259',
  },
  aiBoxInner: {
    marginTop: 10,
    gap: 8,
  },
  aiInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#FFFFFF',
  },
  askAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFE259',
    borderRadius: 8,
    paddingVertical: 8,
  },
  askAiButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#050507',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  aiResponseCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#FFE259',
    borderRadius: 8,
    padding: 10,
    gap: 4,
    marginTop: 4,
  },
  aiResponseTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFE259',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  aiResponseContent: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  gotItButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  gotItGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#050507',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
});
