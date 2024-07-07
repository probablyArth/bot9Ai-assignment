import { useState, type FC, useRef } from "react";
import { Role, type ConversationMessage } from "@/types/Conversation";
import Message from "./Message.tsx";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Input } from "./ui/input.tsx";
import { postChat } from "@/http/index.ts";

const ChatWindow: FC<{
  sessionToken: string;
}> = ({ sessionToken }) => {
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);

  const sendMessage = async (message: string) => {
    setConversation((prev) => [...prev, { content: message, role: Role.USER }]);
    setIsLoading(true);
    const response = await postChat(message, sessionToken);
    setConversation((prev) => [
      ...prev,
      { content: response.message, role: Role.ASSISTANT, data: response.data },
    ]);
    setIsLoading(false);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="relative flex w-full flex-col items-center gap-4 rounded-sm border">
      <div className="bg-primary absolute left-0 top-0 z-10 w-full rounded-sm p-4 text-center text-white">
        Find a room
      </div>
      <ScrollArea className="h-[90vh] w-full">
        <div className="flex flex-col gap-4 p-4 py-32 pt-20">
          {conversation.map((c, idx) => (
            <Message message={c} key={idx} />
          ))}
        </div>
      </ScrollArea>
      <form
        className="bg-secondary absolute bottom-0 flex w-full items-center justify-center gap-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage(input.trim());
            setInput("");
          }
        }}
        id="query-form"
        ref={formRef}
      >
        <Input
          placeholder="Ask a question"
          className="border-primary resize-none rounded-sm"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          disabled={isLoading}
          ref={inputRef}
        />
        <Button
          className="h-[100%] rounded-sm"
          type="submit"
          disabled={isLoading}
        >
          <ArrowRight />
        </Button>
      </form>
    </div>
  );
};

export default ChatWindow;
