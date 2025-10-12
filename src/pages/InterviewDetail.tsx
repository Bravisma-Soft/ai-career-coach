import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Play, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useInterviews } from '@/hooks/useInterviews';
import { useInterviewsStore } from '@/store/interviewsStore';
import { AIProcessingIndicator } from '@/components/ai/AIProcessingIndicator';

export default function InterviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { interviews, prepareInterview, isPreparing, preparationData } = useInterviews();
  const { selectedInterview, setSelectedInterview } = useInterviewsStore();
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const interview = interviews.find((i) => i.id === id);
    if (interview) {
      setSelectedInterview(interview);
      setNotes(interview.notes || '');
    }
  }, [id, interviews, setSelectedInterview]);

  if (!selectedInterview) {
    return (
      <div className="container py-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  const handlePrepare = () => {
    if (id) {
      prepareInterview(id);
    }
  };

  const handleStartMock = () => {
    navigate(`/interviews/mock/${id}`);
  };

  return (
    <div className="container py-8 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/interviews')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Interviews
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{selectedInterview.companyName}</h1>
          <p className="text-xl text-muted-foreground mt-1">
            {selectedInterview.jobTitle}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {selectedInterview.status}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preparation">Preparation</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(selectedInterview.date), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(selectedInterview.date), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedInterview.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedInterview.duration} minutes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={selectedInterview.locationOrLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Meeting Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedInterview.interviewer?.name && (
            <Card>
              <CardHeader>
                <CardTitle>Interviewer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedInterview.interviewer.name}</span>
                </div>
                {selectedInterview.interviewer.title && (
                  <p className="text-sm text-muted-foreground ml-6">
                    {selectedInterview.interviewer.title}
                  </p>
                )}
                {selectedInterview.interviewer.linkedInUrl && (
                  <a
                    href={selectedInterview.interviewer.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 ml-6"
                  >
                    View LinkedIn Profile <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preparation" className="space-y-6">
          {isPreparing ? (
            <AIProcessingIndicator
              message="Preparing interview materials..."
              progress={60}
            />
          ) : preparationData ? (
            <>
              {preparationData.interviewerBackground && (
                <Card>
                  <CardHeader>
                    <CardTitle>Interviewer Background</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{preparationData.interviewerBackground}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Common Interview Questions</CardTitle>
                  <CardDescription>
                    Practice these questions before your interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {preparationData.questions.map((q, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{i + 1}.</span> {q}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Questions to Ask</CardTitle>
                  <CardDescription>
                    Show your interest by asking thoughtful questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {preparationData.questionsToAsk.map((q, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Button onClick={handleStartMock} className="w-full" size="lg">
                <Play className="h-4 w-4 mr-2" />
                Start Mock Interview
              </Button>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Interview Preparation</CardTitle>
                <CardDescription>
                  Get AI-powered interview preparation including common questions and
                  researched interviewer background
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handlePrepare} className="w-full">
                  Research Interviewer & Generate Questions
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Notes</CardTitle>
              <CardDescription>
                Keep track of important details and talking points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                className="min-h-[300px]"
              />
              <Button className="mt-4">Save Notes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
