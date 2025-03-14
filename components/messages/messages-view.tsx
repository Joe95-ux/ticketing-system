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
import { Menu, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(value)}`);
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
    setIsMobileOpen(false);
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

  const handleConversationClick = (user: User) => {
    setSelectedUser(user);
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-lg border bg-background relative">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-2 md:hidden z-30 flex items-center gap-2 w-auto px-2"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="text-sm font-medium">Messages</span>
      </Button>

      {/* Conversations List */}
      <div className={cn(
        "flex flex-col transition-all duration-200 border-r border-border bg-background",
        isSidebarCollapsed ? "hidden md:flex md:w-[90px]" : "hidden md:flex md:w-[320px]",
        "rounded-l-lg"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && <h2 className="font-semibold">Messages</h2>}
            <div className={cn(
              "flex items-center gap-2",
              isSidebarCollapsed && "w-full justify-center px-2"
            )}>
              <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className={cn(
                    "transition-all duration-200",
                    isSidebarCollapsed ? "w-10 h-10 p-0" : "px-3"
                  )}>
                    {isSidebarCollapsed ? (
                      <MessageSquare className="h-4 w-4" />
                    ) : (
                      "New Message"
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                    <ScrollArea className="h-[300px]">
                      {isSearching ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      ) : searchResults.length === 0 && searchQuery ? (
                        <p className="text-center text-sm text-muted-foreground p-4">
                          No users found
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {searchResults.map((user) => (
                            <Button
                              key={user.id}
                              variant="ghost"
                              className="w-full flex items-center gap-2 p-2"
                              onClick={() => startNewConversation(user)}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback>
                                  {user.name?.[0] || user.email[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col text-left">
                                <span className="font-medium">
                                  {user.name || user.email}
                                </span>
                                {user.name && (
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hidden md:flex"
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    >
                      {isSidebarCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {isSidebarCollapsed ? "Show messages" : "Hide messages"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {conversations.map((conversation) => (
              <Button
                key={conversation.user.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start space-x-2",
                  selectedUser?.id === conversation.user.id && "bg-accent",
                  isSidebarCollapsed && "p-2 justify-center"
                )}
                onClick={() => handleConversationClick(conversation.user)}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={conversation.user.image || undefined} />
                  <AvatarFallback>
                    {conversation.user.name?.[0] || conversation.user.email[0]}
                  </AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed && (
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
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 bg-background">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-background flex items-center justify-between">
              <SheetTitle>Messages</SheetTitle>
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
                  <div className="space-y-4 mt-2">
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                    <ScrollArea className="h-[300px]">
                      {isSearching ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      ) : searchResults.length === 0 && searchQuery ? (
                        <p className="text-center text-sm text-muted-foreground p-4">
                          No users found
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {searchResults.map((user) => (
                            <Button
                              key={user.id}
                              variant="ghost"
                              className="w-full flex items-center gap-2 p-2"
                              onClick={() => startNewConversation(user)}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback>
                                  {user.name?.[0] || user.email[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col text-left">
                                <span className="font-medium">
                                  {user.name || user.email}
                                </span>
                                {user.name && (
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {conversations.map((conversation) => (
                  <Button
                    key={conversation.user.id}
                    variant="ghost"
                    className="w-full justify-start space-x-2"
                    onClick={() => handleConversationClick(conversation.user)}
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
        </SheetContent>
      </Sheet>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center">
              <div className="md:hidden w-6" /> {/* Spacer to offset the menu button */}
              <div className="flex items-center space-x-2 flex-1">
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