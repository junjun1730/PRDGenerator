import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import {NextResponse} from "next/server";

import { QUESTION_TEMPLATES } from "@/app/lib/questions";
import type { AnswerMap } from "@/app/type/types";
import messages from "@/messages/en.json";

export const maxDuration = 30;

const buildPrompt = (answers: AnswerMap) => {
  const sections = QUESTION_TEMPLATES.map(({ id, questionKey }) => {
    const question = messages.questions[questionKey as keyof typeof messages.questions];
    const answer = answers[id] || "";
    return `## ${question}\n${answer}`;
  });

  return `
You are a seasoned product manager. Based on the following information, please write a Product Requirements Document (PRD).

${sections.join("\n\n")}

The PRD should be written in Markdown format.
  `;
};

export async function POST(req: Request) {
  try {
    const { answers } = (await req.json()) as { answers: AnswerMap };

    const prompt = buildPrompt(answers);

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
