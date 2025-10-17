import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CoverLetterViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coverLetterContent: string;
  metadata?: {
    tone?: string;
    wordCount?: number;
    estimatedReadTime?: string;
    keyPoints?: string[];
    suggestions?: string[];
    subject?: string;
  };
  title: string;
}

export function CoverLetterViewer({
  open,
  onOpenChange,
  coverLetterContent,
  metadata,
  title,
}: CoverLetterViewerProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterContent);
    toast({
      title: 'Copied to clipboard',
      description: 'Cover letter copied successfully',
    });
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetterContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'Cover letter downloaded successfully',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata */}
          {metadata && (
            <div className="flex flex-wrap gap-2">
              {metadata.tone && (
                <Badge variant="secondary" className="capitalize">
                  {metadata.tone}
                </Badge>
              )}
              {metadata.wordCount && (
                <Badge variant="secondary">
                  {metadata.wordCount} words
                </Badge>
              )}
              {metadata.estimatedReadTime && (
                <Badge variant="secondary">
                  {metadata.estimatedReadTime} read
                </Badge>
              )}
            </div>
          )}

          {/* Subject Line */}
          {metadata?.subject && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">Email Subject:</p>
              <p className="text-sm">{metadata.subject}</p>
            </div>
          )}

          {/* Cover Letter Content */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {coverLetterContent}
            </pre>
          </div>

          {/* Key Points */}
          {metadata?.keyPoints && metadata.keyPoints.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-sm">Key Qualifications Highlighted:</h4>
              <ul className="space-y-1">
                {metadata.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {metadata?.suggestions && metadata.suggestions.length > 0 && (
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-semibold mb-2 text-sm">Suggestions for Enhancement:</h4>
              <ul className="space-y-1">
                {metadata.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">💡</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleCopy} variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download as TXT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
