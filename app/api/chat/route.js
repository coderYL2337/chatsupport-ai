// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,  // Make sure the API key is correctly set
// });

// export async function POST(req) {
//   try {
//     const data = await req.json();
//     const messages = data.messages;
//     // Assuming the incoming data has a similar structure to your example
//     const completion = await openai.chat.completions.create({
    
//       messages: messages,     
//       model: "gpt-4o-mini",  // Ensure you are using the correct model
//     });

//     // Log the entire response object for debugging
//     console.log('API response:', completion);

//     const responseMessage = completion.choices[0].message.content;
//     return NextResponse.json({ message: responseMessage });
//   } catch (error) {
//     console.error('Error during API call:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateEmbeddings, queryPinecone } from '../../../services/pineconeService';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_API_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
});  

export async function POST(req) {
  try{
  const data = await req.json();
  const messages = data.messages;
  const lastUserMessage = messages[messages.length - 1].content;
  console.log('Last user message:', lastUserMessage);

  // Generate embedding and query Pinecone (as before)
  const queryEmbedding = await generateEmbeddings(lastUserMessage);
  console.log('Generated embedding:', queryEmbedding.slice(0, 5) + '...');
  console.log('Querying Pinecone...');
  const queryResult = await queryPinecone('chatsupport', queryEmbedding);
  console.log('Pinecone query result:', JSON.stringify(queryResult, null, 2));

  // const relevantInfo = queryResult.matches
  //   .map(match => match.metadata.title)
  //   .join('\n');
  let relevantInfo = 'No specific information found.';
  if (queryResult && queryResult.matches && Array.isArray(queryResult.matches)) {
    relevantInfo = queryResult.matches
      .filter(match => match && match.metadata)
      .map(match => {
        let title = match.metadata.title || match.metadata.text || 'No title available';
        let url = match.metadata.url || 'No URL available';
        if (url !== 'No URL available') {
          relevantUrls.push(url);
        }
        return `Title: ${title}\nURL: ${url}\nRelevance Score: ${match.score}`;
      })
      .join('\n\n');
  }

  // if (queryResult && queryResult.matches && Array.isArray(queryResult.matches)) {
  //   relevantInfo = queryResult.matches
  //     .filter(match => match && match.metadata)
  //     .map(match => {
  //       if (match.metadata.title) {
  //         return match.metadata.title;
  //       } else if (match.metadata.text) {
  //         return match.metadata.text;
  //       } else {
  //         console.log('Unexpected metadata structure:', match.metadata);
  //         return JSON.stringify(match.metadata);
  //       }
  //     })
  //     .join('\n');
  // }
  

  console.log('Relevant info:', relevantInfo);

  const systemMessageWithContext = `
    ${messages[0].content}
    
    Relevant information from Starbucks knowledge base:
    ${relevantInfo}
  `;

  messages[0].content = systemMessageWithContext;
  console.log('Sending request to OpenAI...');

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  console.log('OpenAI response:', readable);

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}catch (error) {
  console.error('Error during API call:', error);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
}
  



// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,  // Make sure the API key is correctly set
// });

// export async function POST(req) {
//   try {
//     const data = await req.json();
//     const messages = data.messages;
//     // Assuming the incoming data has a similar structure to your example
//     const completion = await openai.chat.completions.create({
    
//       messages: messages,     
//       model: "gpt-4o-mini",  // Ensure you are using the correct model
//       stream: true,
//     });
//     const stream=new ReadableStream({
//       async start(controller) {
//         const encoder = new TextEncoder();
//         try {
//           for await (const chunk of completion) {
//           const completion = await openai.chat.completions.create({
//             messages: messages,
//             model: "gpt-4o-mini",
//             stream: true,
//           });
//           const responseMessage = completion.choices[0].message.content;
//           controller.enqueue(encoder.encode(responseMessage));
//         }
//         controller.enqueue(messages);
//         controller.close();
//       }
//     });

//     // Log the entire response object for debugging
//     console.log('API response:', completion);

//     const responseMessage = completion.choices[0].message.content;
//     return NextResponse.json({ message: responseMessage });
//   } catch (error) {
//     console.error('Error during API call:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
