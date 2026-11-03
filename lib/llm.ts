import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

export const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    temperature: 0,
    maxRetries: 2,
   
})

// const aiMsg = await llm.invoke([
//   {
//     role: "system",
//     content: "You are a helpful assistant that translates English to French. Translate the user sentence.",
//   },
//   {
//     role: "user",
//     content: "I love programming."
//   },
// ])
// console.log("AiMsg :", aiMsg)