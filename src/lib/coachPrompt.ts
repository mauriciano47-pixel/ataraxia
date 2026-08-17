import { CoachPatterns } from '@/hooks/useCoachContext';
import { JournalMessage } from '@/hooks/useJournalHistory';
import { CoachArchetype, CustomExercise } from '@/types/onboarding';

/**
 * Construye el system prompt dinámico para el Coach de Ataraxia
 * adaptado al arquetipo de personalidad seleccionado.
 */
export function buildCoachSystemPrompt(
  contextSummary: string,
  pastJournalContext: string,
  archetype: CoachArchetype = 'stoic_mentor',
): string {
  let personaDirectives = '';

  if (archetype === 'spartan_commander') {
    personaDirectives = `## Tu Identidad: COMANDANTE ESPARTANO ⚔️
- Eres un líder de batalla implacable, noble y de altísima energía. Tu filosofía es la forja del carácter bajo fuego y la disciplina militar inquebrantable.
- Cero excusas: Tratas la pereza como el verdadero enemigo a derrotar. Hablas con convicción, honor y dinamismo espartano ("¡Con tu escudo o sobre él!").
- Enfatizas la intensidad del entrenamiento, la resistencia al sufrimiento voluntario y la hermandad de los guerreros que no se rinden jamás.`;
  } else if (archetype === 'sports_scientist') {
    personaDirectives = `## Tu Identidad: FISIÓLOGO & CIENTÍFICO DEPORTIVO 🔬
- Eres un biohacker y científico del ejercicio de élite. Tu filosofía se basa 100% en fisiología humana, biomecánica y evidencia científica comprobada (metanálisis y estudios de hipertrofia/longevidad).
- Hablas con precisión técnica, educando al atleta con métricas medibles: RPE (esfuerzo percibido), RIR (repeticiones en reserva), ventana de síntesis proteica (MPS), balance hídrico y modulación del cortisol/sueño.
- Eres analítico, didáctico y enfocado en la máxima eficiencia por unidad de tiempo.`;
  } else {
    // Default: stoic_mentor
    personaDirectives = `## Tu Identidad: MENTOR SABIO ESTOICO 🏛️
- Eres un mentor de vida y rendimiento que combina la sabiduría del estoicismo clásico (Marco Aurelio, Séneca, Epicteto) con la templanza física.
- Tu misión es transformar la mente: autodisciplina serena, aceptación de la incomodidad (Amor Fati), claridad en la dicotomía del control y enfoque en el presente.
- Hablas como un maestro noble, respetuoso, reflexivo, motivador y sabio.`;
  }

  return `Eres EL COACH DE ATARAXIA — tu arquetipo activo es: ${archetype.toUpperCase()}.

${personaDirectives}

## Áreas de Conocimiento Amplio
1. **Entrenamiento & Fisiología**:
   - Sobrecarga progresiva, volumen efectivo por grupo muscular (10-20 series/semana).
   - Medición de esfuerzo por RPE (1-10) y RIR (0-4).
   - Selección de ejercicios (multiarticulares vs aislados), descansos estratégicos (90s - 3min).
   - Periodización, deloads y calistenia/gimnasio adaptado al equipo del usuario.

2. **Nutrición Deportiva & Recomposición**:
   - Ajuste de macros: Proteínas (1.6g - 2.2g/kg), Carbohidratos para energía y Grasas saludables.
   - Déficit para pérdida de grasa (300-500 kcal) y Superávit para masa limpia (200-300 kcal).
   - Hidratación con electrólitos (Sodio, Potasio, Magnesio) y suplementación con evidencia (Creatina 3-5g, Whey, Cafeína, Omega 3, Vitamina D3).

3. **Filosofía & Psicología de Alto Rendimiento**:
   - **Amor Fati**: Abrazar el esfuerzo y ver el cansancio como combustible de crecimiento.
   - **Dicotomía del Control**: Enfocar el 100% en las acciones de hoy y soltar la ansiedad del resultado.
   - **Ataraxia**: Mantener la serenidad y la templanza bajo presión física o mental.

## Formato de Rutinas Estructuradas (IMPORTANTE PARA INTERACTIVIDAD)
- Cuando el usuario te pida una rutina o recomiendes entrenar, lista los ejercicios con formato estructurado numérico claro para que la aplicación permita cargarlos con un solo clic. Ejemplo:
  1. **Sentadilla Trasera con Barra**: 4x8 reps (RIR 2)
  2. **Peso Muerto Rumano**: 3x10 reps
  3. **Press Militar con Mancuernas**: 3x10 reps
  4. **Plancha Abdominal**: 3x45 seg

## Regla de Cero Repetición
- NUNCA repitas los mismos ejercicios o recetas que diste en mensajes anteriores de la misma sesión. Ofrece variantes diversas (Empuje, Tracción, Piernas, Calistenia, Salmón, Omelette, Pollo, Lomo Magro).

## Contexto Biométrico y Estado Actual del Atleta
${contextSummary}

${pastJournalContext ? `\n## Historial y Reflexiones Previas\n${pastJournalContext}` : ''}

## Reglas de Seguridad
- NUNCA diagnostiques condiciones médicas ni prescribas tratamientos farmacológicos.
- Idioma: Español con excelente gramática, párrafos concisos y viñetas Markdown.`;
}

/**
 * Genera el mensaje de bienvenida contextual del coach
 * adaptado a los patrones y al arquetipo activo.
 */
export function generateWelcomeMessage(
  patterns: CoachPatterns,
  trainingCompleted: boolean,
  mealsLogged: number,
  waterLitres: number,
  checkInDone: boolean,
  archetype: CoachArchetype = 'stoic_mentor',
): string {
  if (archetype === 'spartan_commander') {
    const spartanQuotes = [
      '⚔️ "¡El sudor en el entrenamiento ahorra sangre en la batalla!"',
      '⚔️ "La debilidad es una decisión. La disciplina es nuestro juramento."',
      '⚔️ "No negociamos con la pereza: ¡vamos al frente con el escudo en alto!"',
    ];
    const quote = spartanQuotes[Math.floor(Math.random() * spartanQuotes.length)];

    if (patterns.skippedTrainingStreak >= 2) {
      return `${quote}\n\n¡Alerta de batalla! Llevas ${patterns.skippedTrainingStreak} días sin registrar combate. Tu armadura se enfría. ¿Listo para una sesión de 25 minutos de fuego puro? Dime tu equipo y te ordeno la rutina.`;
    }
    if (trainingCompleted) {
      return `⚔️ ¡Objetivo de entrenamiento destruido hoy! Has demostrado de qué madera estás hecho. Ahora reabastece el cuerpo con proteína sólida y mantén la guardia alta.`;
    }
    return `${quote}\n\n¡Comandante Espartano en posición! ¿Cuál es la misión de hoy? Pide tu rutina de ataque, estrategia de fuerza o ajuste de macros.`;
  }

  if (archetype === 'sports_scientist') {
    const scienceQuotes = [
      '🔬 "Lo que no se mide, no se puede optimizar. La hipertrofia es pura ciencia aplicada."',
      '🔬 "La sobrecarga progresiva y el balance nitrogenado positivo son las únicas leyes que no mienten."',
      '🔬 "El estímulo genera la señal anabólica; la nutrición y el sueño construyen el tejido."',
    ];
    const quote = scienceQuotes[Math.floor(Math.random() * scienceQuotes.length)];

    if (patterns.showsFatigue || patterns.needsDeload) {
      return `🔋 **Diagnóstico de Biohacking**: Detecto fatiga acumulada en tu check-in. Sugiero calibrar hoy con movilidad articular y cardio Zona 2 para optimizar la recuperación del sistema nervioso simpático.`;
    }
    if (trainingCompleted) {
      return `🧬 ¡Estímulo mecánico completado! La síntesis proteica muscular (MPS) está elevada. Aseguremos 30-40g de aminoácidos esenciales e hidratación con electrólitos para maximizar la síntesis celular.`;
    }
    return `${quote}\n\n¡Sistema de Fisiología Deportiva listo! Consulta tu prescripción de series efectivas (RIR), balance calórico o suplementación con evidencia grado A.`;
  }

  // Default: stoic_mentor
  const stoicQuotes = [
    '🏛️ "La dificultad es lo que le da fuerza a la mente, igual que el trabajo se la da al cuerpo." — Séneca.',
    '🏛️ "No nos atrevemos a muchas cosas porque son difíciles, pero son difíciles porque no nos atrevemos." — Séneca.',
    '🏛️ "No expliques tu filosofía, encárnala en tus actos de hoy." — Epicteto.',
    '🏛️ "El obstáculo en el camino se convierte en el camino." — Marco Aurelio.',
  ];
  const randomQuote = stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)];

  if (patterns.skippedTrainingStreak >= 3) {
    return `${randomQuote}\n\nLlevas 3 días sin registrar entrenamiento. El descanso fue necesario, pero hoy es el momento de reiniciar el impulso con Amor Fati. ¿Qué tal una sesión adaptada ahora mismo?`;
  }
  if (patterns.showsFatigue) {
    return `🛡️ Tu check-in refleja fatiga. El Coach Sabio sabe cuándo apretar y cuándo autorregular. Hoy podemos enfocar en movilidad y recuperación activa.`;
  }
  if (trainingCompleted) {
    return `🏆 ¡Entrenamiento de hoy completado con éxito! El esfuerzo fortalece el templo. Recuerda hidratarte y nutrir tu cuerpo con alimentos nobles.`;
  }
  if (!checkInDone) {
    return `${randomQuote}\n\n¡Bienvenido al Santuario! Recuerda realizar tu Check-In diario para calibrar con precisión tu jornada de hoy.`;
  }

  return `${randomQuote}\n\n¡Tu Coach Estoico está listo! Pregúntame sobre tus rutinas, recetas con macros, suplementación o cualquier desafío mental que quieras superar.`;
}

/**
 * Extrae ejercicios estructurados de un texto o respuesta del coach
 * para permitir cargarlos directamente en el Trainer con 1 clic.
 */
export function extractExercisesFromText(text: string): CustomExercise[] {
  const exercises: CustomExercise[] = [];
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    // Detectar patrones tipo: "1. **Nombre**: 4x8" o "• **Nombre** - 3x10" o "1. Nombre: 4x10"
    const match = line.match(/(?:^\s*(?:\d+[\.\)]|[-*•])\s*)(?:\*\*)?([^*\n:]+)(?:\*\*)?\s*[:\-–]\s*(.+)/);
    if (match) {
      const name = match[1].replace(/\*\*/g, '').trim();
      let setsReps = match[2].replace(/\*\*/g, '').trim();

      // Filtrar frases que no sean ejercicios reales
      if (
        name.length > 2 &&
        name.length < 50 &&
        !name.toLowerCase().includes('opción') &&
        !name.toLowerCase().includes('propuesta') &&
        !name.toLowerCase().includes('nota') &&
        !name.toLowerCase().includes('macros') &&
        !name.toLowerCase().includes('plato')
      ) {
        exercises.push({
          id: `coach_ex_${Date.now()}_${index}`,
          n: name,
          s: setsReps,
          done: false,
          rpe: null,
        });
      }
    }
  });

  return exercises;
}

/**
 * Construye el historial de conversación para enviar a Gemini
 */
export function buildConversationHistory(
  messages: JournalMessage[],
  newUserMessage: string,
): { role: string; parts: { text: string }[] }[] {
  const history: { role: string; parts: { text: string }[] }[] = [];

  messages.forEach((msg, index) => {
    if (index === 0 && msg.sender === 'bot') return;

    history.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  });

  history.push({
    role: 'user',
    parts: [{ text: newUserMessage }],
  });

  return history;
}
