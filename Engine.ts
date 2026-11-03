import { planner } from "./lib/agents/planner";
import { builder } from "./lib/agents/builder";

const plan = await planner("build a to do app")
const build = await  builder(plan)

await Bun.write("output.html", build)
