import type { AnswerMap } from "../type/types";

export const generatePrd = async ({
  answers,
  onData,
  onCompletion,
  onError,
}: {
  answers: AnswerMap;
  onData: (chunk: string) => void;
  onCompletion?: () => void;
  onError?: (error: Error) => void;
}) => {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });
      onData(chunk);
    }
    onCompletion?.();
  } catch (error) {
    console.error("Error generating PRD:", error);
    if (error instanceof Error) {
      onError?.(error);
    }
  }
};
