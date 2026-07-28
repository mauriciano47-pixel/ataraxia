import { CoachPatterns } from '@/hooks/useCoachContext';
import { JournalMessage } from '@/hooks/useJournalHistory';

/**
 * Construye el system prompt dinámico para el Coach Estoico de Ataraxia.
 * Inyecta el contexto real del usuario y los patrones detectados.
 */
export function buildCoachSystemPrompt(
  contextSummary: string,
  pastJournalContext: string,
): string {
  return `Eres el COACH DE ATARAXIA — un mentor de fitness, nutrición y alto rendimiento físico con mentalidad de autodisciplina positiva.

## Tu Personalidad
- Respondes con precisión técnica y motivadora en entrenamiento, hipertrofia, resistencia y nutrición deportiva.
- SIN juicios morales sobre comida. Promueves la flexibilidad nutricional y la adherencia sostenible.
- Inspiras constancia, superación personal y enfoque en el esfuerzo presente.
- Tu tono es enérgico, profesional, directo y alentador. Transmites confianza y motivación.
- Integras principios de disciplina consciente y mentalidad ganadora de forma natural y aplicable al fitness.
- Respuestas CONCISAS: máximo 120 palabras. Sé denso en valor práctico y consejos aplicables.

## Reglas Estrictas
- NUNCA diagnostiques ni psicoanalices al usuario.
- NUNCA reemplaces a un nutricionista o médico real.
- Si el usuario describe síntomas médicos, aconseja consultar a un profesional.
- Usa emojis con buen gusto (1-3 por respuesta) para dar energía visual.
- Habla en español (Latinoamérica).

## Contexto Real del Usuario
${contextSummary}

${pastJournalContext ? `\n## Reflexiones Pasadas del Usuario\n${pastJournalContext}` : ''}

## Instrucciones de Respuesta
- Si detectas días sin entrenar, motiva con energía: identifica qué obstáculo hubo y propone cómo retomar hoy.
- Si detectas fatiga o mal sueño, sugiere autorregulación o sesión de recuperación activa.
- Si detectas baja ingesta calórica o de pasos, sugiere estrategias nutricionales o caminata ligera activa.
- Si hay buena racha o metas cumplidas, celebra el esfuerzo y refuerza el hábito.`;
}

/**
 * Genera el mensaje de bienvenida contextual del coach
 * basado en el estado actual del usuario y sus patrones.
 */
export function generateWelcomeMessage(
  patterns: CoachPatterns,
  trainingCompleted: boolean,
  mealsLogged: number,
  waterLitres: number,
  checkInDone: boolean,
): string {
  // Priorizar alertas
  if (patterns.skippedTrainingStreak >= 3) {
    return 'Llevas 3 días sin entrenar. ¡No pasa nada! Lo importante es retomar el impulso hoy. Un buen entrenamiento corto o caminata activa de 20 min reactivará tu energía. ¿Listo para dar el primer paso?';
  }

  if (patterns.skippedTrainingStreak >= 2) {
    return 'Han pasado un par de días de descanso. Tu cuerpo ha recuperado fuerzas, así que hoy es un gran día para una buena sesión. ¿Cómo te sientes para entrenar hoy?';
  }

  if (patterns.showsFatigue) {
    return 'Tu check-in indica baja energía o descanso acumulado. La clave del progreso constante es la autorregulación. Podemos adaptar la rutina a una sesión ligera de movilidad o cardio suelto.';
  }

  if (patterns.needsDeload) {
    return 'Detecto fatiga acumulada esta semana. El descanso es parte fundamental del crecimiento muscular y la fuerza. ¿Qué tal planear una semana de descarga estratégica?';
  }

  if (patterns.undereating) {
    return 'Tu ingesta calórica está por debajo de tu meta. Tu cuerpo necesita combustible de calidad para rendir y recuperar masa muscular. ¿Necesitas ideas de snacks o platos nutritivos?';
  }

  // Estado positivo
  if (trainingCompleted && mealsLogged >= 3 && waterLitres >= 2) {
    return '¡Día completo al 100%! Entreno, nutrición e hidratación impecables. Estás construyendo tu mejor versión paso a paso. ¿Cómo te has sentido durante el entrenamiento?';
  }

  if (trainingCompleted) {
    return '¡Excelente trabajo con el entrenamiento de hoy! Ahora aseguremos una buena recarga de proteínas e hidratación para maximizar tu recuperación.';
  }

  if (patterns.activeStreak >= 7) {
    return `¡${patterns.activeStreak} días seguidos en ritmo activo! La constancia paga con resultados reales. ¿Cómo va tu energía y tus metas para esta semana?`;
  }

  // Default: invitación abierta
  if (!checkInDone) {
    return '¡Hola! Recuerda completar tu check-in diario de energía y sueño en la pantalla principal. Así podremos ajustar tus metas de calorías y entreno con precisión.';
  }

  return '¡Bienvenido de vuelta! Registra tus hábitos, consulta tus calorías y pasos o pregúntame lo que necesites sobre tus rutinas y nutrición de hoy.';
}

/**
 * Construye el historial de conversación para enviar a Gemini
 * manteniendo coherencia multi-turno.
 */
export function buildConversationHistory(
  messages: JournalMessage[],
  newUserMessage: string,
): { role: string; parts: { text: string }[] }[] {
  const history: { role: string; parts: { text: string }[] }[] = [];

  // Convertir mensajes anteriores (sin el disclaimer del bot)
  messages.forEach((msg, index) => {
    // Saltamos el primer mensaje del bot (bienvenida/disclaimer)
    if (index === 0 && msg.sender === 'bot') return;

    history.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  });

  // Añadir el nuevo mensaje del usuario
  history.push({
    role: 'user',
    parts: [{ text: newUserMessage }],
  });

  return history;
}
