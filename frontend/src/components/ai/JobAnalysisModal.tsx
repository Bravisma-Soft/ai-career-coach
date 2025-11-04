import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Loader2,
  Target,
  Award,
  Briefcase,
  Lightbulb,
  DollarSign,
  Users,
  MapPin,
} from 'lucide-react';
import { Job } from '@/types/job';
import { Resume } from '@/types/resume';
import { JobAnalysis } from '@/types/ai';
import { aiService } from '@/services/aiService';
import { resumeService } from '@/services/resumeService';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface JobAnalysisModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalysisComplete?: () => void;
}

export function JobAnalysisModal({ job, open, onOpenChange, onAnalysisComplete }: JobAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('none');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);

  // Clear analysis state when job changes or modal closes
  useEffect(() => {
    if (!open) {
      // Only clear when modal closes
      setAnalysis(null);
      setSelectedResumeId('none');
      setIsLoading(false);
    }
  }, [open]);

  // Fetch resumes and check for existing analysis when modal opens or job changes
  useEffect(() => {
    if (open && job) {
      // Clear previous job's data when job changes
      setAnalysis(null);
      setSelectedResumeId('none');

      const initializeModal = async () => {
        await loadResumes();
        await loadExistingAnalysis();
      };
      initializeModal();
    }
  }, [open, job?.id]);

  const loadResumes = async () => {
    setIsLoadingResumes(true);
    try {
      const data = await resumeService.fetchResumes();
      // Only show parsed resumes (check if personalInfo exists and has fullName)
      const parsedResumes = data.filter((r: Resume) => {
        return r.personalInfo && typeof r.personalInfo === 'object' && r.personalInfo.fullName;
      });
      console.log('[JobAnalysisModal] Loaded resumes:', {
        total: data.length,
        parsed: parsedResumes.length,
        resumes: parsedResumes.map(r => ({ id: r.id, name: r.name, hasPersonalInfo: !!r.personalInfo }))
      });
      setResumes(parsedResumes);
    } catch (error: any) {
      console.error('Failed to load resumes:', error);
      toast({
        title: 'Failed to load resumes',
        description: error.message || 'Could not load your resumes',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const loadExistingAnalysis = async () => {
    if (!job) return;

    setIsLoading(true);
    try {
      const existingAnalysis = await aiService.getJobAnalysis(job.id);
      if (existingAnalysis) {
        console.log('[JobAnalysisModal] Found existing analysis:', existingAnalysis);
        setAnalysis(existingAnalysis);
        // Pre-select the resume used in cached analysis
        if (existingAnalysis.resumeId) {
          console.log('[JobAnalysisModal] Setting selected resume to:', existingAnalysis.resumeId);
          setSelectedResumeId(existingAnalysis.resumeId);
        } else {
          console.log('[JobAnalysisModal] No resumeId in analysis, keeping default "none"');
        }
      } else {
        console.log('[JobAnalysisModal] No existing analysis found');
      }
    } catch (error: any) {
      console.error('[JobAnalysisModal] Error loading existing analysis:', error);
      // Don't show error toast - just means no analysis exists yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (resumeId?: string) => {
    if (!job) return;

    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeJob(job.id, resumeId);
      setAnalysis(result);

      toast({
        title: 'Analysis Complete',
        description: 'Job analysis has been saved and will be available next time you open this job',
      });

      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } catch (error: any) {
      console.error('Failed to analyze job:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze job',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRoleLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      entry: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      mid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      senior: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      lead: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      executive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Analysis: {job.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {job.company} • {job.location}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Loading State - Checking for existing analysis */}
            {isLoading && !analysis && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Checking for existing analysis...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Controls - Show form if no analysis and not loading */}
            {!analysis && !isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>Analyze this Job</CardTitle>
                  <CardDescription>
                    Get AI-powered insights about this role{resumes.length > 0 && ', optionally match against your resume'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resumes.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Match with Resume (Optional)</label>
                      <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a resume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No resume - analyze job only</SelectItem>
                          {resumes.map((resume) => (
                            <SelectItem key={resume.id} value={resume.id}>
                              {resume.name}
                              {resume.isMaster && ' (Master)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Selecting a resume will provide personalized match analysis and recommendations
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => handleAnalyze(selectedResumeId !== 'none' ? selectedResumeId : undefined)}
                    disabled={isAnalyzing || isLoadingResumes}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze Job{selectedResumeId !== 'none' && ' & Match'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {analysis && (
              <>
                {/* Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Badge className={cn('mb-2', getRoleLevelColor(analysis.analysis.roleLevel))}>
                          {analysis.analysis.roleLevel.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground">Role Level</p>
                      </div>
                    </CardContent>
                  </Card>

                  {analysis.matchAnalysis && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className={cn('text-3xl font-bold mb-1', getMatchScoreColor(analysis.matchAnalysis.overallMatch))}>
                            {analysis.matchAnalysis.overallMatch}%
                          </div>
                          <p className="text-xs text-muted-foreground">Overall Match</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1 text-blue-600 dark:text-blue-400">
                          {analysis.analysis.requiredSkills.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Required Skills</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {analysis.analysis.redFlags.length === 0 ? (
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {analysis.analysis.redFlags.length} Red Flag{analysis.analysis.redFlags.length !== 1 && 's'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Re-analyze with Different Resume */}
                {resumes.length > 0 && (
                  <Card className="border-purple-200 dark:border-purple-900">
                    <CardHeader>
                      <CardTitle className="text-base">Re-analyze with a Different Resume</CardTitle>
                      <CardDescription>
                        {analysis.resumeId
                          ? `Current analysis includes resume match. Select a different resume to re-analyze.`
                          : `Get personalized match analysis by selecting a resume`
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.resumeId && (
                        <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <p className="text-sm text-purple-900 dark:text-purple-100">
                            Current analysis uses: <strong>{resumes.find(r => r.id === analysis.resumeId)?.name || 'Selected Resume'}</strong>
                          </p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Resume</label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a resume" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No resume - job analysis only</SelectItem>
                            {resumes.map((resume) => (
                              <SelectItem key={resume.id} value={resume.id}>
                                {resume.name}
                                {resume.isMaster && ' (Master)'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => handleAnalyze(selectedResumeId !== 'none' ? selectedResumeId : undefined)}
                        disabled={isAnalyzing}
                        className="w-full"
                        variant="secondary"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Re-analyzing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Re-analyze{selectedResumeId !== 'none' && ' with Selected Resume'}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="match">
                      Match{analysis.matchAnalysis && ` (${analysis.matchAnalysis.overallMatch}%)`}
                    </TabsTrigger>
                    <TabsTrigger value="salary">Salary</TabsTrigger>
                    <TabsTrigger value="tips">Tips</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Key Responsibilities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.analysis.keyResponsibilities.map((responsibility, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{responsibility}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Required Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysis.analysis.requiredSkills.map((skill, index) => (
                              <Badge key={index} variant="default">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Preferred Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysis.analysis.preferredSkills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Highlights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.analysis.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {analysis.analysis.redFlags.length > 0 && (
                      <Card className="border-red-200 dark:border-red-900">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-4 w-4" />
                            Red Flags
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysis.analysis.redFlags.map((flag, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{flag}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Match Tab */}
                  <TabsContent value="match" className="space-y-4">
                    {analysis.matchAnalysis ? (
                      <>
                        <div className="grid md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <Progress value={analysis.matchAnalysis.overallMatch} className="h-2 mb-2" />
                                <div className={cn('text-2xl font-bold mb-1', getMatchScoreColor(analysis.matchAnalysis.overallMatch))}>
                                  {analysis.matchAnalysis.overallMatch}%
                                </div>
                                <p className="text-xs text-muted-foreground">Overall Match</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <Progress value={analysis.matchAnalysis.skillsMatch} className="h-2 mb-2" />
                                <div className={cn('text-2xl font-bold mb-1', getMatchScoreColor(analysis.matchAnalysis.skillsMatch))}>
                                  {analysis.matchAnalysis.skillsMatch}%
                                </div>
                                <p className="text-xs text-muted-foreground">Skills Match</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <Progress value={analysis.matchAnalysis.experienceMatch} className="h-2 mb-2" />
                                <div className={cn('text-2xl font-bold mb-1', getMatchScoreColor(analysis.matchAnalysis.experienceMatch))}>
                                  {analysis.matchAnalysis.experienceMatch}%
                                </div>
                                <p className="text-xs text-muted-foreground">Experience Match</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Why You're a Good Fit
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analysis.matchAnalysis.matchReasons.map((reason, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        {analysis.matchAnalysis.gaps.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Areas to Improve
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analysis.matchAnalysis.gaps.map((gap, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{gap}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        <Card className="border-purple-200 dark:border-purple-900">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Recommendations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analysis.matchAnalysis.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{recommendation}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No match analysis available</p>
                            <p className="text-xs mt-1">Select a resume and re-analyze to see personalized match insights</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Salary Tab */}
                  <TabsContent value="salary" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Estimated Salary Range
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                          {analysis.salaryInsights.estimatedRange}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {analysis.salaryInsights.marketComparison}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Salary Factors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.salaryInsights.factors.map((factor, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Application Tips Tab */}
                  <TabsContent value="tips" className="space-y-4">
                    <Card className="border-blue-200 dark:border-blue-900">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Application Strategy
                        </CardTitle>
                        <CardDescription>
                          AI-generated tips to improve your application
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {analysis.applicationTips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <span className="flex items-center justify-center w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
