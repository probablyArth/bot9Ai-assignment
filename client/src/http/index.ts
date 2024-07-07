import axios from "axios";

export type Room = {
  id: number;
  name: string;
  price: number;
  description: string;
};

export type Booking = {
  bookingId: number;
  message: string;
  roomName: string;
  fullName: string;
  email: string;
  nights: number;
  totalPrice: number;
};

export type ChatResponse = {
  message: string;
  data:
    | {
        rooms: Room[];
      }
    | {
        booking: Booking;
      };
};

export const postChat = async (message: string, sessionToken: string) => {
  return await axios
    .post<ChatResponse>(
      `${import.meta.env.VITE_API_BASE_URL}/api/chat`,
      {
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    )
    .then((res) => res.data);
};
