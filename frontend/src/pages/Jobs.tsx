import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useJobs } from '@/hooks/useJobs';
import { useJobsStore } from '@/store/jobsStore';
import { Job, CreateJobData, JobStatus } from '@/types/job';
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AddJobModal } from '@/components/jobs/AddJobModal';
import { JobDetailModal } from '@/components/jobs/JobDetailModal';
import { JobsQueryParams } from '@/services/jobService';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function Jobs() {
  const { selectedJob, setSelectedJob } = useJobsStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workModeFilter, setWorkModeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'company' | 'title'>('createdAt');

  // Debounce search query to avoid too many API calls
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Build query params for server-side filtering
  const queryParams: JobsQueryParams = useMemo(() => {
    const params: JobsQueryParams = {
      sortBy,
      sortOrder: sortBy === 'createdAt' ? 'desc' : 'asc',
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter as JobStatus;
    }

    if (workModeFilter !== 'all') {
      params.workMode = workModeFilter as 'REMOTE' | 'HYBRID' | 'ONSITE';
    }

    return params;
  }, [debouncedSearch, statusFilter, workModeFilter, sortBy]);

  // Fetch jobs with server-side filtering
  const { jobs, pagination, isLoading, error, createJob, updateJob, deleteJob } = useJobs(queryParams);

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setIsAddModalOpen(true);
  };

  const handleEditJob = () => {
    if (selectedJob) {
      setEditingJob(selectedJob);
      setIsDetailModalOpen(false);
      setIsAddModalOpen(true);
    }
  };

  const handleSubmitJob = (data: CreateJobData) => {
    if (editingJob) {
      updateJob({ id: editingJob.id, data });
    } else {
      createJob(data);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteJob = () => {
    if (selectedJob && window.confirm('Are you sure you want to delete this job?')) {
      deleteJob(selectedJob.id);
      setIsDetailModalOpen(false);
    }
  };

  const statusColors: Record<string, string> = {
    INTERESTED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    APPLIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    INTERVIEW_COMPLETED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    OFFER_RECEIVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    ACCEPTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    WITHDRAWN: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const workModeColors: Record<string, string> = {
    REMOTE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    HYBRID: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ONSITE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading jobs...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8 mb-20 md:mb-0">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Job Tracker</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Track and manage all your job applications in one place
            </p>
          </div>
          <Button onClick={handleAddJob} variant="hero" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company, job title, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="INTERESTED">Interested</SelectItem>
                    <SelectItem value="APPLIED">Applied</SelectItem>
                    <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                    <SelectItem value="INTERVIEW_COMPLETED">Interview Completed</SelectItem>
                    <SelectItem value="OFFER_RECEIVED">Offer Received</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={workModeFilter} onValueChange={setWorkModeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Work Modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Modes</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    <SelectItem value="ONSITE">Onsite</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'createdAt' | 'company' | 'title')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Sort by Date</SelectItem>
                    <SelectItem value="company">Sort by Company</SelectItem>
                    <SelectItem value="title">Sort by Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {pagination ? (
                    <>Showing {jobs.length} of {pagination.total} jobs</>
                  ) : (
                    <>Showing {jobs.length} jobs</>
                  )}
                </span>
                {(searchQuery || statusFilter !== 'all' || workModeFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setWorkModeFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {!searchQuery && statusFilter === 'all' && workModeFilter === 'all'
                  ? 'No jobs tracked yet'
                  : 'No jobs match your filters'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {!searchQuery && statusFilter === 'all' && workModeFilter === 'all'
                  ? 'Start tracking your job applications by adding your first job'
                  : 'Try adjusting your search or filters'}
              </p>
              {!searchQuery && statusFilter === 'all' && workModeFilter === 'all' && (
                <Button onClick={handleAddJob} variant="hero">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleViewJob(job)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {job.company}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{job.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className={cn('text-xs', statusColors[job.status])}>
                          {job.status.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className={cn('text-xs', workModeColors[job.workMode])}>
                          {job.workMode}
                        </Badge>
                        {job.matchScore !== null && job.matchScore !== undefined && (
                          <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                            {job.matchScore}% match
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {job.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 flex-shrink-0" />
                        <span>{job.jobType.replace(/_/g, ' ')}</span>
                      </div>
                      {job.appliedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>Applied {new Date(job.appliedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddJobModal
        open={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleSubmitJob}
        editJob={editingJob}
      />

      <JobDetailModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        job={selectedJob}
        onEdit={handleEditJob}
        onDelete={handleDeleteJob}
      />
    </div>
  );
}
