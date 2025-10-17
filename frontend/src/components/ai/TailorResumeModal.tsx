import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Download, Edit, FileCheck } from 'lucide-react';
import { Job } from '@/types/job';
import { TailoredResume } from '@/types/ai';
import { useResumesStore } from '@/store/resumesStore';
import { useAIStore } from '@/store/aiStore';
import { aiService } from '@/services/aiService';
import { documentService } from '@/services/documentService';
import { resumeService } from '@/services/resumeService';
import { AIProcessingIndicator } from './AIProcessingIndicator';
import { ResumeComparison } from './ResumeComparison';
import { toast } from '@/hooks/use-toast';
import { generateResumePDF } from '@/utils/pdfGenerator';

interface TailorResumeModalProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveComplete?: () => void;
  existingTailoredResume?: TailoredResume; // Pre-loaded tailored resume data
}

export function TailorResumeModal({ job, open, onOpenChange, onSaveComplete, existingTailoredResume }: TailorResumeModalProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [view, setView] = useState<'select' | 'processing' | 'results'>('select');
  const navigate = useNavigate();

  const { resumes, addResume } = useResumesStore();
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

  // Load existing tailored resume when modal opens with existing data
  useEffect(() => {
    if (open && existingTailoredResume) {
      setTailoredResume(existingTailoredResume);
      setView('results');
      // Set the selected resume ID from the existing data
      if (existingTailoredResume.originalResumeId) {
        setSelectedResumeId(existingTailoredResume.originalResumeId);
      }
    }
  }, [open, existingTailoredResume]);

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

  const handleSave = async () => {
    if (!tailoredResume || !selectedResume) return;

    try {
      // Save as a document linked to this job
      await documentService.createDocument({
        jobId: job.id,
        documentType: 'RESUME',
        title: `Tailored Resume - ${job.company} ${job.title}`,
        fileName: `tailored-${selectedResume.name}-${Date.now()}.json`,
        fileUrl: 'data:application/json;base64,' + btoa(JSON.stringify(tailoredResume.tailoredContent)),
        fileSize: JSON.stringify(tailoredResume.tailoredContent).length,
        mimeType: 'application/json',
        description: `AI-tailored resume for ${job.company} - ${job.title}. Match score: ${tailoredResume.matchScore}%`,
        content: JSON.stringify(tailoredResume.tailoredContent, null, 2),
        metadata: {
          matchScore: tailoredResume.matchScore,
          originalResumeId: selectedResume.id,
          tailoredForJob: job.id,
          keywordAlignment: tailoredResume.keywordAlignment,
          recommendations: tailoredResume.recommendations,
          changes: tailoredResume.changes,
        },
      });

      toast({
        title: 'Resume saved',
        description: `Your tailored resume has been saved to the job's Documents tab`
      });

      // Call the callback to reload documents
      if (onSaveComplete) {
        onSaveComplete();
      }

      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save tailored resume. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      // Only reset if not viewing an existing tailored resume
      if (!existingTailoredResume) {
        setView('select');
        setSelectedResumeId('');
        reset();
      } else {
        // For existing tailored resumes, just reset the view
        setView('results');
      }
    }, 300);
  };

  const handleEditFurther = async () => {
    if (!tailoredResume) return;

    try {
      // Prepare the resume data with proper structure - keep arrays as arrays!
      const resumeName = `Tailored - ${job.company}`;

      const resumeData = {
        name: resumeName,
        personalInfo: tailoredResume.tailoredContent.personalInfo,
        summary: tailoredResume.tailoredContent.summary,
        experience: tailoredResume.tailoredContent.experience, // Keep as array with description arrays
        education: tailoredResume.tailoredContent.education,
        skills: tailoredResume.tailoredContent.skills,
      };

      const jsonString = JSON.stringify(resumeData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], `tailored-${Date.now()}.json`, { type: 'application/json' });

      // Upload as new resume
      toast({
        title: 'Creating editable resume...',
        description: 'Please wait while we prepare your resume for editing'
      });

      let newResume = await resumeService.uploadResume({
        name: resumeName,
        type: 'tailored',
        file: file,
      });

      // Now update the resume with parsed data so it's immediately editable
      const updatedResume = await resumeService.updateResume(newResume.id, {
        name: resumeName,
        personalInfo: tailoredResume.tailoredContent.personalInfo,
        summary: tailoredResume.tailoredContent.summary,
        experience: tailoredResume.tailoredContent.experience,
        education: tailoredResume.tailoredContent.education,
        skills: tailoredResume.tailoredContent.skills,
      });

      toast({
        title: 'Resume created',
        description: 'Your tailored resume is ready for editing. Opening editor...'
      });

      // Close modal first
      onOpenChange(false);

      // Wait a bit longer to ensure the resume is saved and fetchable from API
      setTimeout(() => {
        // Add the UPDATED resume (with parsed data) to the store right before navigating
        addResume(updatedResume);

        // Navigate with both the resume object and ID
        navigate('/resumes', {
          state: {
            openEditorForResumeId: updatedResume.id,
            newResume: updatedResume // Pass the actual resume object too
          }
        });
      }, 800);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || error?.message || 'Failed to create editable resume. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!tailoredResume) return;

    try {
      const fileName = `tailored-resume-${job.company.replace(/\s+/g, '-')}-${Date.now()}.pdf`;

      // Generate professional PDF using shared utility
      generateResumePDF(tailoredResume.tailoredContent, fileName);

      toast({
        title: 'PDF Downloaded Successfully',
        description: `Your professional resume has been downloaded as ${fileName}`
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      });
    }
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
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
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
              {!existingTailoredResume && (
                <Button onClick={handleSave} className="flex-1">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Save Tailored Resume
                </Button>
              )}
              <Button onClick={handleEditFurther} variant="outline" className={existingTailoredResume ? 'flex-1' : ''}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Further
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" className={existingTailoredResume ? 'flex-1' : ''}>
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
