import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { SafeStorage } from '@/utils/safeStorage';

export interface JournalMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export interface JournalEntry {
  date: string;
  messages: JournalMessage[];
}

const JOURNAL_DATES_KEY = 'ataraxia_journal_dates_list';

function loadLocalJournal(dateStr: string): JournalMessage[] {
  try {
    const saved = SafeStorage.getItem(`ataraxia_journal_${dateStr}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function loadLocalPastEntries(todayStr: string): JournalEntry[] {
  try {
    const datesSaved = SafeStorage.getItem(JOURNAL_DATES_KEY);
    if (datesSaved) {
      const dates: string[] = JSON.parse(datesSaved);
      const entries: JournalEntry[] = [];
      for (const d of dates) {
        if (d !== todayStr) {
          const msgs = loadLocalJournal(d);
          if (msgs.length > 0) {
            entries.push({ date: d, messages: msgs });
          }
        }
      }
      return entries.slice(0, 3);
    }
  } catch {}
  return [];
}

export function useJournalHistory() {
  const today = new Date().toISOString().split('T')[0];
  const [messages, setMessages] = useState<JournalMessage[]>(() => loadLocalJournal(today));
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>(() => loadLocalPastEntries(today));
  const [loading, setLoading] = useState(Boolean(auth && db));
  const [disclaimerShown, setDisclaimerShown] = useState(() => messages.length > 0);

  // Cargar conversación del día actual + entradas pasadas
  useEffect(() => {
    if (!auth || !db) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !db) {
        setLoading(false);
        return;
      }

      try {
        const todayRef = doc(db, `users/${user.uid}/journal_entries/${today}`);
        const unsubSnapshot = onSnapshot(todayRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as JournalEntry;
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages);
              setDisclaimerShown(true);
              SafeStorage.setItem(`ataraxia_journal_${today}`, JSON.stringify(data.messages));
            }
          }
          setLoading(false);
        }, (error) => {
          console.warn("Firestore snapshot journal fallback local:", error);
          setLoading(false);
        });

        const pastQuery = query(
          collection(db, `users/${user.uid}/journal_entries`),
          orderBy('__name__', 'desc'),
          limit(4)
        );
        const snapshot = await getDocs(pastQuery);
        const entries: JournalEntry[] = [];
        const dateList: string[] = [];
        snapshot.forEach((docSnap) => {
          dateList.push(docSnap.id);
          if (docSnap.id !== today) {
            entries.push({
              date: docSnap.id,
              messages: (docSnap.data() as JournalEntry).messages || [],
            });
          }
        });
        setPastEntries(entries.slice(0, 3));
        SafeStorage.setItem(JOURNAL_DATES_KEY, JSON.stringify(dateList));

        return () => unsubSnapshot();
      } catch (error) {
        console.warn("Error en useJournalHistory, usando caché local:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [today]);

  const saveMessages = useCallback(async (updatedMessages: JournalMessage[]) => {
    // 1. Guardar siempre en SafeStorage de manera inmediata (Offline-first)
    SafeStorage.setItem(`ataraxia_journal_${today}`, JSON.stringify(updatedMessages));
    try {
      const datesSaved = SafeStorage.getItem(JOURNAL_DATES_KEY);
      const dates: string[] = datesSaved ? JSON.parse(datesSaved) : [];
      if (!dates.includes(today)) {
        dates.unshift(today);
        SafeStorage.setItem(JOURNAL_DATES_KEY, JSON.stringify(dates.slice(0, 10)));
      }
    } catch {}

    // 2. Sincronizar en la nube si hay usuario conectado
    if (!auth || !db || !auth.currentUser) return;

    const docRef = doc(db, `users/${auth.currentUser.uid}/journal_entries/${today}`);
    try {
      await setDoc(docRef, {
        date: today,
        messages: updatedMessages,
      }, { merge: true });
    } catch (error) {
      console.warn("Error guardando mensaje de journal en Firestore:", error);
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
