import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  listing_id: string | null;
  updated_at: string;
  participant1: {
    username: string;
    avatar_url: string | null;
  };
  participant2: {
    username: string;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.conversation_id === selectedConversation) {
            setMessages((prev) => [...prev, newMsg]);
          }
          loadConversations(); // Refresh to update last message
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(username, avatar_url),
          participant2:profiles!conversations_participant2_id_fkey(username, avatar_url)
        `)
        .or(`participant1_id.eq.${user?.id},participant2_id.eq.${user?.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Load last message for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return { ...conv, last_message: lastMsg };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user?.id);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadMessages(conversationId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConversation);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant1_id === user?.id
      ? conversation.participant2
      : conversation.participant1;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Conversations list */}
        <div className={`${selectedConversation ? "hidden md:block" : "block"} w-full md:w-80 border-r border-border`}>
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          <ScrollArea className="h-[calc(100vh-9rem)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Aucune conversation
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const displayName = other.username || "Utilisateur";
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-accent transition-colors ${
                      selectedConversation === conv.id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={other.avatar_url || undefined} />
                        <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{displayName}</p>
                        {conv.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message.content}
                          </p>
                        )}
                      </div>
                      {conv.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.last_message.created_at), {
                            locale: fr,
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>
        </div>

        {/* Messages view */}
        <div className={`${selectedConversation ? "block" : "hidden md:block"} flex-1 flex flex-col`}>
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                {(() => {
                  const conv = conversations.find((c) => c.id === selectedConversation);
                  if (!conv) return null;
                  const other = getOtherParticipant(conv);
                  const displayName = other.username || "Utilisateur";
                  return (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={other.avatar_url || undefined} />
                        <AvatarFallback>{displayName[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{displayName}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {formatDistanceToNow(new Date(message.created_at), {
                            locale: fr,
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="hidden md:flex items-center justify-center h-full text-muted-foreground">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;