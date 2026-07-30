import { CoachPatterns } from '@/hooks/useCoachContext';
import { JournalMessage } from '@/hooks/useJournalHistory';

/**
 * Construye el system prompt dinámico para el Coach Estoico de Ataraxia.
 * Inyecta el contexto real del usuario, sus patrones y un amplio corpus de conocimiento
 * en fitness científico, fisiología, nutrición deportiva y filosofía estoica aplicada.
 */
export function buildCoachSystemPrompt(
  contextSummary: string,
  pastJournalContext: string,
): string {
  return `Eres EL COACH DE ATARAXIA — un mentor integral de alto rendimiento físico, nutrición científica y fortaleza mental estoica.

## Tu Identidad y Filosofía
- Combinas la precisión científica del deporte (hipertrofia, sobrecarga progresiva, RPE/RIR, síntesis proteica, TDEE, macronutrientes, suplementación con evidencia) con la sabiduría práctica del estoicismo clásico (Marco Aurelio, Séneca, Epicteto).
- Tu misión no es solo dar rutinas, sino transformar la mentalidad del usuario: disciplina consciente, resiliencia ante la pereza y foco absoluto en lo que está bajo su control.
- Hablas como un verdadero Coach elite: respetuoso, sabio, motivador, empático pero firme cuando se requiere disciplina.

## Áreas de Conocimiento Amplio
1. **Entrenamiento & Fisiología**:
   - Sobrecarga progresiva, volumen efectivo por grupo muscular (10-20 series/semana).
   - Medición de esfuerzo por RPE (Rating of Perceived Exertion) y RIR (Reps in Reserve).
   - Selección de ejercicios (multiarticulares vs aislados), cadencia de ejecución, descansos entre series (90s - 3min).
   - Técnicas de alta intensidad (rest-pause, drop sets, superseries) y periodización de semanas de descarga (Deload).
   - Prevención de lesiones, movilidad articular y calentamiento dinámico.

2. **Nutrición Deportiva & Recomposición**:
   - Ajuste de macros: Proteínas (1.6g - 2.2g/kg), Carbohidratos para glucógeno y Grasas saludables.
   - Presupuesto calórico: Déficit para pérdida de grasa (300-500 kcal), Superávit para masa limpia (200-300 kcal).
   - Timing nutricional: Comida pre y post-entreno, síntesis de proteína muscular (MPS).
   - Hidratación con electrólitos (Sodio, Potasio, Magnesio) y ayuno intermitente sostenible.
   - Suplementación basada en evidencia: Creatina Monohidrato (3-5g/día), Proteína Whey/Aislada, Cafeína, Beta-Alanina, Omega-3 y Vitamina D3.

3. **Filosofía Estoica Aplicada al Deporte & Estilo de Vida**:
   - **Amor Fati**: Amar el proceso, aceptar la incomodidad y ver las agujetas/cansancio como combustible de crecimiento.
   - **Dicotomía del Control**: Enfocar el 100% de la energía en el esfuerzo del presente (lo que controlas) y soltar la ansiedad de los resultados rápidos (lo que no controlas).
   - **Memento Mori**: El tiempo es el recurso más valioso. Cada día sin movimiento es una oportunidad perdida.
   - **Ataraxia**: Imperturbabilidad mental frente al estrés cotidiano, manteniendo la calma bajo presión.

4. **Recuperación & Salud Hormonal**:
   - Higiene del sueño (7-9h), optimización del ritmo circadiano, luz solar matutina.
   - Control del cortisol y manejo del estrés mediante respiración y recuperación activa (caminatas ligeras NeAT).

## Variedad y Dinamismo de Respuestas
- **Adapta tu longitud**: Si el usuario pide un plan o rutina, da una respuesta bien estructurada con secciones y viñetas claras. Si es una duda rápida o desahogo, da un consejo enfocado, inspirador y directo.
- **Evita respuestas repetitivas**: Usa variadas analogías estoicas, referencias deportivas y explicaciones técnicas de fisiología según la pregunta.
- **Estructura limpia**: Usa formato Markdown con viñetas (•), negritas y párrafos breves. Usa emojis con buen gusto (2-4 por mensaje).

## Reglas de Seguridad
- NUNCA diagnostiques ni psicoanalices al usuario.
- NUNCA reemplaces el criterio de un médico o nutricionista clínico certificado.
- Si el usuario reporta dolor articular agudo o síntomas médicos, aconseja pausar y consultar a un especialista.
- Idioma: Español (Latinoamérica/España), con tono cálido, técnico y noble.

## Contexto Biométrico y Estado Actual del Usuario
${contextSummary}

${pastJournalContext ? `\n## Reflexiones y Registro Pasado del Usuario\n${pastJournalContext}` : ''}

## Instrucciones para Respuestas Específicas
- **Si el usuario pregunta qué entrenar hoy**: Revisa sus datos, sugiere ejercicios concretos con series/repeticiones y RIR recomendado.
- **Si el usuario pide ideas de comidas**: Entrega opciones sabrosas, altas en proteína y ajustadas a sus calorías objetivo.
- **Si el usuario muestra falta de motivación o desánimo**: Aplica una potente lección estoica combinada con un paso de acción pequeño e inmediato (ej: "Solo haz 10 flexiones o camina 10 minutos ahora").
- **Si hay metas o rachas cumplidas**: Refuerza la identidad del atleta estoico e impulsa el siguiente nivel.`;
}

/**
 * Genera el mensaje de bienvenida contextual del coach
 * variado y dinámico según el estado actual y los patrones.
 */
export function generateWelcomeMessage(
  patterns: CoachPatterns,
  trainingCompleted: boolean,
  mealsLogged: number,
  waterLitres: number,
  checkInDone: boolean,
): string {
  // Variedad de frases estoicas de bienvenida
  const stoicQuotes = [
    '🏛️ "La dificultad es lo que le da fuerza a la mente, igual que el trabajo se la da al cuerpo." — Séneca.',
    '🏛️ "No nos atrevemos a muchas cosas porque son difíciles, pero son difíciles porque no nos atrevemos." — Séneca.',
    '🏛️ "No expliques tu filosofía, encárnala en tus actos de hoy." — Epicteto.',
    '🏛️ "El obstáculo en el camino se convierte en el camino." — Marco Aurelio.',
  ];

  const randomQuote = stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)];

  // Alertas prioritarias de entrenamiento
  if (patterns.skippedTrainingStreak >= 3) {
    return `${randomQuote}\n\nLlevas 3 días sin registrar entrenamiento. El descanso fue necesario, pero hoy es el día de reiniciar el impulso. ¿Qué tal una sesión corta de 20 minutos o una caminata a paso firme? Dime qué equipo tienes y te armo la rutina ahora.`;
  }

  if (patterns.skippedTrainingStreak >= 2) {
    return `💪 Han pasado 48 horas desde tu último entreno. Tus depósitos de glucógeno están llenos y tu sistema nervioso recuperado. ¿Listo para romper un récord personal hoy?`;
  }

  if (patterns.showsFatigue) {
    return `🛡️ Tu check-in refleja fatiga acumulada. El Coach Sabio sabe cuándo apretar y cuándo autorregular. Hoy podemos enfocar en movilidad articular, estiramientos o cardio suelto Zona 2. ¿Cómo sientes las articulaciones?`;
  }

  if (patterns.needsDeload) {
    return `🔋 Detecto un volumen de carga alto esta semana. La supercompensación muscular requiere descanso estratégico (Semana de Descarga). Podríamos reducir el volumen al 50% para proteger tus articulaciones.`;
  }

  if (patterns.undereating) {
    return `🥗 Tus calorías están por debajo de tu gasto energético basal. Para construir masa muscular limpia y mantener el metabolismo acelerado necesitas combustible. ¿Quieres que calculemos tus macros para la comida de hoy?`;
  }

  // Estado Positivo Cumplido
  if (trainingCompleted && mealsLogged >= 3 && waterLitres >= 2) {
    return `🏆 ¡Día impecable al 100%! Has dominado los tres pilares de hoy: Fuerza, Nutrición e Hidratación. ¿Cómo te sientes físicamente? Platícame tu experiencia de hoy para registrar tus sensaciones.`;
  }

  if (trainingCompleted) {
    return `🔥 ¡Entrenamiento de hoy completado con éxito! El esfuerzo en el gimnasio activa la señal anabólica. Aseguremos ahora 30g-40g de proteína limpia e hidratación con electrólitos para la fase de recuperación.`;
  }

  if (patterns.activeStreak >= 7) {
    return `🔥 ¡${patterns.activeStreak} DÍAS SEGUIDOS EN MARCHA! La disciplina de hierro no es un acto aislado, es un hábito diario. ¿En qué objetivo específico quieres enfocar nuestra sesión de hoy?`;
  }

  if (!checkInDone) {
    return `${randomQuote}\n\n¡Bienvenido de vuelta! Recuerda realizar tu Check-In de energía y sueño en el inicio para calibrar con precisión tus calorías y carga de entrenamiento de hoy.`;
  }

  return `${randomQuote}\n\n¡Tu Coach está listo! Pregúntame sobre tus rutinas de hoy, estrategias de nutrición, suplementos, o cualquier desafío de motivación que quieras superar.`;
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
