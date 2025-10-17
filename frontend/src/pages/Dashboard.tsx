import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useJobsStore } from '@/store/jobsStore';
import { useJobs } from '@/hooks/useJobs';
import { KanbanBoard } from '@/components/jobs/KanbanBoard';
import { AddJobModal } from '@/components/jobs/AddJobModal';
import { JobDetailDrawer } from '@/components/jobs/JobDetailDrawer';
import { Job, JobStatus, CreateJobData } from '@/types/job';
import { Briefcase, MessageSquare, Clock, Award, Plus, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { selectedJob, setSelectedJob } = useJobsStore();
  const { jobs, isLoading, error, createJob, updateJob, deleteJob, updateJobStatus } = useJobs();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<JobStatus>('INTERESTED');

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
            {jobs.length === 0 ? 'No jobs yet' : `Drag and drop to update status • ${jobs.length} total jobs`}
          </p>
        </div>
        {jobs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start tracking your dream jobs</h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
                Add your first job to begin organizing your job search journey
              </p>
              <Button onClick={() => handleAddJob()} variant="hero">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Job
              </Button>
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
    </div>
  );
};

export default Dashboard;
