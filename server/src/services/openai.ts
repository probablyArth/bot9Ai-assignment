import axios from 'axios';
import getEnvVar from 'env/index';
import { Conversation, Role } from 'models/conversation';
import OpenAI from 'openai';
import { ChatCompletionMessageParam, ChatCompletionTool, ChatCompletionToolChoiceOption } from 'openai/src/resources/index.js';

const client = new OpenAI({ apiKey: getEnvVar('OPENAI_API_KEY') });

const assistantPrompts: ChatCompletionMessageParam[] = [
  { role: 'system', content: 'you are a helpful assistant' },
  { role: 'system', content: 'your job is to help the user find the perfect room for them and make a booking' },
  { role: 'system', content: 'if the user is going off topic you should say that you don"t know about it and prompt them to make a booking' },
  { role: 'system', content: 'you should also understand the tone of the user and talk in the same tone' },
  {
    role: 'system',
    content:
      'always prompt the user for their full name, email address and the amount of nights when booking a room, do not proceed to call the function without it',
  },
];

enum TOOLS {
  FETCH_ROOMS = 'fetch_rooms',
  BOOK_ROOM = 'book_room',
}

const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: TOOLS.FETCH_ROOMS,
      description: 'fetch details of all the available rooms, the prices and the description',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: TOOLS.BOOK_ROOM,
      description: 'book a room for the user with the given details, fullName, roomId, email and nights',
      parameters: {
        type: 'object',
        properties: {
          roomId: {
            type: 'number',
            description: 'the id of the room to book',
          },
          fullName: {
            type: 'string',
            description: 'the full name of the user',
          },
          email: {
            type: 'string',
            description: 'the email of the user',
          },
          nights: {
            type: 'number',
            description: 'number of nights the user wants to book the room for',
          },
        },
        required: ['roomId', 'fullName', 'email', 'nights'],
      },
    },
  },
];

type ChatResponse = {
  message: string;
  data: unknown | null;
};

export const chat = async (
  sessionToken: string,
  tool_choice: ChatCompletionToolChoiceOption = 'auto',
  userMessage?: string,
): Promise<ChatResponse> => {
  const previousMessages = await Conversation.findAll({
    where: { sessionToken },
    order: [['createdAt', 'ASC']],
  });

  const transformedPreviousMessages: ChatCompletionMessageParam[] = previousMessages.map((message) => {
    if (message.role === Role.FUNCTION) {
      return {
        role: message.role,
        name: message.tool_called,
        content: JSON.stringify(message.tool_response),
      } as unknown as ChatCompletionMessageParam;
    }
    return { role: message.role, content: message.message } as unknown as ChatCompletionMessageParam;
  });
  const messages = [...assistantPrompts, ...transformedPreviousMessages];
  if (userMessage) {
    messages.push({ role: 'user', content: userMessage });
  }
  console.log({ messages });
  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    tools: tools,
    tool_choice,
  });

  const chatResponse = response.choices[0];

  if (chatResponse.finish_reason === 'tool_calls') {
    for (const toolCall of chatResponse.message.tool_calls!) {
      if (toolCall.function.name === TOOLS.FETCH_ROOMS) {
        const rooms = await fetchRooms();
        await Conversation.create({ role: Role.FUNCTION, sessionToken, tool_called: TOOLS.FETCH_ROOMS, tool_response: { rooms } });
        if (userMessage) {
          await Conversation.create({ message: userMessage, role: Role.USER, sessionToken });
        }
        const res = await chat(sessionToken, 'none');
        return { message: res.message, data: { rooms } };
      }
      if (toolCall.function.name === TOOLS.BOOK_ROOM) {
        const args = JSON.parse(toolCall.function.arguments) as unknown as BookArguments;
        const booking = await bookRoom(args);
        await Conversation.create({ role: Role.FUNCTION, sessionToken, tool_called: TOOLS.BOOK_ROOM, tool_response: { booking } });
        if (userMessage) {
          await Conversation.create({ message: userMessage, role: Role.USER, sessionToken });
        }
        const res = await chat(sessionToken, 'none');
        return { message: res.message, data: { booking } };
      }
    }
  } else {
    if (userMessage) {
      await Conversation.create({ message: userMessage, role: Role.USER, sessionToken });
    }
    await Conversation.create({
      message: chatResponse.message.content as string,
      role: Role.ASSISTANT,
      sessionToken,
      tool_called: null,
    });
    return { message: chatResponse.message.content as string, data: null };
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
