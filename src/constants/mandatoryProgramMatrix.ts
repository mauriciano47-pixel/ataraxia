import type { LegendaryPath, EquipmentType } from '../types/onboarding';

export interface ProgramExercise {
  id: string;
  n: string;
  s: string;
  targetRpe: number;
  muscleGroup: string;
  cue: string;
}

export interface PathEquipmentRoutine {
  name: string;
  focus: string;
  equipmentLabel: string;
  exercises: ProgramExercise[];
}

export const MANDATORY_PROGRAM_MATRIX: Record<LegendaryPath, Record<EquipmentType, PathEquipmentRoutine>> = {
  spartan: {
    gym: {
      name: 'Senda del Espartano • Gimnasio Completo',
      focus: 'Fuerza Máxima, Cargas Pesadas & Sobrecarga Progresiva (RIR 1-2)',
      equipmentLabel: '🏋️ Gimnasio Completo',
      exercises: [
        { id: 'sp_g1', n: 'Sentadilla Trasera Pesada con Barra', s: '4 series x 6 reps', targetRpe: 8.5, muscleGroup: 'Piernas', cue: 'Profundidad paralela y empuje desde los talones.' },
        { id: 'sp_g2', n: 'Press de Banca Plano Olímpico', s: '4 series x 6 reps', targetRpe: 8.5, muscleGroup: 'Pecho', cue: 'Retracción escapular sólida y arco natural.' },
        { id: 'sp_g3', n: 'Peso Muerto Convencional Pesado', s: '3 series x 5 reps', targetRpe: 9.0, muscleGroup: 'Espalda / Isquios', cue: 'Bloqueo dorsal antes de despegar la barra.' },
        { id: 'sp_g4', n: 'Press Militar de Pie con Barra', s: '3 series x 8 reps', targetRpe: 8.0, muscleGroup: 'Hombros', cue: 'Glúteos y abdomen contraídos sin arquear lumbar.' },
        { id: 'sp_g5', n: 'Remo Pendlay con Barra', s: '4 series x 8 reps', targetRpe: 8.0, muscleGroup: 'Espalda', cue: 'Torso paralelo al suelo con tirón explosivo.' },
      ],
    },
    home_dumbbell: {
      name: 'Senda del Espartano • Mancuernas en Casa',
      focus: 'Tensión Mecánica Alta & Sobrecarga con Mancuernas',
      equipmentLabel: '🏠 Mancuernas en Casa',
      exercises: [
        { id: 'sp_d1', n: 'Sentadilla Goblet Pesada con Mancuerna', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Piernas', cue: 'Mancuerna pegada al esternón con codos cerrados.' },
        { id: 'sp_d2', n: 'Press de Pecho en Suelo/Banco con Mancuernas', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Pecho', cue: 'Pausa de 1 segundo en el punto de máximo estiramiento.' },
        { id: 'sp_d3', n: 'Peso Muerto Rumano con Mancuernas', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Espalda / Isquios', cue: 'Empuja la cadera hacia atrás sintiendo los isquios.' },
        { id: 'sp_d4', n: 'Press de Hombros Sentado con Mancuernas', s: '3 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Hombros', cue: 'Trayectoria limpia en arco sin chocar mancuernas.' },
        { id: 'sp_d5', n: 'Remo Unilateral con Mancuerna Pesada', s: '4 series x 10 reps/lado', targetRpe: 8.5, muscleGroup: 'Espalda', cue: 'Lleva el codo hacia el bolsillo sin rotar el torso.' },
      ],
    },
    calisthenics: {
      name: 'Senda del Espartano • Peso Corporal Puro',
      focus: 'Fuerza Relativa Máxima, Cargas Unilaterales & Pausas',
      equipmentLabel: '🤸‍♂️ Peso Corporal',
      exercises: [
        { id: 'sp_c1', n: 'Pistol Squats Asistidas / Búlgaras al Fallo', s: '4 series x 8 reps/lado', targetRpe: 8.5, muscleGroup: 'Piernas', cue: 'Control excéntrico de 3 segundos por repetición.' },
        { id: 'sp_c2', n: 'Flexiones Declinadas con Pies Elevados y Pausa', s: '4 series x 12-15 reps', targetRpe: 8.5, muscleGroup: 'Pecho', cue: 'Pies sobre silla/cama con pecho al suelo.' },
        { id: 'sp_c3', n: 'Dominadas Pronas Estrictas o Lentas', s: '4 series x 6-8 reps', targetRpe: 9.0, muscleGroup: 'Espalda', cue: 'Barbilla sobre la barra y descenso completo.' },
        { id: 'sp_c4', n: 'Flexiones en Pica Elevadas (Pike Push-ups)', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Hombros', cue: 'Cabeza desciende en trípode hacia adelante.' },
        { id: 'sp_c5', n: 'Remo Invertido en Mesa o Anillas', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Espalda', cue: 'Cuerpo recto como tabla tocando el pecho al borde.' },
      ],
    },
  },
  hoplite: {
    gym: {
      name: 'Senda del Hoplita • Gimnasio Completo',
      focus: 'Capacidad Mitocondrial, Cadenas Funcionales & Cardio Zona 2',
      equipmentLabel: '🏋️ Gimnasio Completo',
      exercises: [
        { id: 'hop_g1', n: 'Sentadilla Frontal con Barra Olímpica', s: '4 series x 10 reps', targetRpe: 7.5, muscleGroup: 'Piernas', cue: 'Codos altos manteniendo el torso vertical.' },
        { id: 'hop_g2', n: 'Circuito Táctico de Cardio (Remo / Bici Zona 2)', s: '25 minutos continuos', targetRpe: 7.0, muscleGroup: 'Cardiovascular', cue: 'Ritmo conversacional sostenido (65-75% FC).' },
        { id: 'hop_g3', n: 'Press de Pecho en Máquina / Polea', s: '4 series x 12 reps', targetRpe: 8.0, muscleGroup: 'Pecho', cue: 'Tensión constante sin bloquear codos.' },
        { id: 'hop_g4', n: 'Jalón al Pecho en Polea Alta', s: '4 series x 12 reps', targetRpe: 8.0, muscleGroup: 'Espalda', cue: 'Tira con los codos y abre la caja torácica.' },
        { id: 'hop_g5', n: 'Paseo del Granjero Pesado (Farmer Walk)', s: '3 series x 40 metros', targetRpe: 8.5, muscleGroup: 'Core / Agarre', cue: 'Hombros atrás y pasos firmes sin oscilar.' },
      ],
    },
    home_dumbbell: {
      name: 'Senda del Hoplita • Mancuernas en Casa',
      focus: 'Resistencia Funcional Táctica & Capacidad de Trabajo',
      equipmentLabel: '🏠 Mancuernas en Casa',
      exercises: [
        { id: 'hop_d1', n: 'Thrusters Tácticos (Sentadilla + Press)', s: '4 series x 12 reps', targetRpe: 8.0, muscleGroup: 'Full Body', cue: 'Usa el impulso de las piernas para elevar el peso.' },
        { id: 'hop_d2', n: 'Caminata Rápida / Trote NeAT Zona 2', s: '30 minutos continuos', targetRpe: 7.0, muscleGroup: 'Cardiovascular', cue: 'Ritmo constante sin pausas para acelerar quema de grasa.' },
        { id: 'hop_d3', n: 'Renegade Rows con Mancuernas en Plancha', s: '4 series x 10 reps/lado', targetRpe: 8.0, muscleGroup: 'Core / Espalda', cue: 'Caderas quietas sin balancear al remar.' },
        { id: 'hop_d4', n: 'Zancadas Caminando con Mancuernas', s: '3 series x 14 pasos', targetRpe: 7.5, muscleGroup: 'Piernas', cue: 'Rodilla trasera roza suavemente el suelo.' },
        { id: 'hop_d5', n: 'Plancha con Arrastre de Mancuerna', s: '3 series x 45 seg', targetRpe: 8.0, muscleGroup: 'Core', cue: 'Pasa la mancuerna de un lado al otro sin girar pelvis.' },
      ],
    },
    calisthenics: {
      name: 'Senda del Hoplita • Peso Corporal',
      focus: 'Densidad Mitocondrial & Resistencia Inagotable',
      equipmentLabel: '🤸‍♂️ Peso Corporal',
      exercises: [
        { id: 'hop_c1', n: 'Circuito Táctico (Burpees + Zancadas Explosivas)', s: '4 rondas x 45 seg', targetRpe: 8.0, muscleGroup: 'Full Body', cue: 'Movimientos fluidos sin golpear articulaciones.' },
        { id: 'hop_c2', n: 'Carrera Continua NeAT / Saltos de Cuerda', s: '30 minutos Zona 2', targetRpe: 7.0, muscleGroup: 'Cardiovascular', cue: 'Respiración nasal controlada y cadencia rítmica.' },
        { id: 'hop_c3', n: 'Flexiones Tácticas con Pausa en Suelo', s: '4 series x 15 reps', targetRpe: 8.0, muscleGroup: 'Pecho / Tríceps', cue: 'Pecho al suelo y despegue de manos 0.5s.' },
        { id: 'hop_c4', n: 'Dominadas Australianas o Pronas', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Espalda', cue: 'Contracción dorsal en el punto más alto.' },
        { id: 'hop_c5', n: 'Plancha Abdominal de Acero', s: '3 series x 60 seg', targetRpe: 8.0, muscleGroup: 'Core', cue: 'Retroversión pélvica y máxima tensión abdominal.' },
      ],
    },
  },
  apollo: {
    gym: {
      name: 'Senda de Apolo • Gimnasio Completo',
      focus: 'Escultura Estética, V-Taper & Proporciones Áureas',
      equipmentLabel: '🏋️ Gimnasio Completo',
      exercises: [
        { id: 'ap_g1', n: 'Press Inclinado con Mancuernas a 30°', s: '4 series x 10-12 reps', targetRpe: 8.5, muscleGroup: 'Pecho Superior', cue: 'Énfasis en la clavícula con estiramiento profundo.' },
        { id: 'ap_g2', n: 'Elevaciones Laterales en Polea / Mancuerna en V', s: '4 series x 15 reps', targetRpe: 9.0, muscleGroup: 'Hombros Laterales', cue: 'Codos ligeramente flexionados guiando el movimiento.' },
        { id: 'ap_g3', n: 'Jalón al Pecho Agarre Neutro (V-Taper)', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Dorsales', cue: 'Deprime escápulas antes de iniciar la tracción.' },
        { id: 'ap_g4', n: 'Prensa Inclinada de Piernas / Sentadilla Hack', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Cuádriceps', cue: 'Pies en parte baja de la plataforma con descenso lento.' },
        { id: 'ap_g5', n: 'Elevación de Piernas Colgado en Barra (V-Cut)', s: '4 series x 15 reps', targetRpe: 8.5, muscleGroup: 'Abdomen', cue: 'Eleva la pelvis enrollando la columna sin balanceo.' },
      ],
    },
    home_dumbbell: {
      name: 'Senda de Apolo • Mancuernas en Casa',
      focus: 'Definición Muscular Esculpida con Mancuernas',
      equipmentLabel: '🏠 Mancuernas en Casa',
      exercises: [
        { id: 'ap_d1', n: 'Press Inclinado con Mancuernas en Cojín/Banco', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Pecho Superior', cue: 'Inclinación de 30 grados para llenar el pecho alto.' },
        { id: 'ap_d2', n: 'Elevaciones Laterales Estrictas con Mancuerna', s: '5 series x 15 reps', targetRpe: 9.0, muscleGroup: 'Hombros', cue: 'Pausa de 1 segundo arriba para crear el efecto V.' },
        { id: 'ap_d3', n: 'Remo con Mancuernas Agarre Supino', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Dorsales', cue: 'Codos pegados al cuerpo estimulando el dorsal bajo.' },
        { id: 'ap_d4', n: 'Sentadilla Búlgara Esculpida con Mancuerna', s: '3 series x 12 reps/lado', targetRpe: 8.5, muscleGroup: 'Piernas', cue: 'Tronco erguido enfocando cuádriceps y glúteos.' },
        { id: 'ap_d5', n: 'Crunch Abdominal en V (V-Ups)', s: '4 series x 15 reps', targetRpe: 8.0, muscleGroup: 'Abdomen', cue: 'Toca las puntas de los pies contrayendo el core.' },
      ],
    },
    calisthenics: {
      name: 'Senda de Apolo • Peso Corporal',
      focus: 'Físico Esculpido Clásico mediante Calistenia Estética',
      equipmentLabel: '🤸‍♂️ Peso Corporal',
      exercises: [
        { id: 'ap_c1', n: 'Flexiones Declinadas con Pies en Silla', s: '4 series x 15 reps', targetRpe: 8.5, muscleGroup: 'Pecho Superior', cue: 'Concentra la tensión en la porción clavicular.' },
        { id: 'ap_c2', n: 'Pseudo Planche Push-ups', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Hombros / Pecho', cue: 'Manos a la altura de la cintura con cuerpo inclinado.' },
        { id: 'ap_c3', n: 'Dominadas Abiertas con Énfasis Dorsal', s: '4 series x 8-10 reps', targetRpe: 8.5, muscleGroup: 'V-Taper Dorsal', cue: 'Agarre ancho llevando el esternón hacia la barra.' },
        { id: 'ap_c4', n: 'Sissy Squats / Búlgaras de Peso Corporal', s: '4 series x 12 reps', targetRpe: 8.0, muscleGroup: 'Cuádriceps', cue: 'Aislamiento supremo de cuádriceps sin pesas.' },
        { id: 'ap_c5', n: 'Hanging L-Sit / Leg Raises en Barra', s: '4 series x 12 reps', targetRpe: 9.0, muscleGroup: 'Abdomen', cue: 'Piernas totalmente rectas formando un ángulo de 90°.' },
      ],
    },
  },
  philosopher: {
    gym: {
      name: 'Senda del Filósofo • Gimnasio',
      focus: 'Fuerza Pura Calisténica & Ejercicios Compuestos',
      equipmentLabel: '🏋️ Gimnasio Completo',
      exercises: [
        { id: 'ph_g1', n: 'Dominadas Lastradas Estrictas', s: '4 series x 6 reps', targetRpe: 8.5, muscleGroup: 'Dorsales / Bíceps', cue: 'Carga añadida en cinturón manteniendo técnica perfecta.' },
        { id: 'ph_g2', n: 'Fondos en Paralelas Lastrados', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Pecho / Tríceps', cue: 'Inclinación leve de 15° y descenso controlado.' },
        { id: 'ph_g3', n: 'Sentadilla Zercher con Barra', s: '3 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Core / Piernas', cue: 'Barra en la flexura de los codos con espalda neutra.' },
        { id: 'ph_g4', n: 'Remo Invertido en Multipower', s: '4 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Espalda Alta', cue: 'Talones apoyados con pecho tocando la barra fija.' },
        { id: 'ph_g5', n: 'Dragon Flags / Toes to Bar', s: '4 series x 8 reps', targetRpe: 9.0, muscleGroup: 'Core Stoic', cue: 'Cuerpo rígido en descenso sin doblar caderas.' },
      ],
    },
    home_dumbbell: {
      name: 'Senda del Filósofo • Mancuernas en Casa',
      focus: 'Autodominio Físico con Mancuernas & Peso Corporal',
      equipmentLabel: '🏠 Mancuernas en Casa',
      exercises: [
        { id: 'ph_d1', n: 'Dominadas en Barra de Puerta / Remo Mancuerna', s: '4 series x 8 reps', targetRpe: 8.5, muscleGroup: 'Espalda', cue: 'Pausa en contracción máxima dorsal.' },
        { id: 'ph_d2', n: 'Fondos entre Dos Sillas con Mancuerna en Regazo', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Tríceps / Pecho', cue: 'Codos hacia atrás protegiendo los hombros.' },
        { id: 'ph_d3', n: 'Pistol Squats con Mancuerna de Contrapeso', s: '3 series x 8 reps/lado', targetRpe: 8.0, muscleGroup: 'Piernas', cue: 'Sostén una mancuerna ligera al frente para equilibrio.' },
        { id: 'ph_d4', n: 'Press Arnold con Mancuernas', s: '3 series x 10 reps', targetRpe: 8.0, muscleGroup: 'Hombros', cue: 'Rotación fluida desde palmas hacia adentro.' },
        { id: 'ph_d5', n: 'Hollow Body Hold con Mancuerna Ligera', s: '4 series x 30 seg', targetRpe: 8.5, muscleGroup: 'Core', cue: 'Lumbar pegada al suelo con brazos extendidos.' },
      ],
    },
    calisthenics: {
      name: 'Senda del Filósofo • Calistenia Pura',
      focus: 'Calistenia Pura, Dominio Gravitacional & Paz Mental',
      equipmentLabel: '🤸‍♂️ Peso Corporal',
      exercises: [
        { id: 'ph_c1', n: 'Dominadas Estrictas en Barra', s: '4 series x 10 reps', targetRpe: 8.5, muscleGroup: 'Dorsales / Bíceps', cue: 'Tirón simétrico sin balancear las piernas.' },
        { id: 'ph_c2', n: 'Fondos en Paralelas (Dips)', s: '4 series x 12 reps', targetRpe: 8.5, muscleGroup: 'Pecho / Tríceps', cue: 'Descenso a 90 grados y bloqueo controlado.' },
        { id: 'ph_c3', n: 'Pistol Squats (Sentadilla a 1 Pierna)', s: '3 series x 8 reps/pierna', targetRpe: 8.0, muscleGroup: 'Piernas', cue: 'Autodominio absoluto del equilibrio y fuerza unilateral.' },
        { id: 'ph_c4', n: 'Flexiones Diamante en Suelo', s: '4 series x 15 reps', targetRpe: 8.5, muscleGroup: 'Tríceps', cue: 'Pulgares e índices unidos con codos cerrados.' },
        { id: 'ph_c5', n: 'Hanging L-Sit / Hollow Body Stoic', s: '4 series x 30 seg', targetRpe: 9.0, muscleGroup: 'Core / Abdomen', cue: 'Temple mental sosteniendo la posición inmóvil.' },
      ],
    },
  },
};
