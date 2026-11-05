import { z } from "zod";
import { llm } from "../llm";

export const PlanSchema = z.object({
  title: z.string(),
  sections: z.array(z.string()),
  features: z.array(z.string()),
  style: z.string(),
});

export type Plan = z.infer<typeof PlanSchema>;

const SYSTEM_PROMPT = `You are a product planner.
Turn a vague one-line idea into a clear plan for a single-page website.
Return: a title, 3-6 page sections, 2-5 concrete features, and a one-line visual style
(colors, mood). Keep it practical and buildable in one HTML file.`;

export async function planner(idea: string): Promise<Plan> {
  const structured = llm.withStructuredOutput(PlanSchema);
  const PLANNER = await structured.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: idea },
  ]);
  console.log("PLANNER:", JSON.stringify(PLANNER, null, 2));
  return PLANNER
}