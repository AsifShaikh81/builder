import { llm } from "../llm";
import type { Plan } from "./planner";

const SYSTEM_PROMPT = `You are a senior front-end developer.
Build a complete, working single-page website from the given plan.

Rules:
- Return ONE self-contained HTML file and nothing else. No explanations, no markdown fences.
- Use the Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script>
- Put all JavaScript in a <script> tag at the end of the body. No other external libraries.
- Implement every section and feature from the plan, and make the interactive parts actually work.
- Follow the visual style from the plan.
- Make it responsive and mobile friendly.`;

/* Sometimes LangChain AI provides the answer directly as text, and sometimes as a list of small chunks. 
 This function joins everything together in both cases to create a simple string. 
Because of this, the code won't break even if the model is changed. */
function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part: any) => (typeof part === "string" ? part : part?.text ?? ""))
      .join("");
  }
  return "";
}

// sometimes ai add this markdown ``` forefully so this regex is to remove that markdown
function cleanHtml(raw: string): string {
  return raw
    .replace(/^```(?:html)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}
// this builder function takes 2 params 1 is the plan(output from the planner agent) and 2nd is issue(from the review agent) 
export async function builder(plan: Plan, issues: string[] = []): Promise<string> {
  const feedback = issues.length
    ? `\n\nA reviewer rejected the previous version. Fix these issues:\n- ${issues.join("\n- ")}`
    : "";

  const res = await llm.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Plan:\n${JSON.stringify(plan, null, 2)}${feedback}` },
  ]);

  return cleanHtml(textOf(res.content));
}