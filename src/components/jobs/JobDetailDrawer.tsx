import { useState } from 'react';
import { Job } from '@/types/job';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TailorResumeModal } from '@/components/ai/TailorResumeModal';
import { CoverLetterModal } from '@/components/ai/CoverLetterModal';

interface JobDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  onEdit: () => void;
  onDelete: () => void;
}

const workModeColors: Record<Job['workMode'], string> = {
  remote: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  hybrid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  onsite: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export const JobDetailDrawer = ({ open, onClose, job, onEdit, onDelete }: JobDetailDrawerProps) => {
  const [showTailorModal, setShowTailorModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  
  if (!job) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl">{job.companyName}</SheetTitle>
              <SheetDescription className="text-lg mt-1">{job.jobTitle}</SheetDescription>
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
              <span>Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
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
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
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
                    <span className="text-sm">{new Date(job.appliedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Updated</span>
                    <span className="text-sm">{new Date(job.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button variant="hero" className="w-full" onClick={() => setShowTailorModal(true)}>
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
                  <CardDescription>Resumes, cover letters, and other files</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    No documents uploaded yet. Add your resume, cover letter, or other relevant documents.
                  </p>
                  <Button variant="outline" className="w-full">
                    Upload Document
                  </Button>
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
      onOpenChange={setShowTailorModal}
    />

    <CoverLetterModal 
      job={job}
      open={showCoverLetterModal}
      onOpenChange={setShowCoverLetterModal}
    />
    </>
  );
};
