# Reglas del Proyecto y Guía de Trabajo (Ataraxia & Apps)

Read the exact versioned Expo docs at <https://docs.expo.dev/versions/v57.0.0/> before writing any code.

## 🛡️ Seguridad Avanzada & Protección de Datos (Zero-Leakage & OWASP)

- **Zero Leakage de Credenciales**: Queda estrictamente prohibido exponer o escribir llaves privadas, tokens de API de producción (OpenAI, Gemini, Firebase Admin) o credenciales de usuarios en mensajes planos o archivos de registro no protegidos. Las claves deben manejarse exclusivamente en `.env` (incluido en `.gitignore`).
- **Sanitización y Validación Estricta**: Toda entrada de usuario y mutación en Firestore o bases de datos debe pasar por validación de tipos e inmutabilidad (TypeScript estricto, Firestore Security Rules) para evitar inyecciones XSS, SQLi o datos malformados.
- **Respaldo de Comandos Destructivos**: Ante cualquier comando con potencial de eliminación de datos masivos o infraestructura, el agente creará primero una copia de seguridad temporal en la carpeta `scratch/` del proyecto activo.

## ⚡ Calidad de Entrega & Excelencia Técnica (Zero-Warning Standard)

- **Garantía de Compilación Sin Warnings (Zero-Warning Standard)**: Antes de finalizar cualquier tarea o hacer commit de Git, el agente DEBE ejecutar la validación de compilación (`npx expo export` o `npm run build`) y corregir proactivamente todo error de TypeScript y alertas de linter.
- **Resiliencia y Fallback Graceful**: Toda integración de APIs de terceros o servicios de IA debe contar con un mecanismo de fallback o simulación guiada para evitar cierres inesperados o pantallas congeladas en caso de fallos de red o límite de cuotas.
- **Estándar de Diseño Cyber-Obsidian Royal**: Mantener coherencia estética en todos los prototipos y aplicaciones (modos oscuros OLED, paleta de acentos azul eléctrico y esmeralda, fuentes cuidadas y maquetación adaptada a dispositivos móviles y escritorio).
- **Blindaje de Renderizado SSR & Web (Anti-Zero Dimension Standard)**: En exportaciones web/estáticas (`expo export`), `Dimensions.get('window')` devuelve `0`. Todo cálculo de tamaño para imágenes, SVGs o contenedores DEBE contar con valores de respaldo estáticos no nulos (`SCREEN_WIDTH || 390`) o restricciones responsivas CSS (`vw`, `vh`, `clamp`). Además, los recursos visuales críticos deben tener opacidad base `1` y unidades `'px'` explícitas para evitar bloqueos durante la hidratación SSR.

## 🚀 Flujo Automatizado & Despliegue

- **Ejecución sin confirmación**: Al trabajar en cambios para Ataraxia, ejecutar todos los comandos de terminal (instalar dependencias, iniciar servidores, builds, etc.) de forma directa sin pedir autorización al usuario, para mantener un flujo rápido y automatizado.
- **Commits Automáticos de Git**: Cada vez que se completen modificaciones, parches, rediseños o nuevas funcionalidades en la aplicación, el agente DEBE realizar automáticamente un commit en Git (`git add .` y `git commit -m "..."`) documentando los cambios realizados de forma limpia y descriptiva.
- **Actualización Obligatoria de Cerebros Obsidian**: Tras cada actualización importante, el agente DEBE crear o actualizar la nota correspondiente en el cerebro de Obsidian ubicado en `C:\Users\mauro\OneDrive\Desktop\Cerebros_Obsidian\cerebro_<nombre_app>` (por ejemplo, en `cerebro_ataraxia`), incluyendo la arquitectura, paleta de colores, nuevos componentes y decisiones clave para mantener la base de conocimiento siempre al día.
- **Autodiagnóstico y Despliegue Inmediato**: Al completar cualquier rediseño o actualización visual en aplicaciones Web / PWA / Expo, ejecutar la compilación de producción e informar las URLs de acceso.
