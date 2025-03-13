"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  sender: {
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
};

type Conversation = {
  user: User;
  lastMessage: Message | null;
};

export function MessagesView() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversations
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages/conversations');
        if (!response.ok) throw new Error('Failed to fetch conversations');
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [session?.user?.id]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!session?.user?.id || !selectedUser) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?userId=${selectedUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [session?.user?.id, selectedUser]);

  const searchUsers = async (query: string | undefined) => {
    if (!query?.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search users');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const startNewConversation = (user: User) => {
    setSelectedUser(user);
    setIsNewMessageOpen(false);
    // Add to conversations if not already present
    if (!conversations.some(conv => conv.user.id === user.id)) {
      setConversations(prev => [{
        user,
        lastMessage: null
      }, ...prev]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user || !selectedUser) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          recipientId: selectedUser.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      // Optimistically add the message to the UI
      const tempMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: session.user.id,
        recipientId: selectedUser.id,
        sender: {
          name: session.user.name || null,
          image: session.user.image || null,
        },
        createdAt: new Date(),
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      scrollToBottom();

      // Update the conversation list
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.user.id === selectedUser.id) {
            return { ...conv, lastMessage: tempMessage };
          }
          return conv;
        });
        return updated;
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-lg border bg-background">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Messages</h2>
            <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <Command className="rounded-lg border shadow-md">
                  <CommandInput 
                    placeholder="Search users..." 
                    onValueChange={searchUsers}
                  />
                  <CommandEmpty>
                    {isSearching ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : (
                      "No users found."
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {searchResults.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => startNewConversation(user)}
                        className="flex items-center gap-2 p-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {user.name?.[0] || user.email[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.name || user.email}
                          </span>
                          {user.name && (
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-2">
            {conversations.map((conversation) => (
              <Button
                key={conversation.user.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start space-x-2",
                  selectedUser?.id === conversation.user.id && "bg-accent"
                )}
                onClick={() => setSelectedUser(conversation.user)}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={conversation.user.image || undefined} />
                  <AvatarFallback>
                    {conversation.user.name?.[0] || conversation.user.email[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-medium">
                    {conversation.user.name || conversation.user.email}
                  </div>
                  {conversation.lastMessage && (
                    <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {conversation.lastMessage.content}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedUser.image || undefined} />
                  <AvatarFallback>
                    {selectedUser.name?.[0] || selectedUser.email[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {selectedUser.name || selectedUser.email}
                  </div>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.senderId === session?.user?.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className="flex items-end gap-2 max-w-[70%]">
                      {message.senderId !== session?.user?.id && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={message.sender.image || undefined} />
                          <AvatarFallback>
                            {message.sender.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        message.senderId === session?.user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit">Send</Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
} 