import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Download, Edit, FileCheck } from 'lucide-react';
import { Job } from '@/types/job';
import { useResumesStore } from '@/store/resumesStore';
import { useAIStore } from '@/store/aiStore';
import { aiService } from '@/services/aiService';
import { AIProcessingIndicator } from './AIProcessingIndicator';
import { ResumeComparison } from './ResumeComparison';
import { toast } from '@/hooks/use-toast';

interface TailorResumeModalProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TailorResumeModal({ job, open, onOpenChange }: TailorResumeModalProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [view, setView] = useState<'select' | 'processing' | 'results'>('select');
  
  const { resumes } = useResumesStore();
  const { 
    isProcessing, 
    tailoredResume, 
    progress, 
    setProcessing, 
    setTailoredResume, 
    setProgress, 
    setError,
    reset 
  } = useAIStore();

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  const handleAnalyze = async () => {
    if (!selectedResume) {
      toast({
        title: 'No resume selected',
        description: 'Please select a resume to tailor',
        variant: 'destructive'
      });
      return;
    }

    setView('processing');
    setProcessing('tailoring');

    try {
      const result = await aiService.tailorResume(
        selectedResume,
        job,
        (message, progressValue) => setProgress({ message, progress: progressValue })
      );
      
      setTailoredResume(result);
      setView('results');
      toast({
        title: 'Resume tailored successfully!',
        description: `Match score: ${result.matchScore}%`
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to tailor resume');
      toast({
        title: 'Error',
        description: 'Failed to tailor resume. Please try again.',
        variant: 'destructive'
      });
      setView('select');
    }
  };

  const handleSave = () => {
    toast({
      title: 'Resume saved',
      description: 'Your tailored resume has been saved to your resumes'
    });
    onOpenChange(false);
    reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setView('select');
      setSelectedResumeId('');
      reset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tailor Resume with AI
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

        {view === 'select' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Resume</label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume to tailor" />
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

            <Button 
              onClick={handleAnalyze} 
              disabled={!selectedResumeId || isProcessing}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze & Tailor Resume
            </Button>
          </div>
        )}

        {view === 'processing' && (
          <AIProcessingIndicator message={progress.message} progress={progress.progress} />
        )}

        {view === 'results' && tailoredResume && selectedResume && (
          <div className="space-y-6">
            {/* Match Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Match Score</h3>
                    <p className="text-sm text-muted-foreground">How well your resume matches this job</p>
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {tailoredResume.matchScore}%
                  </div>
                </div>
                <Progress value={tailoredResume.matchScore} className="h-3" />
              </CardContent>
            </Card>

            {/* Keyword Alignment */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Matched Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {tailoredResume.keywordAlignment.matched.map((keyword) => (
                      <Badge key={keyword} variant="default">{keyword}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {tailoredResume.keywordAlignment.missing.map((keyword) => (
                      <Badge key={keyword} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {tailoredResume.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Comparison */}
            <div>
              <h3 className="font-semibold mb-4">Side-by-Side Comparison</h3>
              <ResumeComparison original={selectedResume} tailored={tailoredResume} />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1">
                <FileCheck className="h-4 w-4 mr-2" />
                Save Tailored Resume
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Further
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
