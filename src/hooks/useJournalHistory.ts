import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface JournalMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface JournalEntry {
  date: string;
  messages: JournalMessage[];
}

/**
 * Hook que persiste y recupera las conversaciones del Diario en Firestore.
 * - Carga la conversación del día actual al montar
 * - Guarda cada mensaje en tiempo real
 * - Recupera las últimas 3 conversaciones pasadas para contexto del coach
 */
export function useJournalHistory() {
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [disclaimerShown, setDisclaimerShown] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Cargar conversación del día actual + entradas pasadas
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Escuchar la conversación de hoy en tiempo real
        const todayRef = doc(db, `users/${user.uid}/journal_entries/${today}`);
        const unsubSnapshot = onSnapshot(todayRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as JournalEntry;
            setMessages(data.messages || []);
            // Si ya hay mensajes guardados, el disclaimer ya se mostró
            if (data.messages && data.messages.length > 0) {
              setDisclaimerShown(true);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Error cargando journal de hoy:", error);
          setLoading(false);
        });

        // 2. Cargar las últimas 3 entradas pasadas (excluyendo hoy)
        const pastQuery = query(
          collection(db, `users/${user.uid}/journal_entries`),
          orderBy('__name__', 'desc'),
          limit(4) // 4 para asegurar que al filtrar hoy queden 3
        );
        const snapshot = await getDocs(pastQuery);
        const entries: JournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.id !== today) {
            entries.push({
              date: docSnap.id,
              messages: (docSnap.data() as JournalEntry).messages || [],
            });
          }
        });
        setPastEntries(entries.slice(0, 3));

        return () => unsubSnapshot();
      } catch (error) {
        console.error("Error en useJournalHistory:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [today]);

  // Guardar mensajes en Firestore
  const saveMessages = useCallback(async (updatedMessages: JournalMessage[]) => {
    if (!auth.currentUser) return;

    const docRef = doc(db, `users/${auth.currentUser.uid}/journal_entries/${today}`);
    try {
      await setDoc(docRef, {
        date: today,
        messages: updatedMessages,
      }, { merge: true });
    } catch (error) {
      console.error("Error guardando mensaje de journal:", error);
    }
  }, [today]);

  // Añadir un mensaje y persistir
  const addMessage = useCallback(async (text: string, sender: 'user' | 'bot') => {
    const newMessage: JournalMessage = {
      text,
      sender,
      timestamp: Date.now(),
    };
    const updated = [...messages, newMessage];
    setMessages(updated);
    await saveMessages(updated);
    return updated;
  }, [messages, saveMessages]);

  // Generar resumen de conversaciones pasadas para el prompt del coach
  const getPastContext = useCallback((): string => {
    if (pastEntries.length === 0) return '';

    const lines: string[] = ['=== REFLEXIONES RECIENTES DEL USUARIO ==='];
    pastEntries.forEach(entry => {
      const userMsgs = entry.messages
        .filter(m => m.sender === 'user')
        .map(m => m.text)
        .join(' | ');
      if (userMsgs) {
        lines.push(`${entry.date}: "${userMsgs.substring(0, 200)}"`);
      }
    });
    return lines.join('\n');
  }, [pastEntries]);

  return {
    messages,
    setMessages,
    pastEntries,
    loading,
    disclaimerShown,
    setDisclaimerShown,
    addMessage,
    saveMessages,
    getPastContext,
  };
}
