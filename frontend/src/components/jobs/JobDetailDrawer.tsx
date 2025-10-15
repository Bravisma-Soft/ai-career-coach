import { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { Document } from '@/types/document';
import { TailoredResume } from '@/types/ai';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Link as LinkIcon,
  FileText,
  MessageSquare,
  Edit,
  Trash2,
  Sparkles,
  Download,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TailorResumeModal } from '@/components/ai/TailorResumeModal';
import { CoverLetterModal } from '@/components/ai/CoverLetterModal';
import { documentService } from '@/services/documentService';
import { toast } from '@/hooks/use-toast';
import { useResumes } from '@/hooks/useResumes';

interface JobDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  onEdit: () => void;
  onDelete: () => void;
}

const workModeColors: Record<Job['workMode'], string> = {
  REMOTE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  HYBRID: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ONSITE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export const JobDetailDrawer = ({ open, onClose, job, onEdit, onDelete }: JobDetailDrawerProps) => {
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedTailoredResume, setSelectedTailoredResume] = useState<TailoredResume | undefined>();

  // Load resumes for the tailor modal
  useResumes();

  // Fetch documents when job changes or modal opens
  useEffect(() => {
    if (job && open) {
      loadDocuments();
    }
  }, [job?.id, open]);

  const loadDocuments = async () => {
    if (!job) return;

    setLoadingDocuments(true);
    try {
      const docs = await documentService.getJobDocuments(job.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await documentService.deleteDocument(docId);
      setDocuments(docs => docs.filter(d => d.id !== docId));
      toast({
        title: 'Success',
        description: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const handleOpenTailoredResume = (doc: Document) => {
    try {
      // Parse the document content to reconstruct TailoredResume
      const tailoredContent = JSON.parse(doc.content || '{}');

      const tailoredResume: TailoredResume = {
        originalResumeId: doc.metadata?.originalResumeId || '',
        jobId: doc.jobId || job?.id || '',
        matchScore: doc.metadata?.matchScore || 0,
        tailoredContent: tailoredContent,
        keywordAlignment: {
          matched: doc.metadata?.keywordAlignment?.emphasized || [],
          missing: doc.metadata?.keywordAlignment?.added || [],
        },
        recommendations: doc.metadata?.recommendations || [],
        changes: doc.metadata?.changes || [],
      };

      setSelectedTailoredResume(tailoredResume);
      setShowTailorModal(true);
    } catch (error) {
      console.error('Error parsing tailored resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tailored resume',
        variant: 'destructive'
      });
    }
  };

  if (!job) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl">{job.company}</SheetTitle>
              <SheetDescription className="text-lg mt-1">{job.title}</SheetDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={cn('text-sm', workModeColors[job.workMode])}>
              {job.workMode}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Briefcase className="h-3 w-3 mr-1" />
              {job.jobType}
            </Badge>
            {job.matchScore && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {job.matchScore}% match
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Applied: {job.appliedAt ? new Date(job.appliedAt).toLocaleDateString() : 'Not Applied'}</span>
            </div>
            {job.salaryRange && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{job.salaryRange}</span>
              </div>
            )}
            {job.jobUrl && (
              <div className="flex items-center gap-2 text-sm">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  View Job Posting
                </a>
              </div>
            )}
          </div>

          <Separator />

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.jobDescription || 'No description provided'}
                  </p>
                </CardContent>
              </Card>

              {job.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.notes}</p>
                  </CardContent>
                </Card>
              )}

              {job.applicationDeadline && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Deadline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="application" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application Status</CardTitle>
                  <CardDescription>Track your application progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Status</span>
                    <Badge className="capitalize">{job.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Applied Date</span>
                    <span className="text-sm">{job.appliedAt ? new Date(job.appliedAt).toLocaleDateString() : 'Not Applied'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Updated</span>
                    <span className="text-sm">{new Date(job.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    setSelectedTailoredResume(undefined);
                    setShowTailorModal(true);
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tailor Resume with AI
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowCoverLetterModal(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Cover Letter
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="interview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Interview Preparation</CardTitle>
                  <CardDescription>Get ready for your interview</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    No interview scheduled yet. Once you schedule an interview, you can prepare here.
                  </p>
                  <Button variant="outline" className="w-full">
                    Schedule Interview
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Documents</CardTitle>
                  <CardDescription>Tailored resumes, cover letters, and other files</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingDocuments ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        No documents yet. Tailor a resume for this job to get started.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedTailoredResume(undefined);
                          setShowTailorModal(true);
                        }}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Tailor Resume
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={cn(
                            "flex items-start justify-between p-3 border rounded-lg transition-colors",
                            doc.documentType === 'RESUME' && "cursor-pointer hover:bg-accent hover:border-primary/50",
                            doc.documentType !== 'RESUME' && "hover:bg-accent/50"
                          )}
                          onClick={() => {
                            if (doc.documentType === 'RESUME') {
                              handleOpenTailoredResume(doc);
                            }
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                              <Badge variant="secondary" className="ml-auto flex-shrink-0">
                                {doc.documentType}
                              </Badge>
                            </div>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
                            )}
                            {doc.metadata?.matchScore && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                  {doc.metadata.matchScore}% match
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(doc.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {doc.documentType === 'RESUME' && (
                              <p className="text-xs text-primary mt-1">Click to view details</p>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            {doc.documentType !== 'RESUME' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Download or view document
                                  if (doc.content) {
                                    const blob = new Blob([doc.content], { type: doc.mimeType });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = doc.fileName;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedTailoredResume(undefined);
                          setShowTailorModal(true);
                        }}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Tailor Another Resume
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>

    <TailorResumeModal
      job={job}
      open={showTailorModal}
      onOpenChange={(open) => {
        setShowTailorModal(open);
        // Clear selected tailored resume when modal closes
        if (!open) {
          setSelectedTailoredResume(undefined);
        }
      }}
      onSaveComplete={loadDocuments}
      existingTailoredResume={selectedTailoredResume}
    />

    <CoverLetterModal 
      job={job}
      open={showCoverLetterModal}
      onOpenChange={setShowCoverLetterModal}
    />
    </>
  );
};
