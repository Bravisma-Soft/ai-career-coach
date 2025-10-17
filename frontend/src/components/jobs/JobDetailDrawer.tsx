import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job } from '@/types/job';
import { Document } from '@/types/document';
import { Interview } from '@/types/interview';
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
  Clock,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TailorResumeModal } from '@/components/ai/TailorResumeModal';
import { CoverLetterModal } from '@/components/ai/CoverLetterModal';
import { CoverLetterViewer } from '@/components/ai/CoverLetterViewer';
import { documentService } from '@/services/documentService';
import { interviewService } from '@/services/interviewService';
import { toast } from '@/hooks/use-toast';
import { useResumes } from '@/hooks/useResumes';
import { generateResumePDF } from '@/utils/pdfGenerator';

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
  const navigate = useNavigate();
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [showCoverLetterViewer, setShowCoverLetterViewer] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [selectedTailoredResume, setSelectedTailoredResume] = useState<TailoredResume | undefined>();
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<{
    content: string;
    metadata: any;
    title: string;
  } | null>(null);

  // Load resumes for the tailor modal
  useResumes();

  // Fetch documents and interviews when job changes or modal opens
  useEffect(() => {
    if (job && open) {
      loadDocuments();
      loadInterviews();
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

  const loadInterviews = async () => {
    if (!job) return;

    setLoadingInterviews(true);
    try {
      const jobInterviews = await interviewService.getInterviewsByJob(job.id);
      setInterviews(jobInterviews);
    } catch (error) {
      console.error('Error loading interviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load interviews',
        variant: 'destructive'
      });
    } finally {
      setLoadingInterviews(false);
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
      toast({
        title: 'Error',
        description: 'Failed to load tailored resume',
        variant: 'destructive'
      });
    }
  };

  const handleOpenCoverLetter = (doc: Document) => {
    try {
      setSelectedCoverLetter({
        content: doc.content || '',
        metadata: doc.metadata || {},
        title: doc.title,
      });
      setShowCoverLetterViewer(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load cover letter',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadResumePDF = (doc: Document) => {
    try {
      console.log('📄 handleDownloadResumePDF called for document:', doc.title);

      // Parse the tailored resume content
      const resumeContent = JSON.parse(doc.content || '{}');
      console.log('✅ Resume content parsed successfully');

      // Generate a clean filename
      const fileName = `${doc.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`;

      // Generate and download PDF
      console.log('🎨 Calling generateResumePDF...');
      generateResumePDF(resumeContent, fileName);

      toast({
        title: 'PDF Downloaded',
        description: `${doc.title} has been downloaded`
      });
    } catch (error) {
      console.error('❌ Error generating resume PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
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
                  <CardTitle className="text-lg">Scheduled Interviews</CardTitle>
                  <CardDescription>Manage and prepare for your interviews</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingInterviews ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading interviews...</p>
                    </div>
                  ) : interviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        No interviews scheduled yet for this position.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          onClose();
                          navigate('/interviews');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Interview
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {interviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            onClose();
                            navigate(`/interviews/${interview.id}`);
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline">{interview.type}</Badge>
                              <Badge
                                variant={interview.status === 'PENDING' ? 'default' : 'secondary'}
                              >
                                {interview.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(interview.date), 'MMM dd, yyyy')}</span>
                              <Clock className="h-4 w-4 ml-2" />
                              <span>{format(new Date(interview.date), 'h:mm a')}</span>
                            </div>
                            {interview.interviewer && (
                              <p className="text-sm mt-1">
                                with {interview.interviewer.name}
                                {interview.interviewer.title && ` (${interview.interviewer.title})`}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => {
                          onClose();
                          navigate('/interviews');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Another Interview
                      </Button>
                    </div>
                  )}
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
                            (doc.documentType === 'RESUME' || doc.documentType === 'COVER_LETTER') && "cursor-pointer hover:bg-accent hover:border-primary/50",
                            doc.documentType !== 'RESUME' && doc.documentType !== 'COVER_LETTER' && "hover:bg-accent/50"
                          )}
                          onClick={() => {
                            if (doc.documentType === 'RESUME') {
                              handleOpenTailoredResume(doc);
                            } else if (doc.documentType === 'COVER_LETTER') {
                              handleOpenCoverLetter(doc);
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle download based on document type
                                if (doc.documentType === 'RESUME') {
                                  handleDownloadResumePDF(doc);
                                } else if (doc.content) {
                                  // Download other document types as-is
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
      onSaveComplete={loadDocuments}
    />

    {selectedCoverLetter && (
      <CoverLetterViewer
        open={showCoverLetterViewer}
        onOpenChange={setShowCoverLetterViewer}
        coverLetterContent={selectedCoverLetter.content}
        metadata={selectedCoverLetter.metadata}
        title={selectedCoverLetter.title}
      />
    )}
    </>
  );
};
