import { useState } from 'react';
import { Download, Trash2, Maximize2, Minimize2, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Resume } from '@/types/resume';

interface ResumePreviewProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (resume: Resume) => void;
  onDelete: (resume: Resume) => void;
  onUseForApplication?: (resume: Resume) => void;
}

export const ResumePreview = ({
  resume,
  open,
  onOpenChange,
  onDownload,
  onDelete,
  onUseForApplication,
}: ResumePreviewProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!resume) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isFullscreen ? 'max-w-screen max-h-screen w-screen h-screen' : 'max-w-4xl max-h-[90vh]'}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{resume.name}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Version {resume.version} • Created {new Date(resume.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-lg bg-muted/50 p-8">
          {/* Mock PDF preview - In production, use react-pdf */}
          <div className="bg-background rounded-lg shadow-lg max-w-2xl mx-auto p-8 space-y-6">
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center space-y-4">
                <FileText className="h-24 w-24 mx-auto opacity-50" />
                <p className="text-lg font-medium">Resume Preview</p>
                <p className="text-sm">
                  PDF preview will be displayed here in production
                </p>
                <p className="text-xs">
                  Install react-pdf for full PDF rendering
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          {onUseForApplication && (
            <Button onClick={() => onUseForApplication(resume)} className="flex-1">
              Use for Application
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              onDownload(resume);
              onOpenChange(false);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onDelete(resume);
              onOpenChange(false);
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
