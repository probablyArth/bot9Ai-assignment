import type { FC } from "react";
import { Role, type ConversationMessage } from "@/types/Conversation";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Markdown from "react-markdown";
import { Room as RoomT } from "@/http";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

const Room: FC<{ room: RoomT }> = ({ room }) => {
  return (
    <Card key={room.id} className="max-w-[200px] text-wrap">
      <CardHeader>
        <CardTitle>{room.name}</CardTitle>
        <CardDescription>{room.description}</CardDescription>
        <CardDescription>${room.price}</CardDescription>
      </CardHeader>
    </Card>
  );
};

const Message: FC<{
  message: ConversationMessage;
}> = ({ message }) => {
  return (
    <div className="flex flex-col gap-2">
      <Markdown
        className={`max-w-[70%] rounded-sm p-4 ${
          message.role === Role.USER
            ? "bg-primary text-secondary self-end"
            : "bg-secondary text-primary self-start"
        }`}
      >
        {message.content}
      </Markdown>
      {message.data &&
        ("rooms" in message.data ? (
          <ScrollArea className="max-w-[60%] whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">
              {message.data.rooms.map((room) => (
                <Room room={room} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <Card className="w-fit">
            <CardHeader className="text-left">
              <CardTitle>{message.data.booking.roomName}</CardTitle>
              <CardDescription>
                Nights: <b>{message.data.booking.nights}</b>
              </CardDescription>
              <CardDescription>
                Total Price: <b>{message.data.booking.totalPrice}</b>
              </CardDescription>
              <CardDescription className="text-md">
                {message.data.booking.message}!!
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
    </div>
  );
};

export default Message;
