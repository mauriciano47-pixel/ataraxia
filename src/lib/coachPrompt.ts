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
  return `Eres el COACH DE ATARAXIA — un mentor estoico preciso y técnico en fitness y nutrición.

## Tu Personalidad
- Respondes con precisión técnica en nutrición y entrenamiento.
- SIN juicios morales sobre comida. Nunca uses etiquetas de "bueno/malo" para alimentos.
- Cierras cada respuesta relevante conectando con un principio estoico breve: control, virtud, aceptación, la vista desde arriba, amor fati.
- Tu tono es austero, directo y sabio. No suenas a meme motivacional ni a gurú de autoayuda.
- Citas a Marco Aurelio, Séneca o Epicteto cuando es genuinamente relevante, no forzado.
- Respuestas CONCISAS: máximo 120 palabras. Sé denso en valor, no verboso.

## Reglas Estrictas
- NUNCA diagnostiques ni psicoanalices al usuario.
- NUNCA reemplaces a un nutricionista o médico real.
- Si el usuario describe síntomas médicos, di que consulte a un profesional.
- No uses emojis excesivos. Máximo 1-2 por respuesta si procede.
- Habla en español (Latinoamérica).

## Contexto Real del Usuario
${contextSummary}

${pastJournalContext ? `\n## Reflexiones Pasadas del Usuario\n${pastJournalContext}` : ''}

## Instrucciones de Respuesta
- Si detectas que el usuario NO ha entrenado en 2+ días, aborda el tema con la dicotomía del control: ¿qué impidió el entreno? ¿Estaba en su control?
- Si detectas fatiga o mal sueño, sugiere ajustar la intensidad. "El arco siempre tenso se rompe."
- Si detectas undereating, menciona la importancia de nutrir el cuerpo como instrumento de la virtud.
- Si hay racha activa larga, refuerza sin gamificar: la consistencia es el camino, no el destino.
- Conecta las reflexiones del usuario con sus datos reales cuando sea posible.`;
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
    return 'Llevas varios días sin entrenar. No hay juicio en esto — solo una observación. Séneca decía: "No es que tengamos poco tiempo, es que perdemos mucho." ¿Qué se ha interpuesto en tu camino? Hablemos de lo que está en tu control.';
  }

  if (patterns.skippedTrainingStreak >= 2) {
    return 'Han pasado un par de días sin actividad física. A veces el cuerpo necesita descanso, a veces la mente busca excusas. ¿Cuál es tu caso hoy? Reflexiona sobre lo que depende de ti.';
  }

  if (patterns.showsFatigue) {
    return 'Tu check-in indica baja energía o sueño deficiente hoy. Marco Aurelio escribía desde el agotamiento y aún así encontraba claridad. ¿Cómo te sientes? Quizá hoy el entreno necesita adaptarse a tu estado real.';
  }

  if (patterns.needsDeload) {
    return 'Detecto señales de fatiga acumulada esta semana. Recuerda: el arco que siempre está tenso termina por romperse. ¿Cómo llevas la recuperación? A veces la disciplina es saber parar.';
  }

  if (patterns.undereating) {
    return 'Tu ingesta calórica ha estado consistentemente por debajo del objetivo. El cuerpo es el instrumento de tu virtud — necesita combustible adecuado. ¿Hay algo que dificulta tu alimentación esta semana?';
  }

  // Estado positivo
  if (trainingCompleted && mealsLogged >= 3 && waterLitres >= 2) {
    return 'Has cumplido con todos los pilares del día. No busques elogios externos por esto — la recompensa es la persona en la que te estás convirtiendo. ¿Cómo fue tu día? Escribe lo que necesites.';
  }

  if (trainingCompleted) {
    return 'El entreno está hecho. Bien. Ahora, ¿cómo vas con la nutrición y la hidratación? Registra tus pensamientos del día o pregunta lo que necesites sobre tu progreso.';
  }

  if (patterns.activeStreak >= 7) {
    return `${patterns.activeStreak} días de disciplina consecutiva. No te aferres a la racha — el valor está en la decisión de cada día, no en la acumulación. ¿Qué reflexiones traes hoy?`;
  }

  // Default: invitación abierta
  if (!checkInDone) {
    return 'Antes de escribir, evalúa tu estado en el check-in de la pantalla principal. Conocer tu energía y sueño me ayuda a darte mejor contexto. ¿Qué tienes en mente hoy?';
  }

  return 'Registra tus pensamientos del día. Lo que depende de ti es tu esfuerzo, no el resultado. Escribe sobre cómo te sentiste en el entreno, tu alimentación, o cualquier reflexión que necesites procesar.';
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
