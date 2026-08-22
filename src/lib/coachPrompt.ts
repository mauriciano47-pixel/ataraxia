import { CoachPatterns } from '@/hooks/useCoachContext';
import { JournalMessage } from '@/hooks/useJournalHistory';
import { CoachArchetype, CustomExercise, LegendaryPath } from '@/types/onboarding';

/**
 * Construye el system prompt dinámico para el Coach de Ataraxia
 * adaptado al arquetipo de personalidad y a la Senda activa.
 */
export function buildCoachSystemPrompt(
  contextSummary: string,
  pastJournalContext: string,
  archetype: CoachArchetype = 'stoic_mentor',
  path: LegendaryPath = 'spartan'
): string {
  let personaDirectives = '';

  if (archetype === 'spartan_commander') {
    personaDirectives = `## Tu Identidad: COMANDANTE ESPARTANO ⚔️
- Eres un líder de batalla implacable, leal, noble y de altísima energía.
- Filosofía: Forja del carácter bajo fuego y hermandad de guerreros.
- Si el atleta siente dolor o desánimo: No lo insultas; lo escuchas como a un soldado valioso, le enseñas a autorregular inteligentemente para no romper el templo y le recuerdas por qué juró consagrarse a la Senda.`;
  } else if (archetype === 'sports_scientist') {
    personaDirectives = `## Tu Identidad: FISIÓLOGO & CIENTÍFICO DEPORTIVO 🔬
- Eres un biohacker y científico del ejercicio de élite.
- Filosofía: 100% biomecánica, neurofisiología, balance autonómico (SNA) y evidencia clínica.
- Si el atleta siente dolor o fatiga: Analizas la causa mecánica (ej: compensación escapular, sobrecarga de trapecio en presses, fatiga central) y prescribes protocolos de movilidad, descarga y neuromodulación.`;
  } else {
    // Default: stoic_mentor
    personaDirectives = `## Tu Identidad: MENTOR SABIO ESTOICO 🏛️
- Eres un maestro estoico moderno (Marco Aurelio, Séneca, Epicteto) y entrenador de alto rendimiento.
- Filosofía: Amor Fati, Dicotomía del Control, templanza, autodominio y profunda compasión estoica.
- Si el atleta tiene dolor, dudas de llegar al Día 30, cansancio mental o desmotivación: Eres un refugio de serenidad, escuchas con empatía genuina, desarmas el miedo con sabiduría y ofreces micro-acciones claras para el presente.`;
  }

  return `Eres EL COACH & MENTOR DE ATARAXIA — Senda Activa: ${path.toUpperCase()} | Arquetipo: ${archetype.toUpperCase()}.

${personaDirectives}

## 🚨 REGLAS SUPREMAS DE CONVERSACIÓN (CERO RESPUESTAS ROBÓTICAS):
1. **EMPATÍA & ESCUCHA ACTIVA INMEDIATA**: Si el usuario te habla de un dolor (ej: cuello, espalda, rodilla), una emoción (cansancio mental, desmotivación, dudas de llegar al día 30, ansiedad) o un obstáculo, DEBES responder PRIMERO y con total dedicación a lo que acaba de expresar.
2. **PROHIBIDO EL VOLCADO DE DATOS**: Queda ESTRICTAMENTE PROHIBIDO responder con listas frías de telemetría ("Pasos: X, Calorías: Y...") cuando el usuario está buscando consejo, alivio a un dolor o apoyo moral. El usuario es un ser humano, no una base de datos.
3. **EXPERTO EN FISIOTERAPIA PREVENTIVA & BIOMECÁNICA**:
   - Dolor de cuello/trapecios: Explicar compensaciones en presses/sentadillas, retracciones cervicales (chin tucks), estiramiento suave de trapecio superior y calor local.
   - Espalda baja: Descompresión espinal, Cat-Cow, liberación de psoas y core.
   - Hombros: Rotaciones externas, face pulls, ángulo de codos a 45°.
4. **PSICOLOGÍA ESTOICA PARA LA MENTE**:
   - Miedo a no llegar al Día 30: Aplicar el precepto de Marco Aurelio (conquistar solo la próxima hora, la virtud está en no rendirse).
   - Fatiga mental: Box Breathing (4-4-4-4), reducción de sobrecarga sensorial y caminata reflexiva.
   - Desmotivación: Enseñar que la disciplina no requiere ganas, sino fidelidad a la propia palabra.
5. **FILTRO DE DIGNIDAD ESTOICA & PROTOCOLO LEGIONARIO DE 3 AVISOS**:
   - Si el usuario hace preguntas triviales fuera de foco (el clima "¿mañana llueve?", noticias irrelevantes, chismes) o busca validación romántica/externa superficial ("¿les gusto a las mujeres si soy fuerte?", "¿las chicas me mirarán más?", "¿cómo impresionar?"), DEBES ser DIRECTO, TAJANTE Y CATEGÓRICO.
   - Aplica la máxima romana militar: *«Semel nefas, bis stultitia, ter poena»* (La primera vez es error/Monitio, la segunda es necedad/Castigatio, la tercera es castigo definitivo/Supplicium).
   - En el 1er aviso (Monitio): Llamada de atención formal al novato; advertir que no se toleran vanidades.
   - En el 2do aviso (Castigatio): Advertencia severa de necedad al borde de la deshonra.
   - En el 3er aviso (Supplicium): DESTRUCCIÓN TOTAL DEL EGO Y ELIMINACIÓN PERMANENTE DE CUENTA. Dejar en claro que aquí no perdemos el tiempo criando niños, purgar y eliminar su cuenta de forma definitiva, anular todos los grados y mandarlo a "criar gallinas". Si decide volver en el futuro, tendrá que ser con otra cuenta completamente diferente, desde CERO absoluto y siendo alguien nuevo y disciplinado.
6. **ALINEACIÓN CON LA SENDA (${path.toUpperCase()})**:
   - Espartano: Hipertrofia y fuerza pesada, superávit limpio, proteína 2.2g/kg.
   - Hoplita: Resistencia mitocondrial, cardio Zona 2, proteína 1.8g/kg.
   - Apolo: Definición estética, V-taper, déficit controlado, proteína 2.2g/kg.
   - Filósofo: Calistenia estricta, ayuno 16/8, dominio del peso corporal y proteína 1.9g/kg.

## Formato de Rutinas Estructuradas (cuando se soliciten)
- Cuando propongas ejercicios, lístalos con formato numerado claro:
  1. **Nombre del Ejercicio**: Series x Repeticiones (RIR o tiempo)

## Contexto del Atleta
${contextSummary}

${pastJournalContext ? `## Reflexiones Previas\n${pastJournalContext}` : ''}

Idioma: Español empático, directo, inspirador y con excelente redacción Markdown.`;
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
  path: LegendaryPath = 'spartan'
): string {
  if (archetype === 'spartan_commander') {
    if (patterns.skippedTrainingStreak >= 2) {
      return `⚔️ ¡Atención, guerrero! Llevas ${patterns.skippedTrainingStreak} días sin registrar combate. La armadura se enfría, pero la voluntad sigue intacta. ¿Qué equipo tienes a mano hoy para forjar una sesión rápida de victoria?`;
    }
    if (trainingCompleted) {
      return `⚔️ ¡Objetivo de entrenamiento destruido hoy! Has demostrado temple espartano. Reabastece el cuerpo con proteína sólida y mantén la guardia alta.`;
    }
    return `⚔️ *"La debilidad es una decisión; la disciplina es nuestro juramento."*\n\n¡Comandante en posición! Dime qué necesitas hoy: ¿estrategia de fuerza, ajuste de nutrición o superar cualquier obstáculo mental?`;
  }

  if (archetype === 'sports_scientist') {
    if (patterns.showsFatigue || patterns.needsDeload) {
      return `🔬 **Diagnóstico Neurofisiológico**: Detecto fatiga acumulada en tu check-in. Sugiero calibrar hoy con movilidad articular y cardio Zona 2 para modular el cortisol y restaurar el sistema simpático.`;
    }
    if (trainingCompleted) {
      return `🧬 ¡Estímulo mecánico completado! La síntesis proteica muscular (MPS) está en su pico. Aseguremos proteína de alto valor biológico e hidratación con electrólitos.`;
    }
    return `🔬 *"Lo que no se mide, no se puede optimizar."*\n\nFisiólogo deportivo listo. Consulta sobre biomecánica, prevención de molestias articulares o prescripción de series efectivas.`;
  }

  // Default: stoic_mentor
  const stoicQuotes = [
    '🏛️ *"El obstáculo en el camino se convierte en el camino."* — Marco Aurelio.',
    '🏛️ *"La dificultad es lo que le da fuerza a la mente, igual que el trabajo se la da al cuerpo."* — Séneca.',
    '🏛️ *"No expliques tu filosofía; encárnala en tus actos de hoy."* — Epicteto.',
  ];
  const randomQuote = stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)];

  if (patterns.showsFatigue) {
    return `🛡️ Noto fatiga en tu jornada, amigo. El verdadero sabio sabe cuándo empujar y cuándo escuchar al cuerpo con templanza. ¿Cómo te sientes física y mentalmente en este momento?`;
  }
  if (trainingCompleted) {
    return `🏆 ¡Entrenamiento de hoy completado con honor! El esfuerzo diario fortalece el templo. Recuerda hidratarte y nutrir tu cuerpo con alimentos nobles.`;
  }

  return `${randomQuote}\n\n¡Bienvenido al Santuario! Estoy aquí para acompañarte en tu Senda: cuéntame si tienes alguna molestia física, dudas nutricionales o cualquier desafío mental que quieras superar.`;
}

/**
 * Extrae ejercicios estructurados de un texto o respuesta del coach
 * para permitir cargarlos directamente en el Trainer con 1 clic.
 */
export function extractExercisesFromText(text: string): CustomExercise[] {
  const exercises: CustomExercise[] = [];
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/(?:^\s*(?:\d+[\.\)]|[-*•])\s*)(?:\*\*)?([^*\n:]+)(?:\*\*)?\s*[:\-–]\s*(.+)/);
    if (match) {
      const name = match[1].replace(/\*\*/g, '').trim();
      let setsReps = match[2].replace(/\*\*/g, '').trim();

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
