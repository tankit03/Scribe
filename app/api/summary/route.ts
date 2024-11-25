import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  const { transcript } = await req.json();

  if (!transcript || typeof transcript !== 'string') {
    return NextResponse.json(
      { error: 'Invalid transcript input' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an assistant that summarizes speech text into concise summaries.',
          },
          {
            role: 'user',
            content: `Summarize the following text: ${transcript}`,
          },
        ],
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({
      summary: response.data.choices[0].message.content,
    });
  } catch (error) {
    // Type-safe error handling
    if (axios.isAxiosError(error)) {
      console.error('Error from OpenAI:', error.response?.data || error.message);
      return NextResponse.json(
        { error: 'Failed to generate summary', details: error.response?.data },
        { status: 500 }
      );
    } else {
      console.error('Unexpected Error:', error);
      return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  }
}
