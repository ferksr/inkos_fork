# InkOS (Antigravity Edition) 📖

Este es una versión modificada de InkOS diseñada específicamente para funcionar con **Antigravity (Gemini)** dentro de un entorno de chat de IDE.

A diferencia de la versión original, **no requiere ninguna API externa (OpenAI, Anthropic, etc.)**. Todo el procesamiento de IA ocurre directamente a través del chat de Gemini.

## ¿Cómo funciona?

InkOS actúa como un gestor de estado y contexto para tu novela. Cuando ejecutas un comando, InkOS prepara un "Work Package" (prompt + contexto) y lo imprime en la terminal. Gemini lee ese prompt, genera la respuesta y la devuelve a InkOS a través de la terminal.

### Flujo de trabajo:

1.  **Ejecutas un comando** (ej. `inkos write next`).
2.  **InkOS imprime el prompt** en la terminal.
3.  **Gemini genera la respuesta** en el chat del IDE.
4.  **Tú (o Gemini automáticamente) pegas la respuesta** en la terminal, finalizando con una línea que diga `EOF`.
5.  **InkOS procesa la respuesta**, actualiza los archivos de verdad (personajes, trama, estado) y guarda el capítulo.

## Instalación

1.  Clona este repositorio.
2.  Instala las dependencias:
    ```bash
    pnpm install
    ```
3.  Construye el proyecto:
    ```bash
    pnpm build
    ```
4.  Vincula el comando globalmente (opcional):
    ```bash
    npm link ./packages/cli
    ```

## Comandos Principales

- `inkos init`: Inicializa un proyecto.
- `inkos book create`: Crea una nueva novela.
- `inkos write next`: Escribe el siguiente capítulo (flujo completo).
- `inkos draft`: Solo escribe el borrador.
- `inkos audit`: Audita la continuidad del capítulo.
- `inkos settle`: Actualiza los hechos y el estado del mundo.

## Notas para el uso con Gemini

Para que la interacción sea fluida, Gemini debe seguir estas reglas:
- **Leer siempre los bloques** `=== INKOS LLM PROMPT ===`.
- **Terminar todas las respuestas** con una línea que contenga únicamente `EOF`.
- No inventar hechos que contradigan los archivos de verdad en la carpeta `story/`.

Consulta `AGENTS.md` para una guía técnica completa sobre cómo Gemini debe actuar como motor de InkOS.
