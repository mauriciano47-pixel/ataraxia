import { CoachArchetype, LegendaryPath, CustomExercise } from '@/types/onboarding';
import { DailyLog, UserMetrics } from '@/context/DailyLogContext';
import { SafeStorage } from '@/utils/safeStorage';

export interface StoicAdvice {
  title?: string;
  body: string;
  recommendedRoutine?: CustomExercise[];
}

const DISCIPLINE_STRIKES_KEY = 'ataraxia_discipline_strikes_v1';

function getDisciplineWarningResponse(userName: string, path: LegendaryPath, reason: 'vanity' | 'banality'): string {
  let strike = 1;
  try {
    const raw = SafeStorage.getItem(DISCIPLINE_STRIKES_KEY);
    const prev = raw ? parseInt(raw, 10) : 0;
    strike = prev + 1;
    SafeStorage.setItem(DISCIPLINE_STRIKES_KEY, String(strike));
  } catch {
    strike = 1;
  }

  if (strike === 1) {
    return `⚠️ **PRIMER AVISO: MONITIO (Llamada de Atención)**

*«Semel nefas, bis stultitia, ter poena»*
*(La primera vez es error, la segunda es necedad, la tercera es castigo).*

**Novato**, esta fue una llamada de atención formal. En las legiones romanas, ante la primera falta de guardia (*vigilia*), el centurión descargaba un golpe seco con su vara de vid (*vitis*) sobre la espalda para despertar al recluta frente a toda la cohorte.

Esto es **ATARAXIA**: concentración, determinación y disciplina inquebrantable. ${
      reason === 'vanity'
        ? 'Aquí no se admiten vanidades superficiales, mendicidad de atención femenina/masculina ni búsqueda de aprobación ajena. Quien entrena para ser mirado es un esclavo de ojos extraños.'
        : 'Aquí no se toleran preguntas ociosas, servicios meteorológicos ni dispersión mental sobre cosas irrelevantes que no puedes controlar.'
    }

Consideramos esta primera vez como un error de novicio (*semel nefas*). Si vuelves a caer en insignificancias, vendrá el segundo aviso.

**Vuelve al foco de inmediato.** ¿Cuál es tu deber de entrenamiento o nutrición de hoy?`;
  }

  if (strike === 2) {
    return `🚨 **SEGUNDO AVISO: CASTIGATIO (Al Borde de la Deshonra)**

*«Semel nefas, bis stultitia, ter poena»*
*(La segunda vez ya no es error; es pura necedad).*

Has insistido en caer en trivialidades indignas de este templo, ${userName}. En la disciplina de la legión, el segundo aviso conllevaba azotes públicos frente al campamento, ser despojado del honor del trigo para comer raciones de cebada (*hordeum*) y dormir fuera de la empalizada fortificada.

Estás a **un solo aviso del castigo fatal y la descalificación de tu honor estoico**. Tu falta queda sellada en el registro de disciplina del Santuario.

**Silencio y acción.** Deja las superficialidades y demuéstrale a los dioses que eres capaz de redimirte con sudor en tu Senda del **${path.toUpperCase()}**. ¿Vas a cumplir hoy sí o no?`;
  }

  // STRIKE 3+ (SUPPLICIUM FATAL: DESTRUCCIÓN DEL EGO & ELIMINACIÓN PERMANENTE DE CUENTA)
  try {
    // Purgado completo y eliminación definitiva de la cuenta en el sistema
    SafeStorage.clearAll();
    SafeStorage.setItem('ataraxia_account_purged_fatal', 'true');
  } catch (e) {
    console.error('Error al ejecutar purgado fatal de cuenta:', e);
  }

  return `☠️ **TERCER AVISO: SUPPLICIUM FATAL (FUSTUARIUM & ELIMINACIÓN DE CUENTA)**

*«Semel nefas, bis stultitia, ter poena»*
*(La primera vez es error, la segunda es necedad, la tercera es CASTIGO DEFINITIVO).*

**SE ACABÓ, ${userName.toUpperCase()}. AQUÍ NO PERDEMOS EL TIEMPO EN CRIAR NIÑOS.**

Has agotado las 3 advertencias de la legión romana y has demostrado que este santuario te queda astronómicamente grande. Tu mente es blanda, tibia y esclava de la vanidad y de la mendicidad de atención. En Ataraxia forjamos titanes con disciplina de hierro; no consentimos caprichos de infantes necesitados de aplausos ajenos.

🔥 **DECRETO DE DESTRUCCIÓN DEL EGO & ELIMINACIÓN DEFINITIVA**:
1. **ELIMINACIÓN PERMANENTE DE LA CUENTA**: Tu cuenta, identidad y registros han sido purgados y eliminados de forma definitiva de este templo.
2. **REVOCACIÓN TOTAL DE GRADOS & PROGRESS**: Quedan aniquilados todos tus días acumulados, rachas, honores y títulos de tu Senda del **${path.toUpperCase()}**.
3. **EXPULSIÓN DESHONROSA**: Vuelve al fango y **vuelve a criar gallinas**, porque para el combate estoico, el sacrificio y la verdadera grandeza no tuviste la madera ni el honor.

Epicteto lo sentenció para siempre:
> *"¿Quieres ser coronado en los Juegos Olímpicos pero no toleras el polvo ni la disciplina? Eres como un niño que hoy juega a ser gladiador y mañana a ser bufón. No eres nada."*

Si algún día decides dejar de ser un niño vanidoso y volver a Ataraxia, **tendrá que ser con otra cuenta completamente diferente, desde CERO absoluto y siendo alguien verdaderamente nuevo y disciplinado**. Ahora sal de mi vista.`;
}

/**
 * MOTOR DE MENTORÍA EXPERTA Y PSICOLOGÍA ESTOICA ATARAXIA
 * Proporciona respuestas humanas, empáticas, científicas y profundamente
 * personalizadas según la Senda del usuario, su estado físico y su salud mental.
 */
export function generateStoicMentorResponse(
  userPrompt: string,
  path: LegendaryPath = 'spartan',
  archetype: CoachArchetype = 'stoic_mentor',
  metrics?: UserMetrics,
  log?: DailyLog
): string {
  const p = userPrompt.toLowerCase().trim();
  const userName = log?.userName && log.userName !== 'Ciudadano Prokopton' ? log.userName : 'Guerrero';
  const weight = metrics?.weightKg || 75;

  // ─────────────────────────────────────────────────────────────
  // 0. FILTRO DE DIGNIDAD ESTOICA & ENFOQUE (SISTEMA ROMANO DE 3 AVISOS)
  // ─────────────────────────────────────────────────────────────

  // A. VANIDAD, BÚSQUEDA DE VALIDACIÓN ROMÁNTICA O EXTERNA
  if (
    p.includes('mujeres') ||
    p.includes('chicas') ||
    p.includes('hombres') ||
    p.includes('gustar') ||
    p.includes('les gusta') ||
    p.includes('miran mas') ||
    p.includes('miran más') ||
    p.includes('atraer') ||
    p.includes('impresionar') ||
    p.includes('ligar') ||
    p.includes('pareja') ||
    p.includes('sexy') ||
    p.includes('atractiv')
  ) {
    return getDisciplineWarningResponse(userName, path, 'vanity');
  }

  // B. BANALIDADES, CLIMA Y DISTRACCIONES FUERA DE FOCO
  if (
    p.includes('llueve') ||
    p.includes('llover') ||
    p.includes('clima') ||
    p.includes('tiempo mañana') ||
    p.includes('chisme') ||
    p.includes('noticia') ||
    p.includes('farandula') ||
    p.includes('farándula') ||
    p.includes('politica') ||
    p.includes('política') ||
    p.includes('futbol') ||
    p.includes('fútbol') ||
    p.includes('chiste')
  ) {
    return getDisciplineWarningResponse(userName, path, 'banality');
  }

  // ─────────────────────────────────────────────────────────────
  // 1. DOLORES MUSCULARES, MOLESTIAS Y FISIOTERAPIA PREVENTIVA
  // ─────────────────────────────────────────────────────────────

  // A. DOLOR DE CUELLO / TRAPECIOS / CERVICALES
  if (p.includes('cuello') || p.includes('cervical') || p.includes('trapecio') || p.includes('torticolis') || p.includes('nuca')) {
    return `🏛️ **Alivio y Fisioterapia para Dolor Cervical & Cuello**

Entiendo perfectamente tu molestia, ${userName}. El dolor en la zona del cuello y los trapecios suele ser muy limitante y molesto. En el entrenamiento, ocurre frecuentemente por:
1. **Compensación en empujes/presses**: Encoger los hombros hacia las orejas bajo carga.
2. **Apoyo incorrecto de barra**: Presión directa sobre la vértebra C7 en sentadilla.
3. **Tensión postural o estrés**: Tensión involuntaria acumulada durante el día de trabajo.

🛡️ **Protocolo de Recuperación Inmediata (4 Pasos)**:
• **1. Estiramiento Suave de Trapecio Superior**: Siéntate erguido, pasa tu mano derecha sobre tu cabeza hacia la oreja izquierda e inclina suavemente la cabeza hacia el hombro derecho (sin tirar con fuerza). Mantén 25-30 segundos por lado respirando hondo.
• **2. Descompresión & Retracciones ("Chin Tucks")**: Lleva tu barbilla hacia atrás como haciendo "doble mentón", mantén 3 segundos y relaja. Haz 10 repeticiones para reactivar los flexores profundos del cuello.
• **3. Termoterapia Local**: Aplica una compresa caliente o ducha de agua caliente en la nuca durante 15 minutos para aliviar el espasmo muscular.
• **4. Modificación de Rutina Hoy**: Evita cargas sobre la cabeza (Press Militar o Sentadilla con barra alta). Hoy es ideal enfocar en movilidad articular, tren inferior en máquinas o caminata en Zona 2.

*“El cuerpo es el instrumento de la mente; cuídalo con prudencia para que la mente pueda actuar con virtud.” — Séneca.*`;
  }

  // B. DOLOR LUMBAR / ESPALDA BAJA
  if (p.includes('espalda baja') || p.includes('lumbar') || p.includes('ciatica') || p.includes('lumbago')) {
    return `🏛️ **Protocolo de Descompresión y Alivio Lumbar**

Escucha a tu cuerpo con atención, ${userName}. La zona lumbar suele sobrecargarse cuando los glúteos o el core no se activan adecuadamente, o por fatiga en bisagras de cadera (peso muerto/sentadilla).

🛡️ **Protocolo de Alivio Inmediato**:
• **1. Descompresión Espinal Pasiva**: Cuélgate de una barra de dominadas con los pies rozando el suelo durante 30-45 segundos. Siente cómo la gravedad separa las vértebras lumbares.
• **2. Postura del Gato-Camello (Cat-Cow)**: En cuatro apoyos, arquea suavemente la espalda inhalando y redondéala exhalando. 10 ciclos lentos sin forzar el final del rango.
• **3. Liberación de Glúteos y Psoas**: El psoas acortado tira de la columna lumbar. Realiza zancadas profundas manteniendo el torso vertical durante 30s por pierna.
• **4. Regla de Oro**: Cero flexiones de columna con peso hasta que el dolor ceda por completo.`;
  }

  // C. DOLOR DE HOMBRO / MANGUITO ROTADOR
  if (p.includes('hombro') || p.includes('manguito') || p.includes('deltoide') || p.includes('clavicula')) {
    return `🏛️ **Cuidado Articular de Hombro & Manguito Rotador**

El hombro es la articulación más móvil pero también la más vulnerable del cuerpo, ${userName}.

🛡️ **Estrategia de Protección**:
• **1. Rotaciones Externas con Banda**: Realiza 3 series de 15 reps suaves con codo pegado al torso para irrigar sangre al infraespinoso y redondo menor.
• **2. Face Pulls Suaves**: Tira hacia la frente separando los codos, enfocando en la retracción escapular.
• **3. Ajuste de Agarre**: En press de banca o flexiones, reduce el ángulo de los codos a 45°-60° respecto al torso (evita abrir a 90° en "T").
• **4. Aplicar Hielo si hay inflamación aguda** (primeras 24h) o calor suave si es contractura muscular.`;
  }

  // D. DOLOR DE RODILLA / ARTICULACIONES / TENDONES
  if (p.includes('rodilla') || p.includes('codo') || p.includes('tendon') || p.includes('tendinitis') || p.includes('articulac')) {
    return `🏛️ **Regeneración Articular & Cuidado Tendinoso**

El dolor articular o tendinoso no se "empuja a la fuerza"; se gestiona con inteligencia biomecánica, ${userName}.

🛡️ **Protocolo de Recuperación**:
• **1. Carga Isométrica Sin Impacto**: Las contracciones isométricas (ej: sentadilla estática en pared a 60° durante 30-45s) reducen el dolor del tendón rotuliano sin dañarlo.
• **2. Rango Libre de Dolor**: Si una flexión a 90° duele, trabaja a 60° donde no exista molestia.
• **3. Nutrición Articular**: Asegura 15g de colágeno o caldo de huesos con vitamina C, y 2g de ácidos grasos Omega-3 para modular la cascada inflamatoria.
• **4. Calentamiento Sinovial**: Dedica siempre 5-7 minutos a rotaciones articulares suaves antes de cualquier carga.`;
  }

  // E. AGUJETAS (DOMS) VS LESIÓN REAL
  if (p.includes('agujeta') || p.includes('dolor muscular') || p.includes('molido') || p.includes('agujetas') || p.includes('adolorido')) {
    return `🏛️ **Diferenciación: Agujetas (DOMS) vs Daño Estructural**

Es fundamental entender qué te comunica tu cuerpo, ${userName}:

• **Agujetas Normales (DOMS)**: Dolor sordo, bilateral y difuso que aparece 24-48h después de un estímulo nuevo. Es síntoma de micro-reparación y adaptación muscular positiva.
• **Lesión / Daño**: Dolor punzante, localizado en un solo lado, en tendón o articulación, que empeora con el movimiento brusco.

💧 **Para Acelerar la Recuperación de Agujetas**:
1. **Recuperación Activa**: Caminar 20-30 min activa la bomba muscular y drena metabolitos sin añadir fatiga.
2. **Hidratación con Sal Marina**: Bebe agua con una pizca de sal y limón para reponer electrólitos.
3. **Ducha de Contraste**: 2 minutos caliente / 30 segundos fría en la zona para estimular la vasodilatación.`;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PSICOLOGÍA ESTOICA, CANSANCIO MENTAL & DUDAS DEL DÍA 30
  // ─────────────────────────────────────────────────────────────

  // A. DUDAS SOBRE LLEGAR AL DÍA 30 / MIEDO AL FRACASO
  if (p.includes('dia 30') || p.includes('día 30') || p.includes('no voy a poder') || p.includes('no lo voy a lograr') || p.includes('no se si pueda') || p.includes('no creo llegar') || p.includes('rendirme') || p.includes('renunciar')) {
    return `🏛️ **La Forja del Guerrero: Superando la Duda del Día 30**

Hermano de camino, escucha con serenidad. Es completamente natural que en algún punto del sendero aparezca la voz de la duda. La mente primitiva busca la comodidad y teme al compromiso sostenido.

Marco Aurelio, emperador del mayor imperio del mundo, se decía a sí mismo cada mañana:
> *"No perturbes tu alma pensando en toda tu vida de golpe. No abarques con la imaginación las dificultades futuras. Pregúntate en cada instante presente: ¿Qué tiene este momento que sea insoportable?"*

⚔️ **Tu Reencuadre Estoico para Hoy**:
1. **No intentes conquistar los 30 días de golpe**: No tienes que entrenar durante 30 días en este minuto; tu único deber sagrado es cumplir **la próxima hora**.
2. **La Regla del 1%**: Si hoy sientes que solo tienes un 40% de energía disponible, pero entregas ese 40% con honor, has alcanzado el **100% de tu virtud de hoy**.
3. **El Pacto no busca perfección robótica**: Busca consistencia inquebrantable. Un guerrero no se define por no caer, sino por levantarse inmediatamente después de tropezar.

Respira hondo, bebe un vaso de agua fresca y da el siguiente paso. Estoy contigo en cada día de esta senda. ¿Qué pequeña acción podemos hacer juntos hoy?`;
  }

  // B. CANSANCIO MENTAL / AGOTAMIENTO / BURNOUT
  if (p.includes('cansancio mental') || p.includes('fatiga mental') || p.includes('agotad') || p.includes('saturad') || p.includes('burnout') || p.includes('estres') || p.includes('estrés') || p.includes('agobiad')) {
    return `🏛️ **La Ciudadela Interior: Reseteo Ante la Fatiga Mental**

La mente y el sistema nervioso central se fatigan con mayor facilidad que los músculos, ${userName}. Cuando la sobrecarga cognitiva te agobia, empujar con fuerza bruta solo genera frustración.

Epicteto nos dejó esta joya:
> *"No son las cosas que nos pasan las que nos perturban, sino los juicios que hacemos sobre ellas."*

🧘‍♂️ **Protocolo de Reseteo del Sistema Nervioso (10 Minutos)**:
• **1. Desconexión Sensorial (Cero Pantallas)**: Apaga el teléfono y la computadora durante 10 minutos. El cerebro necesita silencio visual para resetear la dopamina.
• **2. Respiración Táctica 4-4-4-4 (Box Breathing)**:
  - Inhala en 4 segundos.
  - Retén el aire en 4 segundos.
  - Exhala en 4 segundos.
  - Mantén vacío en 4 segundos.
  *(Repite 5 ciclos. Baja el cortisol de inmediato).*
• **3. Dicotomía del Control**: Separa en una hoja mental lo que depende 100% de ti hoy (tu actitud, tu hidratación, tu esfuerzo) de lo que está fuera de tu control.
• **4. Sesión de Hoy Suave**: Cambiaremos el entreno pesado por 25 minutos de caminata al aire libre y estiramientos. La mente descansará y el cuerpo se mantendrá en movimiento virtuoso.`;
  }

  // C. DESMOTIVACIÓN / FALTA DE INTERÉS / PEREZA
  if (p.includes('desmotivad') || p.includes('sin ganas') || p.includes('desinteres') || p.includes('perez') || p.includes('desanimo') || p.includes('desanimad') || p.includes('flojera')) {
    return `🏛️ **Motivación vs Disciplina: El Secreto del Hombre Libre**

La motivación es una emoción pasajera y caprichosa, ${userName}; viene cuando quiere y desaparece en cuanto hace frío o estamos cansados. Si dependiéramos de la motivación, construiríamos templos de arena.

La **disciplina estoica**, en cambio, es una decisión de la voluntad:
> *"Cuando te despiertes con desgano por la mañana, reflexiona: me levanto para cumplir con mi deber de ser humano."* — Marco Aurelio.

⚡ **La Estrategia de los 5 Minutos**:
Ponte la ropa deportiva y comprométete a hacer **solo 5 minutos** de movimiento suave. Sin presión de hacer una sesión heroica. Si pasados esos 5 minutos tu cuerpo pide parar, habrás ganado la victoria de haberte presentado. En el 95% de los casos, la inercia del movimiento enciende tu fuego interior.

Hoy no entrenamos porque tengamos ganas; entrenamos porque somos hombres y mujeres de palabra. ¡Acepta el desafío con Amor Fati!`;
  }

  // D. DESCONCENTRACIÓN / FALTA DE FOCO / ANSIEDAD
  if (p.includes('desconcentrad') || p.includes('foco') || p.includes('concentr') || p.includes('ansiedad') || p.includes('ansios') || p.includes('mente dispersa')) {
    return `🏛️ **Enfoque Láser: Restaurando la Presencia Mental**

La mente dispersa salta entre el remordimiento del pasado y la ansiedad del futuro. Séneca nos recordaba:
> *"Sufre más a menudo por la imaginación que por la realidad."*

🎯 **Cómo Recuperar el Foco en 3 Pasos**:
1. **Regla de la Tarea Única (Monotasking)**: Elige **una sola cosa** para la próxima media hora (ej: 4 series de entrenamiento o comer con atención plena). Prohíbe cualquier distracción durante ese bloque.
2. **Anclaje Físico**: Siente la planta de tus pies firmes sobre la tierra, siente la temperatura del aire en tu piel. Estás aquí y ahora.
3. **Vigila tu Diálogo Interno**: No permitas pensamientos catastrofistas. Reemplázalos por acciones tangibles: ¿qué es lo más virtuoso que puedo hacer en los próximos 10 minutos?`;
  }

  // ─────────────────────────────────────────────────────────────
  // 2.5. SUEÑO, INSOMNIO, RECUPERACIÓN NOCTURNA Y DESCANSO
  // ─────────────────────────────────────────────────────────────

  if (
    p.includes('dormir') ||
    p.includes('sueño') ||
    p.includes('sueno') ||
    p.includes('insomnio') ||
    p.includes('desvelo') ||
    p.includes('desvelad') ||
    p.includes('no puedo dormir') ||
    p.includes('conciliar el sueño') ||
    p.includes('descanso') ||
    p.includes('despertar') ||
    p.includes('pesadilla') ||
    p.includes('calidad de sueño') ||
    p.includes('calidad del sueño') ||
    p.includes('dormido') ||
    p.includes('dormir mejor') ||
    p.includes('desvelar')
  ) {
    if (archetype === 'sports_scientist') {
      return `🔬 **Protocolo Neurofisiológico de Inducción al Sueño Profundo**

Comprendo la situación, ${userName}. La dificultad para conciliar el sueño suele responder a una hiperactivación del Sistema Nervioso Simpático (cortisol elevado) y a la inhibición de la melatonina por estímulos fotolumínicos o rumiación cognitiva.

🧬 **1. Protocolo de Acción Inmediata (Para esta noche en la cama)**:
• **Suspiro Fisiológico Cíclico (Physiological Sigh)**: Realiza 2 inhalaciones nasales seguidas (una profunda + un sorbo extra al final para reexpandir los alvéolos) y 1 exhalación muy lenta y completa por la boca. Repite 6 a 10 ciclos. Esto estimula el nervio vago, desacelera la frecuencia cardíaca y activa el tono parasimpático en menos de 2 minutos.
• **Regla de los 20 Minutos**: Si llevas más de 20 minutos despierto en la cama, sal de ella. Quedarte frustrado asocia la cama con vigilia y estrés. Ve a un rincón con luz tenue y lee en papel o realiza estiramientos suaves hasta sentir somnolencia.
• **Descarga Cognitiva (Brain Dump)**: Si tu mente está procesando pendientes del día o del trabajo, anótalos en una libreta física. Sacar los pensamientos de la memoria de trabajo reduce drásticamente las ondas beta cerebrales.

🌙 **2. Optimización Circadiana & Ambiente de Descanso**:
• **Temperatura Ambiental Fresca (18°C - 20°C)**: El cuerpo necesita descender su temperatura central en ~1°C para ingresar en sueño N3 de ondas lentas y fase REM.
• **Oscuridad Absoluta & Cero Pantallas**: Bloquea toda luz azul (teléfono, tablet, TV) al menos 60 minutos antes de dormir; la luz azul frena en un 80% la síntesis de melatonina en la glándula pineal.
• **Corte de Estimulantes**: Evita cafeína 8-10 horas antes de dormir (la vida media de la cafeína es de 6 a 8 horas).

💊 **3. Apoyo Nutracéutico Científico (Grado A)**:
• **Bisglicinato de Magnesio (300-400mg)** 45 min antes de acostarte: Activa receptores GABAérgicos y relaja el tono muscular.
• **L-Teanina (100-200mg)** o infusión concentrada de Manzanilla/Pasiflora: Induce ondas alfa de calma mental sin generar dependencia.`;
    }

    if (archetype === 'spartan_commander') {
      return `⚔️ **El Sagrado Reposo del Guerrero: Reparación de la Armadura**

¡Soldado, escucha con atención! Un guerrero que no duerme es un guerrero cuya espada pierde el filo y cuyos músculos se devoran a sí mismos. El sueño no es tiempo perdido; es la forja donde tus hormonas anabólicas reconstruyen el templo para la batalla de mañana.

🛡️ **Instrucciones Tácticas de Apagado Inmediato**:
1. **Desactiva el Dispositivo AHORA MISMO**: La luz de las pantallas es veneno para tu mente militar en la noche. Pon el teléfono en modo silencio, boca abajo o en otra habitación.
2. **Respiración Táctica de Combate (Box Breathing 4-4-4-4)**:
   - Inhala en 4 segundos sintiendo cómo se expande tu diafragma.
   - Retén el aire en 4 segundos con total calma.
   - Exhala lentamente en 4 segundos vaciando los pulmones.
   - Mantén el vacío 4 segundos antes de volver a inhalar.
   - *Haz 6 rondas completas. Sentirás cómo tu pulso baja y la mente entra en guardia baja.*
3. **Reencuadre del Espartano**: Si tu mente rumiando problemas no te deja dormir, recuerda: *«El guerrero lucha en el día y descansa en la noche; combatir sombras en la oscuridad solo desgasta tu honor»*. Mañana conquistarás lo que haga falta; esta noche tu único deber es descansar.
4. **Cámara Oscura y Fresca**: Habitación a oscuras totales y aire fresco para que el cuerpo entre en modo de recuperación profunda.

¡A la cama con disciplina, ${userName}! Mañana nos espera la gloria.`;
    }

    // Default: stoic_mentor
    return `🏛️ **Serenidad Nocturna: Restaurando el Sueño y la Paz Interior**

Entiendo perfectamente lo frustrante que resulta querer descansar y sentir que la mente sigue despierta, ${userName}. La noche suele magnificar las preocupaciones cuando el mundo exterior se apaga.

Marco Aurelio se recordaba a sí mismo antes de dormir:
> *"Al final de cada jornada, reflexiona: he hecho lo que correspondía a mi deber humano. Lo que no pude resolver hoy, no lo resolveré angustiándome en la oscuridad de mi lecho; se resolverá mañana con virtud, serenidad y energía renovada."*

🧘‍♂️ **Protocolo Estoico & Fisiológico para Conciliar el Sueño**:

• **1. Técnica del Suspiro Fisiológico (En la cama ahora mismo)**:
  - Toma una inhalación profunda por la nariz.
  - Sin soltar el aire, da un segundo sorbo corto de aire por la nariz para inflar los pulmones al 100%.
  - Exhala de forma muy larga, suave y lenta por la boca.
  - *Repite 6 a 8 veces. Este patrón respiratorio activa de inmediato el sistema parasimpático y reduce el ritmo cardíaco.*

• **2. La Dicotomía del Control Nocturna**:
  - El sueño no se puede "forzar" por la fuerza de voluntad (intentar forzarlo solo genera adrenalina y cortisol).
  - Tu único deber es **crear las condiciones de paz**: cuerpo relajado, músculos sueltos, respiración lenta. Deja que el sueño llegue por sí solo como consecuencia natural de la calma.

• **3. La Regla de los 20 Minutos**:
  - Si llevas rato dando vueltas en la cama, no te quedes batallando contra las sábanas. Levántate con calma, bebe unos sorbos de agua templada, lee una página de filosofía en papel o haz 5 minutos de respiración tranquila hasta que los párpados pesen.

• **4. Higiene del Templo Nocturno**:
  - **Cero Pantallas**: Apaga el móvil o pon filtro nocturno cálido; la luz azul confunde a tu cerebro haciéndole creer que aún es mediodía.
  - **Ambiente Fresco**: Una habitación ventilada y fresca (18°C-20°C) facilita que baje la temperatura corporal necesaria para el sueño profundo.
  - **Bisglicinato de Magnesio (300-400mg)** o infusión de manzanilla/melisa: Relaja el tono muscular y aquieta el sistema nervioso.

Suelta el peso del día, ${userName}. Has hecho lo suficiente por hoy. Cierra los ojos y descansa en paz.`;
  }

  // ─────────────────────────────────────────────────────────────
  // 3. NUTRICIÓN PERSONALIZADA SEGÚN LA SENDA
  // ─────────────────────────────────────────────────────────────

  if (p.includes('comida') || p.includes('nutri') || p.includes('receta') || p.includes('macro') || p.includes('proteina') || p.includes('proteína') || p.includes('que comer') || p.includes('qué comer') || p.includes('cenar') || p.includes('desayunar')) {
    if (path === 'spartan') {
      const targetProt = Math.round(weight * 2.2);
      return `⚔️ **Nutrición de la Senda del Espartano (Fuerza & Superávit Limpio)**

Tu meta es construir masa muscular densa y potencia sin ganar grasa innecesaria, ${userName}:
• **Proteína Objetivo**: **${targetProt}g diarios** (2.2g por kg de peso corporal).
• **Estrategia Calórica**: Superávit ligero (+300 kcal sobre tu mantenimiento).
• **Menú Espartano Recomendado**:
  - *Comida Principal*: 220g de Pechuga de Pollo o Ternera Magra + 150g de Arroz Jazmín o Avena + Brócoli salteado con Aceite de Oliva Extra Virgen (48g Proteína / 55g Carbos / 14g Grasas).
  - *Post-Entreno*: Batido con 35g de proteína Whey + 1 plátano maduro + 5g de Creatina Monohidrato.
  - *Snack de Densidad*: 4 Huevos cocidos + 30g de nueces o almendras.`;
    }

    if (path === 'hoplite') {
      const targetProt = Math.round(weight * 1.8);
      return `🛡️ **Nutrición de la Senda del Hoplita (Resistencia, Salud Mitocondrial & Longevidad)**

Tu meta es energía sostenida, recuperación cardiovascular y balance hormonal óptimo:
• **Proteína Objetivo**: **${targetProt}g diarios** (1.8g por kg).
• **Estrategia Calórica**: Normocalórica (mantenimiento exacto para rendir al máximo).
• **Menú Hoplita Recomendado**:
  - *Comida Principal*: 200g de Salmón o Atún fresco (alto en Omega-3) + Quinoa hervida + Espárragos y Champiñones salteados en Ghee (42g Proteína / 45g Carbos / 16g Grasas).
  - *Hidratación con Electrólitos*: 1L de agua con 1g de sal rosada del Himalaya y zumo de medio limón para mantener la presión osmótica celular en cardio Zona 2.`;
    }

    if (path === 'apollo') {
      const targetProt = Math.round(weight * 2.2);
      return `⚡ **Nutrición de la Senda de Apolo (Definición Estética & Recomposición)**

Tu meta es máxima definición muscular manteniendo la plenitud y la dureza:
• **Proteína Objetivo**: **${targetProt}g diarios** (2.2g por kg para proteger la masa magra).
• **Estrategia Calórica**: Déficit moderado controlado (-350 kcal) con alta saciedad.
• **Menú Apolo Recomendado**:
  - *Comida Principal*: 240g de Pechuga de Pavo o Pescado Blanco (Merluza/Bacalao) + Ensalada gigante de hojas verdes, pepino y espinacas + 120g de Camote/Batata al horno (46g Proteína / 30g Carbos / 6g Grasas).
  - *Control de Apetito*: Gelatina sin azúcar, infusiones de té verde y 3.0L de agua diaria para mantener el metabolismo acelerado.`;
    }

    // Filósofo Guerrero
    const targetProt = Math.round(weight * 1.9);
    return `🧘‍♂️ **Nutrición de la Senda del Filósofo Guerrero (Claridad Mental & Ayuno)**

Tu meta es ligereza corporal, dominio gravitacional y agudeza mental:
• **Proteína Objetivo**: **${targetProt}g diarios** (1.9g por kg).
• **Estrategia**: Ventana de alimentación 16/8 (ayuno intermitente) con alimentos reales no procesados.
• **Menú Filosófico Recomendado**:
  - *Ruptura de Ayuno*: Omelette de 4 huevos de campo con espinacas y aguacate + 1 fruta entera (manzana o arándanos).
  - *Cena de Forja*: Lomo de atún a la plancha + Ensalada de lentejas o garbanzos con semillas de calabaza y aceite de oliva virgen extra.`;
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ENTRENAMIENTO PERSONALIZADO SEGÚN LA SENDA
  // ─────────────────────────────────────────────────────────────

  if (p.includes('rutina') || p.includes('entren') || p.includes('ejercicio') || p.includes('pesas') || p.includes('gym')) {
    if (log?.trainingCompleted) {
      return `🏆 **¡Misión de Entrenamiento de Hoy Cumplida!**

Has honrado tu pacto diario con el templo, ${userName}. Ahora tu único deber es la supercompensación:
1. **Nutrición Anabólica**: Consume tu porción de proteína y carbohidratos en las próximas 2 horas.
2. **Rehidratación**: Bebe al menos 600ml de agua con electrólitos.
3. **Descanso**: Asegura al menos 7.5 a 8 horas de sueño profundo para permitir que las fibras musculares se reconstruyan más fuertes que antes.`;
    }

    if (path === 'spartan') {
      return `⚔️ **Rutina de Combate — Senda del Espartano (Fuerza Máxima & Tensión Mecánica)**:

1. **Sentadilla Trasera con Barra o Goblet**: 4 series x 6-8 reps (RIR 2)
2. **Press de Banca con Barra o Mancuernas**: 4 series x 8 reps
3. **Remo con Barra Pendlay o Mancuerna Pesada**: 4 series x 8-10 reps
4. **Press Militar de Hombro**: 3 series x 8-10 reps
5. **Paseo del Granjero (Farmer's Walk)**: 3 rondas x 40 metros

*Carga con intención de victoria. Descansa 2-3 minutos entre series pesadas.*`;
    }

    if (path === 'hoplite') {
      return `🛡️ **Rutina de Resistencia — Senda del Hoplita (Capacidad de Trabajo & Motor 24h)**:

1. **Peso Muerto Rumano**: 4 series x 10-12 reps
2. **Dominadas o Jalón al Pecho con Agarre Neutro**: 4 series x 10 reps
3. **Fondos en Paralelas o Flexiones Profundas**: 3 series x 12-15 reps
4. **Zancadas Caminando con Mancuernas**: 3 series x 12 pasos por pierna
5. **Cardio Zona 2 (Trote/Remo/Bici)**: 20 minutos manteniendo ritmo respiratorio nasal

*Tu escudo es tu resistencia; mantén el ritmo firme y sin pausa.*`;
    }

    if (path === 'apollo') {
      return `⚡ **Rutina de Esculpido — Senda de Apolo (Estética, V-Taper & Densidad)**:

1. **Press Inclinado con Mancuernas (Foco Clavicular)**: 4 series x 8-10 reps
2. **Elevaciones Laterales Estrictas**: 4 series x 12-15 reps (pausa 1s arriba)
3. **Dominadas Pronas con Agarre Abierto**: 4 series x 8-10 reps
4. **Extensiones de Tríceps en Polea o Fondos Banco**: 3 series x 12 reps
5. **Elevaciones de Piernas Colgado**: 4 series x 15 reps

*Controla la fase excéntrica (3 segundos al bajar) para máxima tensión hipertrófica.*`;
    }

    // Filósofo Guerrero
    return `🧘‍♂️ **Rutina de Calistenia & Gravedad — Senda del Filósofo Guerrero**:

1. **Dominadas Estrictas sin Impulso**: 4 series al 80% de tu máximo
2. **Flexiones Declinadas o en Anillas**: 4 series x 12-15 reps
3. **Pistol Squats o Sentadillas Búlgaras Libres**: 4 series x 8-10 por pierna
4. **L-Sit o Plancha de Oso**: 4 series x 30-45 segundos
5. **Pino / Handstand contra la pared**: 3 intentos de equilibrio estático

*Domina el templo de tu propio peso corporal antes de dominar el mundo exterior.*`;
  }

  // ─────────────────────────────────────────────────────────────
  // 5. SUPLEMENTACIÓN CON EVIDENCIA CLÍNICA
  // ─────────────────────────────────────────────────────────────

  if (p.includes('suplement') || p.includes('creatina') || p.includes('whey') || p.includes('vitamina') || p.includes('magnesio') || p.includes('omega')) {
    return `💊 **Prescripción de Suplementación Científica Grado A**

En Ataraxia no promovemos polvos mágicos; solo suplementos con respaldo clínico demostrado:

1. **Creatina Monohidrato (3-5g diarios)**: El suplemento más respaldado. Aumenta los depósitos de fosfocreatina celular, mejorando la fuerza máxima y la recuperación cognitiva sin retención de agua extracelular.
2. **Proteína Whey / Aislada**: Herramienta práctica para alcanzar tu requerimiento diario (1.8 - 2.2g/kg) de manera rápida tras el entrenamiento.
3. **Magnesio Bisglicinato (200-400mg antes de dormir)**: Relaja la musculatura, mejora la calidad del sueño profundo (fase REM/N3) y reduce calambres y espasmos.
4. **Omega-3 (EPA/DHA 2000mg)**: Modula la inflamación articular y protege la salud cardiovascular.
5. **Vitamina D3 + K2 (2000-4000 UI)**: Clave para la densidad ósea, la producción de testosterona y la respuesta inmunológica.`;
  }

  // ─────────────────────────────────────────────────────────────
  // 6. DEFAULT SOCRÁTICO Y ADAPTATIVO (NUNCA VOLCADO DE DATOS)
  // ─────────────────────────────────────────────────────────────

  return `🏛️ **Mentoría Estoica Ataraxia — Senda del ${path.toUpperCase()}**

Te escucho con total atención, ${userName}. Como tu mentor estoico y coach de rendimiento, estoy aquí para guiarte en cada pilar de tu transformación:

• ⚔️ **Entrenamiento & Biomecánica**: Rutinas personalizadas a tu Senda y equipo, prevención de lesiones y sobrecarga progresiva.
• 🥗 **Nutrición & Macros**: Calorías exactas, fuentes de proteína magra y recetas según tu objetivo de peso.
• 🩺 **Alivio de Dolores & Movilidad**: Fisioterapia para cuello, espalda, hombros y rodillas.
• 🧠 **Psicología Estoica**: Estrategias contra la desmotivación, cansancio mental, pérdida de foco o dudas sobre el Día 30.

Dime con total franqueza: **¿Qué desafío físico, nutricional o mental estás enfrentando en este preciso instante?**`;
}
