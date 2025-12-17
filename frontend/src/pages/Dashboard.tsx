import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useJobsStore } from '@/store/jobsStore';
import { useJobs } from '@/hooks/useJobs';
import { KanbanBoard } from '@/components/jobs/KanbanBoard';
import { AddJobModal } from '@/components/jobs/AddJobModal';
import { JobDetailDrawer } from '@/components/jobs/JobDetailDrawer';
import { JobAnalysisModal } from '@/components/ai/JobAnalysisModal';
import { Job, JobStatus, CreateJobData } from '@/types/job';
import { Briefcase, MessageSquare, Clock, Award, Plus, Loader2, Search, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JobsQueryParams } from '@/services/jobService';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { selectedJob, setSelectedJob } = useJobsStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [analyzingJob, setAnalyzingJob] = useState<Job | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<JobStatus>('INTERESTED');

  // Filter states for Kanban
  const [searchQuery, setSearchQuery] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState<string>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');

  // Debounce search query to avoid too many API calls
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Build query params for server-side filtering
  const queryParams: JobsQueryParams = useMemo(() => {
    const params: JobsQueryParams = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    if (workModeFilter !== 'all') {
      params.workMode = workModeFilter as 'REMOTE' | 'HYBRID' | 'ONSITE';
    }

    if (jobTypeFilter !== 'all') {
      params.jobType = jobTypeFilter as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
    }

    return params;
  }, [debouncedSearch, workModeFilter, jobTypeFilter]);

  // Fetch jobs with server-side filtering
  const { jobs, pagination, isLoading, error, createJob, updateJob, deleteJob, updateJobStatus } = useJobs(queryParams);

  const hasActiveFilters = searchQuery || workModeFilter !== 'all' || jobTypeFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setWorkModeFilter('all');
    setJobTypeFilter('all');
  };

  const stats = [
    {
      title: 'Total Applications',
      value: jobs.filter((j) => j.status === 'APPLIED' || j.status === 'INTERVIEW_SCHEDULED' || j.status === 'INTERVIEW_COMPLETED' || j.status === 'OFFER_RECEIVED' || j.status === 'ACCEPTED' || j.status === 'REJECTED').length,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Active Interviews',
      value: jobs.filter((j) => j.status === 'INTERVIEW_SCHEDULED').length,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Pending Responses',
      value: jobs.filter((j) => j.status === 'INTERVIEW_COMPLETED').length,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Offers Received',
      value: jobs.filter((j) => j.status === 'OFFER_RECEIVED').length,
      icon: Award,
      color: 'from-green-500 to-green-600',
    },
  ];

  const handleAddJob = (status?: JobStatus) => {
    setDefaultStatus(status || 'INTERESTED');
    setEditingJob(null);
    setIsAddModalOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsAddModalOpen(true);
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsDetailDrawerOpen(true);
  };

  const handleSubmitJob = (data: CreateJobData) => {
    if (editingJob) {
      updateJob({ id: editingJob.id, data });
    } else {
      createJob(data);
    }
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteJob(id);
      setIsDetailDrawerOpen(false);
    }
  };

  const handleAnalyzeJob = (job: Job) => {
    setAnalyzingJob(job);
    setIsAnalysisModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load jobs. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-8 space-y-6 md:space-y-8 mb-20 md:mb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {user?.name}! 👋</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">Track and manage your job applications</p>
        </div>
        <Button variant="hero" onClick={() => handleAddJob()} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`h-6 w-6 md:h-8 md:w-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Job Pipeline</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {jobs.length === 0 && !hasActiveFilters
              ? 'No jobs yet'
              : pagination
              ? `Showing ${jobs.length} of ${pagination.total} jobs • Drag and drop to update status`
              : `${jobs.length} jobs • Drag and drop to update status`}
          </p>
        </div>

        {/* Filter Bar */}
        <Card className="mb-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company, job title, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={workModeFilter} onValueChange={setWorkModeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Work Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Modes</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    <SelectItem value="ONSITE">Onsite</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Types</SelectItem>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {jobs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? 'No jobs match your filters' : 'Start tracking your dream jobs'}
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'Add your first job to begin organizing your job search journey'}
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => handleAddJob()} variant="hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <KanbanBoard
            jobs={jobs}
            onAddJob={handleAddJob}
            onViewJob={handleViewJob}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
            onUpdateStatus={(id, status) => updateJobStatus({ id, status })}
            onAnalyzeJob={handleAnalyzeJob}
          />
        )}
      </div>

      <AddJobModal
        open={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleSubmitJob}
        editJob={editingJob}
        defaultStatus={defaultStatus}
      />

      <JobDetailDrawer
        open={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        onEdit={() => {
          setIsDetailDrawerOpen(false);
          if (selectedJob) handleEditJob(selectedJob);
        }}
        onDelete={() => {
          if (selectedJob) handleDeleteJob(selectedJob.id);
        }}
      />

      <JobAnalysisModal
        job={analyzingJob}
        open={isAnalysisModalOpen}
        onOpenChange={(open) => {
          setIsAnalysisModalOpen(open);
          if (!open) setAnalyzingJob(null);
        }}
        onAnalysisComplete={() => {
          // Optionally refresh jobs to get updated match scores
        }}
      />
    </div>
  );
};

export default Dashboard;
