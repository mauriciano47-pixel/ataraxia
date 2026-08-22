export interface StoicPrinciple {
  id: string;
  quote: string;
  author: string;
  work?: string;
  category: 'control' | 'resilience' | 'memento_mori' | 'discipline' | 'action' | 'wisdom';
}

export const STOIC_PRINCIPLES: StoicPrinciple[] = [
  {
    id: 'sp_1',
    quote: 'Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto y encontrarás fuerza.',
    author: 'Marco Aurelio',
    work: 'Meditaciones, IV',
    category: 'control',
  },
  {
    id: 'sp_2',
    quote: 'No nos afecta lo que nos sucede, sino lo que nos decimos acerca de lo que nos sucede.',
    author: 'Epicteto',
    work: 'Enquiridión, V',
    category: 'wisdom',
  },
  {
    id: 'sp_3',
    quote: 'El impedimento a la acción avanza la acción. Lo que se interpone en el camino se convierte en el camino.',
    author: 'Marco Aurelio',
    work: 'Meditaciones, V.20',
    category: 'resilience',
  },
  {
    id: 'sp_4',
    quote: 'Sufrimos más a menudo en la imaginación que en la realidad.',
    author: 'Séneca',
    work: 'Cartas a Lucilio, XIII',
    category: 'wisdom',
  },
  {
    id: 'sp_5',
    quote: 'Ningún hombre es libre si no es dueño de sí mismo.',
    author: 'Epicteto',
    work: 'Disertaciones',
    category: 'discipline',
  },
  {
    id: 'sp_6',
    quote: 'Comienza de inmediato a vivir, y cuenta cada día separado como una vida entera.',
    author: 'Séneca',
    work: 'Cartas a Lucilio, CI',
    category: 'memento_mori',
  },
  {
    id: 'sp_7',
    quote: 'No malgastes más tiempo argumentando sobre lo que debe ser un buen hombre. Sé uno.',
    author: 'Marco Aurelio',
    work: 'Meditaciones, X.16',
    category: 'action',
  },
  {
    id: 'sp_8',
    quote: 'Si quieres mejorar, mantente contento con ser considerado tonto y estúpido en las cosas externas.',
    author: 'Epicteto',
    work: 'Enquiridión, XIII',
    category: 'discipline',
  },
  {
    id: 'sp_9',
    quote: 'La suerte es lo que ocurre cuando la preparación se encuentra con la oportunidad.',
    author: 'Séneca',
    work: 'Epístolas',
    category: 'action',
  },
  {
    id: 'sp_10',
    quote: 'Al despertar por la mañana, reflexiona: qué privilegio es estar vivo, pensar, disfrutar, amar.',
    author: 'Marco Aurelio',
    work: 'Meditaciones, II.1',
    category: 'wisdom',
  },
  {
    id: 'sp_11',
    quote: 'El cuerpo debe ser tratado con rigor para que no sea desobediente a la mente.',
    author: 'Séneca',
    work: 'Cartas a Lucilio, VIII',
    category: 'discipline',
  },
  {
    id: 'sp_12',
    quote: 'Ningún viento es favorable para quien no sabe a qué puerto se dirige.',
    author: 'Séneca',
    work: 'Cartas a Lucilio, LXXI',
    category: 'control',
  },
  {
    id: 'sp_13',
    quote: 'No es porque las cosas sean difíciles que no nos atrevemos; es porque no nos atrevemos que son difíciles.',
    author: 'Séneca',
    work: 'Cartas a Lucilio, CIV',
    category: 'action',
  },
  {
    id: 'sp_14',
    quote: 'Cuanto más nos acercamos a una mente tranquila, más cerca estamos de la fuerza física y mental.',
    author: 'Marco Aurelio',
    work: 'Meditaciones, XI.18',
    category: 'resilience',
  },
  {
    id: 'sp_15',
    quote: 'Somete tus pasiones para que ellas no te sometan a ti.',
    author: 'Epicteto',
    work: 'Fragmentos',
    category: 'discipline',
  },
  {
    id: 'sp_16',
    quote: 'Nada grande se crea de repente, como tampoco un racimo de uvas o un higo.',
    author: 'Epicteto',
    work: 'Disertaciones, I.15',
    category: 'resilience',
  },
  {
    id: 'sp_17',
    quote: 'La felicidad de tu vida depende de la calidad de tus pensamientos.',
    author: 'Marco Aurelio',
    work: 'Meditaciones, III.9',
    category: 'wisdom',
  },
  {
    id: 'sp_18',
    quote: 'La muerte nos sonríe a todos; lo único que se puede hacer es devolverle la sonrisa.',
    author: 'Marco Aurelio',
    work: 'Meditaciones, IX',
    category: 'memento_mori',
  },
  {
    id: 'sp_19',
    quote: 'La dificultad muestra lo que son los hombres. Cuando surge una dificultad, recuerda que Dios te ha acoplado con un joven luchador rudo.',
    author: 'Epicteto',
    work: 'Disertaciones, I.24',
    category: 'resilience',
  },
  {
    id: 'sp_20',
    quote: 'Si una persona no sabe hacia qué puerto navega, ningún viento es el viento correcto.',
    author: 'Séneca',
    work: 'Cartas a Lucilio',
    category: 'control',
  },
  {
    id: 'sp_21',
    quote: 'Podrías dejar la vida justo ahora. Deja que eso determine lo que haces, dices y piensas.',
    author: 'Marco Aurelio',
    work: 'Meditaciones, II.11',
    category: 'memento_mori',
  },
  {
    id: 'sp_22',
    quote: 'Fortalece el cuerpo con el ejercicio duro para que obedezca al alma cuando las pruebas ataquen.',
    author: 'Musonio Rufo',
    work: 'Disertaciones, VI',
    category: 'discipline',
  },
];

import { getLocalTodayDateString } from '@/utils/dateUtils';

/**
 * Obtiene el principio estoico para la fecha actual garantizando rotación diaria no repetitiva.
 */
export function getDailyStoicPrinciple(dateStr?: string, offsetIndex: number = 0): StoicPrinciple {
  const targetDate = dateStr || getLocalTodayDateString();
  
  // Hash numérico determinista derivado de la fecha (ej: '2026-08-16' -> entero)
  let charSum = 0;
  for (let i = 0; i < targetDate.length; i++) {
    charSum = (charSum << 5) - charSum + targetDate.charCodeAt(i);
    charSum |= 0;
  }
  
  const baseIndex = Math.abs(charSum + offsetIndex) % STOIC_PRINCIPLES.length;
  return STOIC_PRINCIPLES[baseIndex];
}
