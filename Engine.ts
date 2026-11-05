import { graph } from "./lib/graph";

const idea = process.argv[2] ?? prompt("what's on your mind?")

if(!idea){
  console.log("no idead, closing...")
  process.exit(1)
}

console.log('Idea: ', idea)

const result = await graph.invoke({idea})

await Bun.write("output.html",result.html)

console.log("DONE!");
console.log("Approved:", result.approved);
console.log("Total builds:", result.builds);
console.log("Issues left:", result.issues);
console.log("output.html created, `run this command: start output.html`");
