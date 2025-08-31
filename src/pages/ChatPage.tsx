import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
          <p className="text-muted-foreground">
            Get help with task management and productivity tips
          </p>
        </div>
        
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardTitle>AI Assistant Feature</CardTitle>
            <CardDescription>
              We're working on bringing you an intelligent AI assistant to help with your productivity and task management.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Stay tuned for this exciting feature that will revolutionize how you manage your tasks and boost your productivity!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}