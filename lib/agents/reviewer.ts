import { llm } from "../llm";
import type { Plan } from "./planner";
import {z} from "zod"

const reviewSchema = z.object({
  checks: z.array(
    z.object({
      id: z.number(),      // checklist ka number
      passed: z.boolean(), // pass ya fail
      quote: z.string(),   // HTML se copy kiya hua saboot
    })
  ),
});
export type REVIEW = {approved:boolean, issues: string[]}

const SYSTEM_PROMPT = `You are a strict code reviewer.
You get a numbered checklist and a single HTML file.
For EVERY item return: id, passed (true/false), and quote.
quote = a short snippet (max 80 characters) copied EXACTLY from the HTML as proof.
If you cannot find proof in the HTML, set passed=false and quote="".
Do not skip any item.`

// Spaces aur capital letters hata ke text ko simple banata hai, taaki compare theek ho
function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

export async function reviewer(plan:Plan, html:string):Promise<REVIEW> {
const page =  clean(html)
const issues:string[] = []

// STEP 1: code checklist banata hai
  const items: string[] = [];
  for (const section of plan.sections) {
    items.push(`Section exists on the page: ${section}`);
  }
  for (const feature of plan.features) {
    items.push(`Feature works in the JavaScript: ${feature}`);
  }
  items.push(`Visual style matches the plan: ${plan.style}`);

  let checklist = "";
  for (let i = 0; i < items.length; i++) {
    checklist += `${i}. ${items[i]}\n`;
  }
  console.log("step 1:\nitems:",items ,"\nchecklist:",checklist)
  // STEP 2: LLM se pass/fail aur saboot maango
  const structured = llm.withStructuredOutput(reviewSchema);
  const review = await structured.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Checklist:\n${checklist}\nHTML:\n${html}` },
  ]);
//   console.log("RAW:", JSON.stringify(review, null, 2));

  // STEP 3: code har jawab verify karta hai
  for (let i = 0; i < items.length; i++) {
    const answer = review.checks.find((c) => c.id === i);

    if (!answer) {
      issues.push(`${items[i]} (reviewer gave no answer)`);
    } else if (!answer.passed) {
      issues.push(items[i]);
    } else if (!page.includes(clean(answer.quote))) {
      // LLM ne pass bola, par uska saboot HTML mein hai hi nahi
      issues.push(`${items[i]} (proof not found in HTML)`);
    }
    console.log("step 3-\n asnwer:",answer)
  }
 // Brand name: simple text match, LLM ki zaroorat nahi
  const brand = plan.title.split("-")[0].trim();
  if (!page.includes(clean(brand))) {
    issues.push(`Page must use the brand name "${brand}"`);
  }

// STEP 4: issues khali hain tabhi approve
  return { approved: issues.length === 0, issues };

}