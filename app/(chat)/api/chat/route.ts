export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  const user = await getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  try {
    const chat = await getChatById(id);

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });
      await saveChat({ id, userId: user.id, title });
    } else if (chat.user_id !== user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await saveMessages({
      chatId: id,
      messages: [
        {
          id: generateUUID(),
          chat_id: id,
          role: userMessage.role,
          content: formatMessageContent(userMessage),
          created_at: new Date().toISOString(),
        },
      ],
    });

    const streamingData = new StreamData();

    const result = await streamText({
      model: customModel(model.apiIdentifier),
      system: systemPrompt,
      messages: coreMessages,
      maxSteps: 5,
      experimental_activeTools: allTools,
      tools: {
        getWeather: {
          description: 'Get the current weather at a location',
          parameters: z.object({
            latitude: z.number(),
            longitude: z.number(),
          }),
          execute: async ({ latitude, longitude }) => {
            const response = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
            );
            const weatherData = await response.json();
            return weatherData;
          },
        },
        createDocument: {
          description: 'Create a document for a writing activity',
          parameters: z.object({ title: z.string() }),
          execute: async ({ title }) => {
            const id = generateUUID();
            let draftText: string = '';
            streamingData.append({ type: 'id', content: id });
            streamingData.append({ type: 'title', content: title });
            streamingData.append({ type: 'clear', content: '' });
            const { fullStream } = await streamText({
              model: customModel(model.apiIdentifier),
              system: 'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
              prompt: title,
            });

            for await (const delta of fullStream) {
              if (delta.type === 'text-delta') {
                draftText += delta.textDelta;
                streamingData.append({ type: 'text-delta', content: delta.textDelta });
              }
            }

            streamingData.append({ type: 'finish', content: '' });

            if (user && user.id) {
              await saveDocument({
                id,
                title,
                content: draftText,
                userId: user.id,
              });
            }

            return {
              id,
              title,
              content: 'Document created successfully',
            };
          },
        },
      },
      onFinish: async ({ responseMessages }) => {
        if (user && user.id) {
          try {
            const responseMessagesClean = sanitizeResponseMessages(responseMessages);
            await saveMessages({
              chatId: id,
              messages: responseMessagesClean.map((msg) => ({
                id: generateUUID(),
                chat_id: id,
                role: msg.role as MessageRole,
                content: formatMessageContent(msg),
                created_at: new Date().toISOString(),
              })),
            });
          } catch (error) {
            console.error('Failed to save chat:', error);
          }
        }

        streamingData.close();
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'stream-text',
      },
    });

    return result.toDataStreamResponse({ data: streamingData });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
