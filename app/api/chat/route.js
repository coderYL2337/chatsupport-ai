import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Make sure the API key is correctly set
});

export async function POST(req) {
  try {
    const data = await req.json();
    // Assuming the incoming data has a similar structure to your example
    const completion = await openai.chat.completions.create({
      messages: [
        { "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": "Who won the world series in 2020?" },
        { "role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020." },
        { "role": "user", "content": "Where was it played?" }
      ],
      model: "gpt-4o-mini",  // Ensure you are using the correct model
    });

    // Log the entire response object for debugging
    console.log('API response:', completion);

    const responseMessage = completion.choices[0].message.content;
    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Error during API call:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
