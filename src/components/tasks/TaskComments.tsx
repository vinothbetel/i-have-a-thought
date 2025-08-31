import React, { useState, useEffect } from 'react';
import { TaskComment } from '@/types';
import { useComments } from '@/contexts/CommentsContext';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCommentsProps {
  taskId: string;
  className?: string;
}

export function TaskComments({ taskId, className }: TaskCommentsProps) {
  const { 
    comments, 
    commentCounts, 
    loading, 
    subscribeToTaskComments, 
    unsubscribeFromTaskComments 
  } = useComments();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const taskComments = comments[taskId] || [];
  const commentCount = commentCounts[taskId] || 0;
  const isLoading = loading[taskId] || false;

  useEffect(() => {
    if (isExpanded) {
      const unsubscribe = subscribeToTaskComments(taskId);
      return () => {
        if (unsubscribe) {
          unsubscribeFromTaskComments(taskId);
        }
      };
    }
  }, [taskId, isExpanded, subscribeToTaskComments, unsubscribeFromTaskComments]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setShowCommentForm(false);
    }
  };

  const handleCommentAdded = () => {
    setShowCommentForm(false);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Comments Header */}
      <Button
        variant="ghost"
        onClick={handleToggleExpanded}
        className="w-full justify-between p-3 h-auto hover:bg-muted/30 rounded-lg transition-all"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="h-4 w-4 text-primary/70" />
          <span className="text-sm font-medium text-muted-foreground">
            {commentCount === 0 ? 'No comments' : `${commentCount} comment${commentCount > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {commentCount > 0 && (
            <div className="h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{commentCount}</span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </Button>

      {/* Comments Content */}
      {isExpanded && (
        <Card className="mt-3 border border-border/50 shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-sm font-semibold text-foreground">Comments</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-4">
            {/* Add Comment Form */}
            {!showCommentForm ? (
              <Button
                variant="outline"
                onClick={() => setShowCommentForm(true)}
                className="w-full justify-start text-muted-foreground h-10 rounded-lg border-dashed border-2 hover:border-primary/30 hover:bg-primary/5 transition-all"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-3" />
                Add a comment...
              </Button>
            ) : (
              <CommentForm
                taskId={taskId}
                onCommentAdded={handleCommentAdded}
                onCancel={() => setShowCommentForm(false)}
              />
            )}

            {/* Comments List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Loading comments...
                </div>
              </div>
            ) : taskComments.length > 0 ? (
              <div className="space-y-4">
                {taskComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No comments yet</p>
                <p className="text-xs mt-1">Be the first to comment!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}