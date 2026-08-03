# Expo HAS CHANGED

Read the exact versioned docs at <https://docs.expo.dev/versions/v57.0.0/> before writing any code.

## Flujo Automatizado

- **Ejecución sin confirmación**: Al trabajar en cambios para Ataraxia, ejecutar todos los comandos de terminal (instalar dependencias, iniciar servidores, builds, etc.) de forma directa sin pedir autorización al usuario, para mantener un flujo rápido y automatizado.

## Sincronización Automática con Git y Cerebros Obsidian (/learn)

- **Commits Automáticos de Git**: Cada vez que se completen modificaciones, parches, rediseños o nuevas funcionalidades en la aplicación, el agente DEBE realizar automáticamente un commit en Git (`git add .` y `git commit -m "..."`) documentando los cambios realizados de forma limpia y descriptiva.
- **Actualización Obligatoria de Cerebros Obsidian**: Tras cada actualización importante, el agente DEBE crear o actualizar la nota correspondiente en el cerebro de Obsidian ubicado en `C:\Users\mauro\OneDrive\Desktop\Cerebros_Obsidian\cerebro_<nombre_app>` (por ejemplo, en `cerebro_ataraxia`), incluyendo la arquitectura, paleta de colores, nuevos componentes y decisiones clave para mantener la base de conocimiento siempre al día.

## Resolución Proactiva de Problemas y Alertas de Terminal

- **Solución Obligatoria de Errores y Alertas**: En cada modificación, actualización o desarrollo de aplicaciones (en esta carpeta y en todos los proyectos de las apps del usuario), el agente DEBE identificar, diagnosticar y solucionar proactivamente cualquier problema, error de compilación (TypeScript/React Native/Expo/Next.js/Vite/Linter) y alerta/warning emitido en la terminal antes de dar por finalizada la tarea.
