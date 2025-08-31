import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useMeetly } from "@/contexts/MeetlyContext";
import { MeetingRecording } from "@/types";
import { 
  FileAudio, 
  Clock, 
  Calendar, 
  FileText, 
  Languages, 
  Command as Summarize, 
  Trash2, 
  Search, 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RecordingsListProps {
  onViewRecording: (recording: MeetingRecording) => void;
  className?: string;
}

export function RecordingsList({ onViewRecording, className }: RecordingsListProps) {
  const { recordings, loading, deleteRecording } = useMeetly();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRecordings = recordings.filter(recording =>
    recording.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusIcon = (status: MeetingRecording['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileAudio className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: MeetingRecording['status']) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="secondary" className="text-blue-600 bg-blue-50">Uploading</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="text-orange-600 bg-orange-50">Processing</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="text-green-600 bg-green-50">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleDelete = async (recordingId: string) => {
    if (!confirm("Are you sure you want to delete this recording? This action cannot be undone.")) {
      return;
    }

    setDeletingId(recordingId);
    try {
      await deleteRecording(recordingId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className={cn("shadow-elegant", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Meeting Recordings
          </CardTitle>
          <Badge variant="outline">
            {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recordings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="text-center py-12 px-6">
              <FileAudio className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-muted-foreground mb-2">
                {recordings.length === 0 ? "No recordings yet" : "No recordings found"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {recordings.length === 0 
                  ? "Start recording your first meeting to see it here"
                  : "Try adjusting your search terms"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => recording.status === 'completed' && onViewRecording(recording)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getStatusIcon(recording.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight line-clamp-2">
                          {recording.title}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusBadge(recording.status)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(recording.id);
                            }}
                            disabled={deletingId === recording.id}
                          >
                            {deletingId === recording.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(recording.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(recording.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{formatFileSize(recording.fileSize)}</span>
                        </div>
                      </div>

                      {recording.status === 'processing' && (
                        <div className="text-xs text-muted-foreground">
                          <p>🤖 AI is generating transcript and summary...</p>
                        </div>
                      )}

                      {recording.status === 'completed' && (
                        <div className="flex items-center gap-3 text-xs">
                          {recording.transcript && (
                            <div className="flex items-center gap-1 text-green-600">
                              <FileText className="h-3 w-3" />
                              <span>Transcript</span>
                            </div>
                          )}
                          {recording.translatedTranscript && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Languages className="h-3 w-3" />
                              <span>Translation</span>
                            </div>
                          )}
                          {recording.summary && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <Summarize className="h-3 w-3" />
                              <span>Summary</span>
                            </div>
                          )}
                        </div>
                      )}

                      {recording.status === 'failed' && (
                        <div className="text-xs text-red-600">
                          <p>❌ Processing failed. Please try re-uploading.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}