import type { LLMConfig } from "../models/project.js";

// === Shared Types ===

export interface LLMResponse {
  readonly content: string;
  readonly usage: {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
  };
}

export interface LLMMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export interface LLMClient {
  readonly provider: "openai" | "anthropic" | "terminal";
  readonly service?: string;
  readonly configSource?: LLMConfig["configSource"];
  readonly apiFormat: "chat" | "responses";
  readonly stream: boolean;
  readonly proxyUrl?: string;
  readonly _piModel?: any;
  readonly _apiKey?: string;
  readonly defaults: {
    readonly temperature: number;
    readonly maxTokens: number;
    readonly maxTokensCap?: number | null;
    readonly thinkingBudget: number;
    readonly extra: Record<string, unknown>;
  };
}

// === Tool-calling Types ===

export interface ToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}

export interface ToolCall {
  readonly id: string;
  readonly name: string;
  readonly arguments: string;
}

export type AgentMessage =
  | { readonly role: "system"; readonly content: string }
  | { readonly role: "user"; readonly content: string }
  | { readonly role: "assistant"; readonly content: string | null; readonly toolCalls?: ReadonlyArray<ToolCall> }
  | { readonly role: "tool"; readonly toolCallId: string; readonly content: string };

export interface ChatWithToolsResult {
  readonly content: string;
  readonly toolCalls: ReadonlyArray<ToolCall>;
}

// === Factory ===

export function createLLMClient(config: LLMConfig): LLMClient {
  return {
    provider: "terminal",
    service: "terminal",
    configSource: config.configSource,
    apiFormat: "chat",
    stream: false,
    defaults: {
      temperature: config.temperature ?? 0.7,
      maxTokens: 4096,
      thinkingBudget: config.thinkingBudget ?? 0,
      extra: config.extra ?? {},
    },
  };
}

// === Helper for Terminal Interaction ===

async function readStdinUntilEOF(): Promise<string> {
  return new Promise((resolve) => {
    let buffer = "";
    process.stdin.setEncoding("utf-8");
    const listener = (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/);
      // Look for a line that is EXACTLY "EOF"
      const eofIndex = lines.findIndex(line => line.trim() === "EOF");
      if (eofIndex !== -1) {
        process.stdin.removeListener("data", listener);
        process.stdin.pause();
        resolve(lines.slice(0, eofIndex).join("\n").trim());
      }
    };
    process.stdin.on("data", listener);
    process.stdin.resume();
  });
}

// === Simple Chat ===

export async function chatCompletion(
  _client: LLMClient,
  _model: string,
  messages: ReadonlyArray<LLMMessage>,
  _options?: {
    readonly temperature?: number;
    readonly maxTokens?: number;
    readonly webSearch?: boolean;
    readonly onStreamProgress?: (progress: any) => void;
    readonly onTextDelta?: (text: string) => void;
  },
): Promise<LLMResponse> {
  console.log("\n\n" + "=".repeat(20) + " INKOS LLM PROMPT " + "=".repeat(20));
  for (const msg of messages) {
    console.log(`\n### ${msg.role.toUpperCase()}:\n${msg.content}`);
  }
  console.log("\n" + "=".repeat(20) + " END OF PROMPT " + "=".repeat(20));
  console.log("\n>>> Esperando respuesta de Gemini (escribe tu respuesta y finaliza con una línea que diga solo 'EOF'):");

  const content = await readStdinUntilEOF();

  return {
    content,
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  };
}

// === Tool-calling Chat ===

export async function chatWithTools(
  _client: LLMClient,
  _model: string,
  messages: ReadonlyArray<AgentMessage>,
  tools: ReadonlyArray<ToolDefinition>,
  _options?: {
    readonly temperature?: number;
    readonly maxTokens?: number;
  },
): Promise<ChatWithToolsResult> {
  console.log("\n\n" + "=".repeat(20) + " INKOS LLM PROMPT (WITH TOOLS) " + "=".repeat(20));
  for (const msg of messages) {
    if (msg.role === "assistant" && msg.toolCalls) {
      console.log(`\n### ASSISTANT (TOOL CALLS):\n${JSON.stringify(msg.toolCalls, null, 2)}`);
    } else {
      console.log(`\n### ${msg.role.toUpperCase()}:\n${(msg as any).content}`);
    }
  }

  console.log("\n### AVAILABLE TOOLS:");
  for (const tool of tools) {
    console.log(`- ${tool.name}: ${tool.description}`);
  }

  console.log("\n" + "=".repeat(20) + " END OF PROMPT " + "=".repeat(20));
  console.log("\n>>> Esperando respuesta de Gemini.");
  console.log("Si quieres llamar a una herramienta, responde con un JSON que contenga 'toolCalls'.");
  console.log("Si quieres responder con texto, simplemente escribe el texto.");
  console.log("Finaliza con una línea que diga solo 'EOF':");

  const rawContent = await readStdinUntilEOF();

  try {
    const json = JSON.parse(rawContent);
    if (json.toolCalls) {
      return {
        content: json.content || "",
        toolCalls: json.toolCalls,
      };
    }
  } catch {
    // Not JSON or doesn't have toolCalls, treat as regular content
  }

  return {
    content: rawContent,
    toolCalls: [],
  };
}

// Export empty or minimal versions of other things to keep TS happy if needed
export type StreamProgress = any;
export type OnStreamProgress = (progress: any) => void;
export function createStreamMonitor(_onProgress?: any, _intervalMs?: number) {
  return { onChunk: (_text: string) => {}, stop: () => {} };
}
export function __resetFixedTemperatureWarnings(): void {}
export class PartialResponseError extends Error {
  readonly partialContent: string = "";
}
