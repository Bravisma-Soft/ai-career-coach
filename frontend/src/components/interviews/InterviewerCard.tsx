import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Briefcase, ExternalLink, Sparkles } from 'lucide-react';
import { Interviewer } from '@/types/interview';

interface InterviewerCardProps {
  interviewers: Interviewer[];
  aiBackground?: string;
}

export function InterviewerCard({ interviewers, aiBackground }: InterviewerCardProps) {
  if (!interviewers || interviewers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {interviewers.length === 1 ? 'Interviewer' : 'Interviewers'}
        </CardTitle>
        <CardDescription>
          Learn about who will be interviewing you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {interviewers.map((interviewer, index) => (
          <div key={index}>
            {index > 0 && <Separator className="my-4" />}

            <div className="space-y-3">
              {/* Interviewer Basic Info */}
              <div>
                <h3 className="font-semibold text-lg">{interviewer.name}</h3>
                {interviewer.title && (
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {interviewer.title}
                    </span>
                  </div>
                )}
              </div>

              {/* LinkedIn Profile Link */}
              {interviewer.linkedInUrl && (
                <a
                  href={interviewer.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  View LinkedIn Profile
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {/* AI-Generated Background (if available for this interviewer) */}
              {interviewer.background && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">AI Research</span>
                    <Badge variant="secondary" className="text-xs">
                      Beta
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {interviewer.background}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* General AI Background (for all interviewers) */}
        {aiBackground && (
          <div className="mt-4">
            <Separator className="mb-4" />
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">AI-Generated Interview Insights</h4>
                <Badge variant="secondary" className="text-xs">
                  Beta
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                {aiBackground.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && <p key={idx}>{paragraph}</p>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Based on publicly available information and LinkedIn profiles.
                Please verify details independently.
              </p>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {interviewers.some(i => i.title) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <h4 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
              💡 Interview Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5">
              {interviewers.map((interviewer, idx) => {
                if (!interviewer.title) return null;

                const title = interviewer.title.toLowerCase();
                let tip = '';

                if (title.includes('engineer') || title.includes('technical')) {
                  tip = `Expect technical depth questions from ${interviewer.name || 'the interviewer'}. Be ready to discuss specific technologies and problem-solving approaches.`;
                } else if (title.includes('manager') || title.includes('lead')) {
                  tip = `${interviewer.name || 'This interviewer'} will likely focus on collaboration, communication, and how you work in teams.`;
                } else if (title.includes('director') || title.includes('vp') || title.includes('ceo')) {
                  tip = `Prepare to discuss strategic thinking, impact, and how you align with company vision when talking to ${interviewer.name || 'senior leadership'}.`;
                } else if (title.includes('recruiter') || title.includes('hr')) {
                  tip = `${interviewer.name || 'The recruiter'} will assess cultural fit and motivation. Be authentic and ask questions about company culture.`;
                } else {
                  tip = `Research ${interviewer.name}'s background and prepare relevant questions for their role.`;
                }

                return <li key={idx} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{tip}</span>
                </li>;
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
