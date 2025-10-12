import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Download, RotateCw, Save } from 'lucide-react';
import { Job } from '@/types/job';
import { useResumesStore } from '@/store/resumesStore';
import { useAIStore } from '@/store/aiStore';
import { aiService } from '@/services/aiService';
import { AIProcessingIndicator } from './AIProcessingIndicator';
import { toast } from '@/hooks/use-toast';

interface CoverLetterModalProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoverLetterModal({ job, open, onOpenChange }: CoverLetterModalProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'formal'>('professional');
  const [notes, setNotes] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [view, setView] = useState<'form' | 'processing' | 'results'>('form');
  
  const { resumes } = useResumesStore();
  const { 
    coverLetter, 
    progress, 
    setProcessing, 
    setCoverLetter, 
    setProgress, 
    setError,
    reset 
  } = useAIStore();

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  const handleGenerate = async () => {
    if (!selectedResume) {
      toast({
        title: 'No resume selected',
        description: 'Please select a resume to generate cover letter',
        variant: 'destructive'
      });
      return;
    }

    setView('processing');
    setProcessing('cover-letter');

    try {
      const result = await aiService.generateCoverLetter(
        selectedResume,
        job,
        tone,
        notes,
        (message, progressValue) => setProgress({ message, progress: progressValue })
      );
      
      setCoverLetter(result);
      setEditedContent(result.content);
      setView('results');
      toast({
        title: 'Cover letter generated!',
        description: 'Your personalized cover letter is ready'
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate cover letter');
      toast({
        title: 'Error',
        description: 'Failed to generate cover letter. Please try again.',
        variant: 'destructive'
      });
      setView('form');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    toast({
      title: 'Copied to clipboard',
      description: 'Cover letter copied successfully'
    });
  };

  const handleSave = () => {
    toast({
      title: 'Cover letter saved',
      description: 'Your cover letter has been saved'
    });
    onOpenChange(false);
    reset();
  };

  const handleRegenerate = () => {
    setView('form');
    setCoverLetter(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setView('form');
      setSelectedResumeId('');
      setTone('professional');
      setNotes('');
      setEditedContent('');
      reset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Cover Letter with AI
          </DialogTitle>
        </DialogHeader>

        {/* Job Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold">{job.jobTitle}</h3>
              <p className="text-sm text-muted-foreground">{job.companyName}</p>
              <div className="flex gap-2">
                <Badge variant="secondary">{job.location}</Badge>
                <Badge variant="secondary">{job.workMode}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {view === 'form' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Resume</label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.name} {resume.isMaster && '(Master)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes (Optional)</label>
              <Textarea 
                placeholder="Any specific points you'd like to highlight or include..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!selectedResumeId}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Cover Letter
            </Button>
          </div>
        )}

        {view === 'processing' && (
          <AIProcessingIndicator message={progress.message} progress={progress.progress} />
        )}

        {view === 'results' && coverLetter && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Your Cover Letter</h3>
                <Badge variant="secondary">{tone}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {editedContent.length} characters
              </p>
            </div>

            <Textarea 
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleCopy} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleRegenerate} variant="outline">
                <RotateCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
