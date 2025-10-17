import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowLeft, CheckCircle2, AlertCircle, RotateCcw, Share2, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { useInterviews } from '@/hooks/useInterviews';
import { useInterviewsStore } from '@/store/interviewsStore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MockInterviewResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getMockResults, mockResults } = useInterviews();
  const { mockSession } = useInterviewsStore();
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId && !mockResults) {
      console.log('Fetching results for session:', sessionId);
      getMockResults(sessionId);
    }
  }, [sessionId, mockResults, getMockResults]);

  const handleRetry = () => {
    const interviewId = mockResults?.interviewId || mockSession?.interviewId;
    if (interviewId) {
      // Clear the current session and start a new one
      navigate(`/interviews/mock/${interviewId}`);
      window.location.reload(); // Force reload to start fresh
    } else {
      toast({
        title: 'Error',
        description: 'Could not find interview to retry',
        variant: 'destructive',
      });
    }
  };

  const handleShare = () => {
    // Copy results summary to clipboard
    const summary = `Mock Interview Results
Overall Score: ${mockResults?.overallScore}/100

Strengths:
${mockResults?.strengths.map(s => `• ${s}`).join('\n')}

Areas for Improvement:
${mockResults?.improvements.map(i => `• ${i}`).join('\n')}

Completed: ${mockResults?.completedAt ? format(new Date(mockResults.completedAt), 'MMM dd, yyyy') : 'N/A'}`;

    navigator.clipboard.writeText(summary).then(() => {
      toast({
        title: 'Results Copied!',
        description: 'Interview results have been copied to your clipboard',
      });
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to copy results',
        variant: 'destructive',
      });
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (!mockResults) {
    return (
      <div className="container py-8 max-w-5xl">
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => {
          const interviewId = mockResults?.interviewId || mockSession?.interviewId;
          if (interviewId) {
            navigate(`/interviews/${interviewId}`);
          }
        }}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Interview
      </Button>

      <div className="space-y-8">
        {/* Overall Score */}
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-32 w-32 relative">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - mockResults.overallScore / 100)}`}
                  className={cn('transition-all duration-1000', getScoreColor(mockResults.overallScore))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-3xl font-bold', getScoreColor(mockResults.overallScore))}>
                  {mockResults.overallScore}
                </span>
                <span className="text-xs text-muted-foreground">out of 100</span>
              </div>
            </div>
            <CardTitle className="text-2xl">
              {getScoreLabel(mockResults.overallScore)}
            </CardTitle>
            <CardDescription>
              Your mock interview performance
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3 justify-center">
            <Button onClick={handleRetry} size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry Interview
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockResults.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockResults.improvements.map((improvement, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Detailed Question Feedback */}
        {mockResults && mockResults.questionResults && mockResults.questionResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Question-by-Question Feedback</CardTitle>
              <CardDescription>
                Detailed analysis of each of your responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {mockResults.questionResults.map((result, i) => {
                  return (
                    <AccordionItem key={result.question.id} value={`item-${i}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="text-left font-normal">
                            <Badge variant="secondary" className="mr-2">
                              Q{i + 1}
                            </Badge>
                            {result.question.text}
                          </span>
                          <Badge className={cn(getScoreColor(result.response.score))}>
                            {result.response.score}/100
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Your Answer:</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {result.response.answer}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-sm font-semibold mb-2">Feedback:</h4>
                          <p className="text-sm whitespace-pre-wrap">
                            {result.response.feedback}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              What Worked
                            </h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              {result.response.strengths.map((strength, idx) => (
                                <li key={idx}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              To Improve
                            </h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              {result.response.improvements.map((improvement, idx) => (
                                <li key={idx}>• {improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* General Advice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              General Interview Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockResults.generalAdvice.map((advice, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-sm">{advice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
