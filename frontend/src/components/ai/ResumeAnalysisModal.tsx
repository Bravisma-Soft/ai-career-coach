import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Loader2,
  Target,
  Award,
  FileText,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { Resume } from '@/types/resume';
import { ResumeAnalysis } from '@/types/ai';
import { aiService } from '@/services/aiService';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ResumeAnalysisModalProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResumeAnalysisModal({ resume, open, onOpenChange }: ResumeAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');

  // Fetch analysis when modal opens
  useEffect(() => {
    if (open && resume) {
      loadAnalysis();
    }
  }, [open, resume]);

  const loadAnalysis = async () => {
    if (!resume) return;

    setIsLoading(true);
    try {
      const data = await aiService.getResumeAnalysis(resume.id);
      setAnalysis(data);
      if (data) {
        setTargetRole(data.targetRole || '');
        setTargetIndustry(data.targetIndustry || '');
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resume analysis',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!resume) return;

    setIsAnalyzing(true);
    try {
      const data = await aiService.analyzeResume(
        resume.id,
        targetRole || undefined,
        targetIndustry || undefined
      );
      setAnalysis(data);
      toast({
        title: 'Analysis complete',
        description: 'Your resume has been re-analyzed successfully',
      });
    } catch (error: any) {
      console.error('Failed to analyze resume:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'Failed to analyze resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4" />;
      case 'low':
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (!resume) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Resume Analysis - {resume.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading analysis...</span>
          </div>
        ) : !analysis ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Analysis Available</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              This resume hasn't been analyzed yet. Analysis runs automatically after parsing, but you can also trigger it manually.
            </p>
            <div className="w-full max-w-md space-y-3">
              <Input
                placeholder="Target role (optional)"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
              <Input
                placeholder="Target industry (optional)"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
              />
              <Button onClick={handleReanalyze} disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Re-analyze Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Re-analyze for Specific Role</CardTitle>
                  <CardDescription>
                    Optionally specify a target role and industry for more tailored feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Target role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                    <Input
                      placeholder="Target industry"
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleReanalyze} disabled={isAnalyzing} className="w-full">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Re-analyzing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Re-analyze Resume
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Overall Scores */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Award className="h-8 w-8 mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                      <p className={cn('text-3xl font-bold', getScoreColor(analysis.overallScore))}>
                        {analysis.overallScore}
                      </p>
                      <Progress value={analysis.overallScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Target className="h-8 w-8 mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">ATS Score</p>
                      <p className={cn('text-3xl font-bold', getScoreColor(analysis.atsScore))}>
                        {analysis.atsScore}
                      </p>
                      <Progress value={analysis.atsScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">Readability</p>
                      <p className={cn('text-3xl font-bold', getScoreColor(analysis.readabilityScore))}>
                        {analysis.readabilityScore}
                      </p>
                      <Progress value={analysis.readabilityScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Weaknesses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Tabbed Content */}
              <Tabs defaultValue="suggestions" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="ats">ATS Issues</TabsTrigger>
                </TabsList>

                {/* Suggestions Tab */}
                <TabsContent value="suggestions" className="space-y-4 mt-4">
                  {analysis.suggestions
                    .sort((a, b) => {
                      const priorityOrder = { high: 0, medium: 1, low: 2 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((suggestion, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{suggestion.issue}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant={getPriorityColor(suggestion.priority)} className="gap-1">
                                  {getPriorityIcon(suggestion.priority)}
                                  {suggestion.priority.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{suggestion.section}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-2">💡 Suggestion:</p>
                            <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Example:</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Badge variant="destructive" className="text-xs">Before</Badge>
                                <p className="text-xs bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200 dark:border-red-900">
                                  {suggestion.example.before}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Badge className="text-xs bg-green-600">After</Badge>
                                <p className="text-xs bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-900">
                                  {suggestion.example.after}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                            <p className="text-xs text-blue-900 dark:text-blue-100">
                              <strong>Impact:</strong> {suggestion.impact}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>

                {/* Sections Tab */}
                <TabsContent value="sections" className="space-y-4 mt-4">
                  {Object.entries(analysis.sections).map(([sectionName, section]) => (
                    <Card key={sectionName}>
                      <CardHeader>
                        <CardTitle className="text-base capitalize flex items-center justify-between">
                          <span>{sectionName}</span>
                          {section.score !== null && (
                            <span className={cn('text-2xl font-bold', getScoreColor(section.score))}>
                              {section.score}
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{section.feedback}</p>
                        {section.issues.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium mb-2">Issues:</p>
                              <ul className="space-y-1">
                                {section.issues.map((issue, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <span>{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Keywords Tab */}
                <TabsContent value="keywords" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Target Role & Industry</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-sm">
                          {analysis.keywordAnalysis.targetRole}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          {analysis.keywordAnalysis.targetIndustry}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Matched Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordAnalysis.matchedKeywords.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="bg-green-100 dark:bg-green-950">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-yellow-600" />
                        Missing Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordAnalysis.missingKeywords.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="border-yellow-600 text-yellow-600">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        Overused Words
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordAnalysis.overusedWords.map((word, i) => (
                          <Badge key={i} variant="destructive">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ATS Issues Tab */}
                <TabsContent value="ats" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        ATS Compatibility Issues
                      </CardTitle>
                      <CardDescription>
                        These issues may prevent applicant tracking systems from properly parsing your resume
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analysis.atsIssues.length === 0 ? (
                        <div className="text-center py-6 text-green-600">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                          <p className="font-medium">No ATS issues found!</p>
                          <p className="text-sm text-muted-foreground">Your resume should parse well in most ATS systems</p>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {analysis.atsIssues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900">
                              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Analysis Metadata */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Last analyzed: {new Date(analysis.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
