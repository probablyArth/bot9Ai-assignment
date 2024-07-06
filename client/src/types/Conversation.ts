export enum Role {
  USER = "user",
  ASSISTANT = "assistant",
}

export type ConversationMessage = {
  role: Role;
  content: string;
};
