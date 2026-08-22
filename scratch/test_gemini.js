const { GoogleGenAI } = require('@google/genai');
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AQ.Ab8RN6IVqmi2Ws_xpnDTS-Hc4T7VaVnpQr0NsTRKW_LKfSz54Q';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hola',
    });
    console.log('Gemini success:', response.text);
  } catch (err) {
    console.error('Gemini error:', err.message || err);
  }
}
test();
