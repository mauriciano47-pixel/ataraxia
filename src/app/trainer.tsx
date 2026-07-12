import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleGenAI } from '@google/genai';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth, Colors } from '@/constants/theme';
import { useDailyLog } from '@/hooks/useDailyLog';

const GEMINI_API_KEY = "AQ.Ab8RN6IVqmi2Ws_xpnDTS-Hc4T7VaVnpQr0NsTRKW_LKfSz54Q";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function TrainerScreen() {
  const { log } = useDailyLog();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '¡Hola! Soy tu entrenador personal. ¿Qué vas a entrenar hoy?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

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
      // Gemini AI call with user context
      const contextStr = `Eres un entrenador personal amigable y directo en una app llamada Ataraxia.
Tu objetivo es animar al usuario y guiarlo según su progreso diario. Responde de forma concisa.
El estado actual del usuario hoy es:
- Agua consumida: ${log.waterLitres.toFixed(1)}L de una meta de 2.5L
- Calorías consumidas: ${log.totalCalories || 0} de una meta de 2000 kcal
- Entrenamiento de fuerza: ${log.trainingCompleted ? 'Completado' : 'Pendiente'}`;

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
        text: "Hubo un error al conectar con Gemini. Revisa la consola.",
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Entrenador
        </ThemedText>

        <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: Spacing.four }}>
          {messages.map((msg) => (
            <ThemedView 
              key={msg.id} 
              type={msg.sender === 'bot' ? 'backgroundElement' : 'background'} 
              style={[
                styles.messageBubble, 
                msg.sender === 'user' ? [styles.userMessage, { backgroundColor: colors.accent }] : styles.botMessage
              ]}
            >
              <ThemedText style={msg.sender === 'user' ? { color: '#1A1A1A' } : undefined}>
                {msg.text}
              </ThemedText>
            </ThemedView>
          ))}
          {isLoading && (
            <ThemedView type="backgroundElement" style={[styles.messageBubble, styles.botMessage]}>
              <ThemedText>Escribiendo...</ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.textSecondary }]}
            placeholder="Escribe tu reporte..."
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
            <ThemedText style={{ color: '#1A1A1A', fontWeight: 'bold' }}>Enviar</ThemedText>
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
  },
  title: {
    marginVertical: Spacing.three,
  },
  chatArea: {
    flex: 1,
  },
  messageBubble: {
    padding: Spacing.four,
    borderRadius: Spacing.one, // Menos redondeado
    marginBottom: Spacing.three,
    maxWidth: '85%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 44,
  },
  sendButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.one,
    justifyContent: 'center',
  },
});
