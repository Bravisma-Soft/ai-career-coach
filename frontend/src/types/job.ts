export type JobStatus = 'interested' | 'applied' | 'interview' | 'offer' | 'rejected' | 'accepted';
export type JobType = 'full-time' | 'part-time' | 'contract';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export interface Job {
  id: string;
  companyName: string;
  jobTitle: string;
  description: string;
  jobUrl?: string;
  location: string;
  salaryRange?: string;
  jobType: JobType;
  workMode: WorkMode;
  applicationDeadline?: string;
  notes?: string;
  status: JobStatus;
  matchScore?: number;
  appliedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobData {
  companyName: string;
  jobTitle: string;
  description: string;
  jobUrl?: string;
  location: string;
  salaryRange?: string;
  jobType: JobType;
  workMode: WorkMode;
  applicationDeadline?: string;
  notes?: string;
  status: JobStatus;
}
