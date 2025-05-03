import { StreamingTextResponse, experimental_StreamData } from 'ai';

import { generateTitleFromUserMessage } from '../../actions';

import { createClient } from '@/lib/supabase/server';

// Function to generate a simple random ID
function generateId(length = 16) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export const maxDuration = 300;

export async function POST(req: Request) {
    const json = await req.json();
    const {
        messages,
        chatId,
        previewToken,
        userId,
        projectId // Add optional projectId
    } = json;
    const userMessage = messages[messages.length - 1];

    try {
        // Check user auth
        const supabase = await createClient();
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Generate a new ID if needed
        let id = chatId;
        if (!id) {
            id = generateId();
        }

        // Handle chat retrieval and validation safely
        let chat = null;
        if (chatId) {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .eq('id', chatId)
                .single();

            if (!error) {
                chat = data;
            }
        }

        // Safely check user ownership
        if (chat && chat.user_id !== user.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Save the chat if it's new
        if (!chat) {
            const title = await generateTitleFromUserMessage({
                message: userMessage,
            });
            await saveChat({
                id,
                title,
                userId: user.id,
                supabase,
                projectId: projectId || null, // Include project_id
            });
        }

        // Save the message
        const messageId = generateId();
        const { error: messageError } = await supabase.from('messages').insert({
            id: messageId,
            chat_id: id,
            role: userMessage.role,
            content: userMessage.content,
            user_id: user.id,
        });

        if (messageError) {
            console.error('Error saving message:', messageError);
            return new Response('Error saving message', { status: 500 });
        }

        // Example simplified response
        const data = new experimental_StreamData();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode("AI response example"));
                controller.close();
            }
        });

        return new StreamingTextResponse(stream, { status: 200, headers: { 'Content-Type': 'text/plain' } });

    } catch (error) {
        console.error('Error processing request:', error);
        return new Response('Error processing request', { status: 500 });
    }
}

// Function to save a chat safely
async function saveChat({ 
    id, 
    title, 
    userId, 
    supabase, 
    projectId = null 
}: { 
    id: string; 
    title: string; 
    userId: string; 
    supabase: any; 
    projectId?: string | null;
}) {
    try {
        const { error } = await supabase.from('chats').insert({
            id,
            title,
            user_id: userId,
            project_id: projectId,
        });

        if (error) {
            console.error('Error saving chat:', error);
            throw error;
        }

        return { id };
    } catch (error) {
        console.error('Error in saveChat:', error);
        throw error;
    }
}
