"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ContentRenderer } from "@/components/content-renderer";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    role?: string;
  };
}

interface TicketCommentsProps {
  ticketId: string;
  initialComments: Comment[];
  status: string;
}

export function TicketComments({ ticketId, initialComments, status }: TicketCommentsProps) {
  const [comments, setComments] = React.useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const isResolved = status === "RESOLVED" || status === "CLOSED";

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add comment");
      }

      const comment = await response.json();
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
      toast.success("Success", {
        description: "Comment added successfully.",
      });
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isResolved ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This ticket has been marked as {status.toLowerCase()}. No new comments can be added.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={addComment} className="space-y-4">
            <RichTextEditor
              content={newComment}
              onChange={setNewComment}
              placeholder="Add a comment..."
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Comment"}
            </Button>
          </form>
        )}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user.image || ""} />
                <AvatarFallback>
                  {comment.user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.name}</span>
                  {comment.user.role && (
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                      {comment.user.role.toLowerCase()}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <ContentRenderer content={comment.content} />
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 