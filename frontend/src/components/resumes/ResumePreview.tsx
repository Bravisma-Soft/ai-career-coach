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
          {/* Resume Preview */}
          <div className="bg-background rounded-lg shadow-lg max-w-2xl mx-auto p-8 space-y-6">
            {resume.personalInfo || resume.experience || resume.education || resume.skills ? (
              // Parsed resume data preview
              <div className="space-y-6">
                {/* Personal Info */}
                {resume.personalInfo && (
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{resume.personalInfo.fullName}</h1>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {resume.personalInfo.email && <span>{resume.personalInfo.email}</span>}
                      {resume.personalInfo.phone && <span>•</span>}
                      {resume.personalInfo.phone && <span>{resume.personalInfo.phone}</span>}
                      {resume.personalInfo.location && <span>•</span>}
                      {resume.personalInfo.location && <span>{resume.personalInfo.location}</span>}
                    </div>
                    {(resume.personalInfo.linkedin || resume.personalInfo.website) && (
                      <div className="flex flex-wrap gap-3 text-sm">
                        {resume.personalInfo.linkedin && (
                          <a href={resume.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            LinkedIn
                          </a>
                        )}
                        {resume.personalInfo.website && (
                          <a href={resume.personalInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Website
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                {resume.summary && (
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold border-b pb-1">Summary</h2>
                    <p className="text-sm">{resume.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {resume.experience && resume.experience.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold border-b pb-1">Experience</h2>
                    {resume.experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{exp.position}</h3>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                          </div>
                          <div className="text-sm text-muted-foreground text-right">
                            <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                            {exp.location && <p>{exp.location}</p>}
                          </div>
                        </div>
                        {exp.description && exp.description.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {exp.description.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {resume.education && resume.education.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold border-b pb-1">Education</h2>
                    {resume.education.map((edu) => (
                      <div key={edu.id} className="space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          </div>
                          <div className="text-sm text-muted-foreground text-right">
                            <p>{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</p>
                            {edu.gpa && <p>GPA: {edu.gpa}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {resume.skills && resume.skills.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold border-b pb-1">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : resume.rawText ? (
              // Raw text fallback if no parsed data
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm">{resume.rawText}</pre>
              </div>
            ) : (
              // No data available
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center space-y-4">
                  <FileText className="h-24 w-24 mx-auto opacity-50" />
                  <p className="text-lg font-medium">No Preview Available</p>
                  <p className="text-sm">
                    This resume hasn't been parsed yet. Click "Parse Resume" to extract data.
                  </p>
                </div>
              </div>
            )}
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
