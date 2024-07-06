import axios from 'axios';
import getEnvVar from 'env/index';
import { Conversation } from 'models/conversation';
import OpenAI from 'openai';
import { ChatCompletionMessageParam, ChatCompletionTool, ChatCompletionToolChoiceOption } from 'openai/src/resources/index.js';

const client = new OpenAI({ apiKey: getEnvVar('OPENAI_API_KEY') });

const assistantPrompts: ChatCompletionMessageParam[] = [{ role: 'assistant', content: 'you are a helpful assistant' }];

enum TOOLS {
  FETCH_ROOMS = 'fetch_rooms',
  BOOK_ROOM = 'book_room',
}

const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: TOOLS.FETCH_ROOMS,
      description: 'fetch details of all the available rooms',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];

type ChatResponse = {
  message: string;
  data: unknown | null;
};

export const chat = async (
  userMessage: string,
  sessionToken: string,
  tool_choice: ChatCompletionToolChoiceOption = 'auto',
): Promise<ChatResponse> => {
  const previousMessages = await Conversation.findAll({
    where: { sessionToken },
    order: [['createdAt', 'ASC']],
  });

  const transformedPreviousMessages: ChatCompletionMessageParam[] = previousMessages.map((message) => {
    return { role: message.role, content: message.message } as unknown as ChatCompletionMessageParam;
  });

  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [...assistantPrompts, ...transformedPreviousMessages, { role: 'user', content: userMessage }],
    tools: tools,
    tool_choice,
  });

  const chatResponse = response.choices[0];
  console.log(chatResponse);
  if (chatResponse.finish_reason === 'tool_calls') {
    chatResponse.message.tool_calls!.forEach(async (toolCall) => {
      if (toolCall.function.name === TOOLS.FETCH_ROOMS) {
        const rooms = await fetchRooms();
        return { message: chatResponse.message.content, data: { rooms } };
      }
      if (toolCall.function.name === TOOLS.BOOK_ROOM) {
        const args = JSON.stringify(toolCall.function.arguments) as unknown as BookArguments;
        const bookResponse = await bookRoom(args);
        return { message: chatResponse.message.content, data: { booking: bookResponse } };
      }
    });
  }
  return { message: chatResponse.message.content as string, data: null };
};

type Room = {
  id: number;
  name: string;
  description: string;
  price: number;
};

const fetchRooms = () => axios.get<Room[]>('https://bot9assignement.deno.dev/rooms').then((response) => response.data);

type BookingResponse = {
  bookindId: string;
  message: string;
  roomName: string;
  fullName: string;
  email: string;
  nights: number;
  totalPrice: number;
};

type BookArguments = {
  roomId: number;
  fullName: string;
  email: string;
  nights: number;
};

const bookRoom = (bookArguments: BookArguments) =>
  axios.post<BookingResponse>('https://bot9assignement.deno.dev/book', { ...bookArguments }).then((response) => response.data);
