import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const { provider, apiKey, messages, system } = await req.json();

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 400 });
  }

  try {
    let responseText = '';

    switch (provider) {
      case 'claude': {
        const client = new Anthropic({ apiKey });
        const response = await client.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1024,
          system,
          messages: messages.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'assistant', // Anthropic expects 'user' or 'assistant'
            content: m.content,
          })),
        });
        responseText = response.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('');
        break;
      }
      case 'chatgpt': {
        const client = new OpenAI({ apiKey });
        const response = await client.chat.completions.create({
          model: 'gpt-4o',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: system },
            ...messages.map((m: any) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        });
        responseText = response.choices[0]?.message?.content || '';
        break;
      }
      case 'gemini': {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: system,
        });
        // Convert messages to Gemini format (user/model roles, and string content)
        const history = messages.slice(0, -1).map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: typeof m.content === 'string' ? m.content : m.content[0]?.text || '' }],
        }));
        const lastMessage = messages[messages.length - 1];
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(
          typeof lastMessage.content === 'string' ? lastMessage.content : lastMessage.content[0]?.text || ''
        );
        responseText = result.response.text();
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error(`AI API call failed for provider ${provider}:`, error);
    return NextResponse.json(
      { error: error.message || 'API call failed' },
      { status: 500 }
    );
  }
}
