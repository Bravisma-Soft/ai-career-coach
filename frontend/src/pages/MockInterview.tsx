import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, SkipForward, Timer, Brain, Sparkles } from 'lucide-react';
import { useInterviews } from '@/hooks/useInterviews';
import { useInterviewsStore } from '@/store/interviewsStore';
import { cn } from '@/lib/utils';
import { AIProcessingIndicator } from '@/components/ai/AIProcessingIndicator';

export default function MockInterview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { startMockInterviewAsync, submitMockAnswer } = useInterviews();
  const { mockSession, setMockSession } = useInterviewsStore();
  const [answer, setAnswer] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; content: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const initializeMockInterview = async () => {
      if (id && !mockSession && !isGenerating) {
        setIsGenerating(true);
        try {
          const session = await startMockInterviewAsync(id);
          console.log('Mock interview session created:', session);
          console.log('Questions:', session.questions);

          setMockSession(session);
          setIsGenerating(false);

          // Show first question
          if (session && session.questions && session.questions.length > 0) {
            setTimeout(() => {
              setMessages([
                {
                  role: 'ai',
                  content: `Welcome! Let's begin your mock interview. ${session.questions[0].text}`,
                },
              ]);
            }, 1000);
          } else {
            console.error('No questions found in session:', session);
          }
        } catch (error) {
          console.error('Failed to start mock interview:', error);
          setIsGenerating(false);
        }
      }
    };

    initializeMockInterview();
  }, [id, mockSession, startMockInterviewAsync, setMockSession, isGenerating]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitAnswer = () => {
    if (!answer.trim() || !mockSession) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: answer }]);
    const currentAnswer = answer;
    const currentQuestion = mockSession.questions[mockSession.currentQuestionIndex];
    setAnswer('');
    setIsTyping(true);

    // Submit answer and get feedback
    submitMockAnswer(
      { sessionId: mockSession.id, questionId: currentQuestion.id, answer: currentAnswer },
      {
        onSuccess: (response) => {
          // Add the response to the session
          const updatedSession = {
            ...mockSession,
            responses: [...mockSession.responses, response],
          };

          // Move to next question or finish
          const nextIndex = mockSession.currentQuestionIndex + 1;

          setTimeout(() => {
            setIsTyping(false);

            // Show AI feedback
            const feedbackMessage = `Score: ${response.score}/100\n\n${response.feedback}\n\n✓ Strengths:\n${response.strengths.map(s => `  • ${s}`).join('\n')}\n\n⚠ Areas to improve:\n${response.improvements.map(i => `  • ${i}`).join('\n')}`;

            setMessages((prev) => [
              ...prev,
              {
                role: 'ai',
                content: feedbackMessage,
              },
            ]);

            // Wait a bit before showing next question
            setTimeout(() => {
              if (nextIndex < mockSession.questions.length) {
                const nextQuestion = mockSession.questions[nextIndex];
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'ai',
                    content: `Next question: ${nextQuestion.text}`,
                  },
                ]);
                setMockSession({ ...updatedSession, currentQuestionIndex: nextIndex });
              } else {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'ai',
                    content: 'Excellent work! You have completed all the questions. Let me prepare your complete analysis...',
                  },
                ]);

                // Complete the interview
                setTimeout(() => {
                  navigate(`/interviews/mock/${mockSession.id}/results`);
                }, 2000);
              }
            }, 2000);
          }, 1500);
        },
        onError: (error) => {
          console.error('Failed to submit answer:', error);
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              role: 'ai',
              content: 'Sorry, there was an error processing your answer. Please try again.',
            },
          ]);
        },
      }
    );
  };

  const handleSkip = () => {
    if (!mockSession) return;
    
    const nextIndex = mockSession.currentQuestionIndex + 1;
    
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: '[Skipped question]' },
    ]);

    setTimeout(() => {
      if (nextIndex < mockSession.questions.length) {
        const nextQuestion = mockSession.questions[nextIndex];
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: `No problem. Let's move on to the next question: ${nextQuestion.text}`,
          },
        ]);
        setMockSession({ ...mockSession, currentQuestionIndex: nextIndex });
      } else {
        navigate(`/interviews/mock/${id}/results`);
      }
    }, 500);
  };

  const handleEndInterview = () => {
    if (!mockSession) return;

    if (confirm('Are you sure you want to end this mock interview? You can view your results for the questions you answered.')) {
      navigate(`/interviews/mock/${mockSession.id}/results`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGenerating || !mockSession) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[500px]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8">
              <AIProcessingIndicator
                message="Generating personalized interview questions..."
                submessage="This may take up to 30 seconds. We're analyzing the job description, company, and interviewer profile to create tailored questions."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = ((mockSession.currentQuestionIndex + 1) / mockSession.questions.length) * 100;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/interviews/${id}`)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Mock Interview</h1>
                <p className="text-sm text-muted-foreground">
                  Question {mockSession.currentQuestionIndex + 1} of {mockSession.questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4" />
                <span className="font-mono">{formatTime(elapsedTime)}</span>
              </div>
              <Button variant="outline" onClick={handleEndInterview}>
                End Interview
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <div className="container py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="min-h-[500px] flex flex-col">
              <CardContent className="flex-1 p-6 space-y-4 overflow-y-auto">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'ai' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-lg px-4 py-3 max-w-[80%]',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>
            </Card>

            {/* Input Area */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[120px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSubmitAnswer();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {answer.length} characters
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSkip}>
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip
                    </Button>
                    <Button onClick={handleSubmitAnswer} disabled={!answer.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Answer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-medium">
                      {mockSession.currentQuestionIndex + 1}/{mockSession.questions.length}
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">Tips</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Use the STAR method for behavioral questions</li>
                  <li>• Be specific with examples</li>
                  <li>• Take your time to think</li>
                  <li>• Ask for clarification if needed</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">Current Question</h3>
                <Badge variant="secondary" className="text-xs">
                  {mockSession.questions[mockSession.currentQuestionIndex].category}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
