# Ataraxia - El Oráculo Estoico 🏛️

Ataraxia no es otra simple aplicación de seguimiento de hábitos. Es un "Coach" estoico en tu bolsillo diseñado para desarrollar la disciplina mental y física basándose en los principios de la filosofía estoica (Marco Aurelio, Séneca, Epicteto).

En lugar de usar recompensas dopaminérgicas (likes, rachas coloridas, notificaciones invasivas), Ataraxia promueve el control sobre lo único que puedes controlar: tu esfuerzo, tu percepción y tus acciones en el presente.

## Características Principales

1. **Inteligencia Artificial Visual (El Oráculo):** A través de Gemini 2.5 Flash, la app te permite subir fotos de tus comidas. La IA actúa como un oráculo que escanea, juzga imparcialmente y calcula las calorías y macros automáticamente.
2. **Dicotomía del Control (Amor Fati):** Un botón de emergencia en el entrenamiento. Si las circunstancias externas arruinan tu plan de ir al gimnasio (clima, tiempo), con un solo toque la app adapta tu rutina a una sesión de calistenia extrema en casa.
3. **Escala de Esfuerzo Percibido (RPE):** No se trata de qué levantaste, sino de cuánto te costó. Cada ejercicio se puntúa del 1 al 10 en esfuerzo real.
4. **Semana de Descarga Automática (Deload):** Si el oráculo detecta que tu esfuerzo promedio es superior a 8.5/10, interviene recordando que *"el arco siempre tenso se rompe"* y ajusta la intensidad.
5. **Historial del Cosmos:** Un mapa estelar de los últimos 30 días. Los días de disciplina son estrellas azules eléctricas en el vacío oscuro. Los días fallidos se quedan como espacio vacío.
6. **Memento Mori:** Recordatorios matutinos push que te recuerdan tu propia mortalidad para vivir cada día con urgencia y propósito.
7. **El Yo (Perfil Prokopton):** Un perfil sin métricas vanidosas. Sin fotos de perfil. Solo un ID ciudadano anónimo y un botón de "Destruir Ego" (Borrado total de cuenta).

---

## Stack Tecnológico 💻

Esta aplicación ha sido desarrollada como una aplicación nativa tanto para **Android** como para **iOS** utilizando un stack moderno, reactivo y enfocado en la velocidad:

*   **Framework:** [React Native](https://reactnative.dev/) con [Expo](https://expo.dev/) (Expo Router v3 para navegación basada en archivos).
*   **Lenguaje:** TypeScript estricto.
*   **Backend:** Firebase (Firestore para base de datos NoSQL en tiempo real y Firebase Auth para autenticación anónima).
*   **Inteligencia Artificial:** Google Gemini API (`@google/genai` sdk).
*   **Notificaciones:** `expo-notifications` programadas localmente.

### Compilación para Android y iOS

Para lograr que la aplicación corra en móviles con acceso a módulos nativos pesados (como la Cámara y la IA), se ha utilizado el ecosistema de **EAS (Expo Application Services)**:

1. **Expo Go:** Se usó para el maquetado inicial de UI y navegación.
2. **Development Builds (Custom Clients):** Debido a que el acceso nativo profundo y algunas librerías requieren binarios compilados (no soportados en el sandbox de Expo Go), la app se prepara para compilarse en la nube de Expo.
3. **Android (APK/AAB):** Compilada ejecutando `eas build --platform android`.
4. **iOS (IPA):** Compilada ejecutando `eas build --platform ios`.

---

## Estructura del Proyecto 📂

```text
ataraxia/
├── assets/                  # Imágenes, íconos de la app y fuentes locales.
├── src/
│   ├── app/                 # Rutas de la app (Expo Router).
│   │   ├── _layout.tsx      # Layout principal, Provider y Configuración de Notificaciones (Memento Mori).
│   │   ├── index.tsx        # Pantalla de "Hoy". Dashboard principal y Constelación diaria.
│   │   ├── trainer.tsx      # Pantalla de "Entrenamiento" (RPE, Amor Fati).
│   │   ├── nutrition.tsx    # Pantalla de "Nutrición" (Cámara e IA de Gemini).
│   │   ├── journal.tsx      # Pantalla de "Diario" y Check-in.
│   │   ├── progress.tsx     # Pantalla de "Historial del Cosmos".
│   │   └── profile.tsx      # Pantalla de "El Yo" (Preferencias).
│   │
│   ├── components/          # Componentes reusables de React.
│   │   ├── app-tabs.tsx     # Navegación inferior (Bottom Tabs).
│   │   ├── themed-view.tsx  # View adaptativo al Dark/Light mode.
│   │   └── themed-text.tsx  # Text adaptativo y estilizado.
│   │
│   ├── constants/           # Valores estáticos y configuración.
│   │   └── theme.ts         # Tokens de diseño (Paleta estoica oscura y azul brillante).
│   │
│   ├── hooks/               # Hooks customizados de React.
│   │   └── useDailyLog.ts   # Core State Manager. Sincronización en tiempo real con Firestore.
│   │
│   └── lib/                 # Librerías de terceros e inicializaciones.
│       └── firebase.ts      # Configuración e inicialización de la app de Firebase.
│
├── package.json             # Dependencias del proyecto.
└── app.json                 # Configuración del manifiesto de Expo (Permisos, bundle ID).
```

---

> *"No pierdas más tiempo discutiendo lo que debe ser un hombre bueno. Sé uno."* – Marco Aurelio
