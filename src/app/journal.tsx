import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleGenAI } from '@google/genai';

import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function JournalScreen() {
  const { log } = useDailyLog();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Registra tus pensamientos del día o cómo te sentiste en el entreno. Lo que depende de ti es tu esfuerzo, no el resultado.', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const contextStr = `Eres el coach de ATARAXIA. Respondes con precisión técnica en nutrición/entrenamiento,
sin juicios morales sobre la comida ni enfoques terapéuticos o de psicología clínica. 
Cierras cada respuesta relevante conectando con un principio estoico breve (control, virtud, aceptación, la vista desde arriba), sin sonar a meme motivacional ni usar etiquetas de "bueno/malo" para alimentos.
El estado actual del usuario hoy es:
- Entreno: ${log.trainingCompleted ? 'Completado' : 'Pendiente'}
- Nutrición: ${log.mealsLogged} comidas registradas.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: inputText,
        config: {
          systemInstruction: contextStr,
        }
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || 'No pude generar una respuesta.',
        sender: 'bot',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Error de conexión con el Oráculo (Gemini).",
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <ThemedText style={styles.label}>REFLEXIÓN</ThemedText>
          <ThemedText style={styles.title}>Diario</ThemedText>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea} 
          contentContainerStyle={{ paddingBottom: Spacing.four }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble, 
                msg.sender === 'user' ? [styles.userMessage, { backgroundColor: colors.backgroundSelected, borderColor: colors.backgroundSelected }] : [styles.botMessage, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]
              ]}
            >
              <ThemedText style={msg.sender === 'user' ? { color: colors.text } : { color: colors.textSecondary, fontStyle: 'italic', fontFamily: 'serif' }}>
                {msg.text}
              </ThemedText>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <ThemedText style={{ color: colors.accent }}>Escribiendo...</ThemedText>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}
            placeholder="Escribe tu reflexión..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: colors.accent }]} 
            onPress={sendMessage}
            disabled={isLoading}
          >
            <ThemedText style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Enviar</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingTop: Spacing.four,
  },
  header: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#D32F2F',
    letterSpacing: 3,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 26,
    fontFamily: 'serif',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '900',
  },
  chatArea: {
    flex: 1,
  },
  messageBubble: {
    padding: Spacing.four,
    borderRadius: 0,
    marginBottom: Spacing.three,
    maxWidth: '85%',
    borderWidth: 2,
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderColor: '#333333',
    backgroundColor: '#050505',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 0,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 44,
  },
  sendButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 0,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
});
