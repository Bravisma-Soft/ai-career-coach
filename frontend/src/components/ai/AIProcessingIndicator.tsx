import { Brain } from 'lucide-react';

interface AIProcessingIndicatorProps {
  message: string;
  progress?: number;
  submessage?: string;
}

export function AIProcessingIndicator({ message, progress, submessage }: AIProcessingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        <div className="relative bg-primary rounded-full p-6 animate-pulse">
          <Brain className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>

      <div className="space-y-2 text-center max-w-md">
        <p className="text-lg font-semibold">{message}</p>
        {submessage && (
          <p className="text-sm text-muted-foreground">{submessage}</p>
        )}
        {progress !== undefined && (
          <>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{progress}%</p>
          </>
        )}
      </div>
    </div>
  );
}
