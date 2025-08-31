import { useState } from "react";
import { AudioRecorder } from "@/components/meetly/AudioRecorder";
import { RecordingsList } from "@/components/meetly/RecordingsList";
import { RecordingDetailModal } from "@/components/meetly/RecordingDetailModal";
import { Card, CardContent } from "@/components/ui/card";
import { MeetingRecording } from "@/types";
import { 
  Mic, 
  Brain, 
  Globe, 
  Zap,
  Shield,
  Cloud
} from "lucide-react";

export default function MeetlyPage() {
  const [selectedRecording, setSelectedRecording] = useState<MeetingRecording | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewRecording = (recording: MeetingRecording) => {
    setSelectedRecording(recording);
    setShowDetailModal(true);
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center shadow-elegant">
            <Mic className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Meetly
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-Powered Meeting Recordings & Transcription
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">AI Transcription</h3>
            <p className="text-xs text-purple-600 dark:text-purple-300">
              Powered by Google Gemini
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Auto Translation</h3>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Translate to English
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-green-800 dark:text-green-200">Smart Summary</h3>
            <p className="text-xs text-green-600 dark:text-green-300">
              Key points & action items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audio Recorder */}
        <div className="lg:col-span-1">
          <AudioRecorder />
          
          {/* Privacy & Security Info */}
          <Card className="mt-4 border-muted">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy & Security
              </h3>
              
              <div className="flex items-start gap-2 text-xs">
                <Cloud className="h-3 w-3 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-medium">Secure Storage</p>
                  <p className="text-muted-foreground">Recordings stored in Firebase</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-xs">
                <Brain className="h-3 w-3 mt-0.5 text-purple-500" />
                <div>
                  <p className="font-medium">AI Processing</p>
                  <p className="text-muted-foreground">Processed via Google Gemini API</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 text-xs">
                <Shield className="h-3 w-3 mt-0.5 text-green-500" />
                <div>
                  <p className="font-medium">Private Access</p>
                  <p className="text-muted-foreground">Only you can access your recordings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recordings List */}
        <div className="lg:col-span-2">
          <RecordingsList onViewRecording={handleViewRecording} />
        </div>
      </div>

      {/* Recording Detail Modal */}
      <RecordingDetailModal
        recording={selectedRecording}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
    </div>
  );
}