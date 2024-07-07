import { ChatResponse } from "@/http";

export enum Role {
  USER = "user",
  ASSISTANT = "assistant",
}

export type ConversationMessage = {
  role: Role;
  content: string;
  data?: ChatResponse["data"];
};
