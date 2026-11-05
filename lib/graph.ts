import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { planner } from "./agents/planner";
import { builder } from "./agents/builder";
import { reviewer} from "./agents/reviewer";
import type { Plan } from "./agents/planner";
import { stat } from "fs";

const MAX_BUILD = 3


const State = Annotation.Root({
  idea: Annotation<string>(),       // user ne kya likha ("build a todo app")
  plan: Annotation<Plan>(),         // planner ka JSON plan
  html: Annotation<string>(),       // builder ka HTML
  issues: Annotation<string[]>({ reducer: (_, b) => b, default: () => [] }),// reviewer ki complaints
  approved: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),// reviewer ne approve kiya ya nahi
  builds: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),// builder kitni baar chal chuka

});

// Har node: state padhta hai, kaam karta hai, naya data return karta hai
/* 
Q) explaining how state works in langraph?
State = ek shared notebook
Teen agents (planner, builder, reviewer) alag-alag functions hain. Unhe ek dusre ka kaam pata nahi hota. 
State ek notebook hai jo teeno ke beech share hoti hai. Har agent notebook padhta hai, apna kaam karta hai, aur apna result usi mein likh deta hai.
Jaise 3 doston ka group project: ek copy hai, pehla dost plan likhta hai, dusra wahi plan padh ke code likhta hai, teesra wahi code padh ke check karta hai.

Node jo object return karta hai, LangGraph use state (notebook) mein likh deta hai.

*/ 

// planner node 
async function plannerNode(state: typeof State.State) {
 console.log("planing...")
 const plan = await planner(state.idea)
 return {plan} // this will save in state 
    
}

// builder node
async function builderNode(state:typeof State.State) {
    console.log("building....")
    const html = await builder(state.plan, state.issues)
    return {
        html, builds:state.builds+1
    }
}
// review node
async function reviewNode(state:typeof State.State) {
    console.log("reviewing...")
    const review =  await reviewer(state.plan, state.html)
      console.log(review.approved ? "Approved!" : `Issues: ${review.issues.length}`);
   return {
    approved:review.approved, issues:review.issues
   }

}

// conditional node , after review it ends or goes back to builder
function decide(state:typeof State.State){
    if(state.approved) return "end"
    if(state.builds >= MAX_BUILD) return "end"
    return "builder"
}

export const graph = new StateGraph(State)
.addNode("planner", plannerNode)
.addNode("builder",builderNode)
.addNode("review",reviewNode)
.addEdge(START, "planner")
.addEdge("planner","builder")
.addEdge("builder","review")
.addConditionalEdges("review",decide, {builder:"builder", end:END})
.compile()