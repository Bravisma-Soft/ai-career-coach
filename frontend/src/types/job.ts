export type JobStatus = 'INTERESTED' | 'APPLIED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED' | 'OFFER_RECEIVED' | 'REJECTED' | 'ACCEPTED' | 'WITHDRAWN';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';

export interface Job {
  id: string;
  company: string;
  title: string;
  jobDescription?: string;
  jobUrl?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryRange?: string; // For display/input purposes (e.g., "$100k - $150k")
  jobType: JobType;
  workMode: WorkMode;
  applicationDeadline?: string;
  notes?: string;
  status: JobStatus;
  matchScore?: number;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobData {
  company: string;
  title: string;
  jobDescription?: string;
  jobUrl?: string;
  location?: string;
  salaryRange?: string;
  jobType: JobType;
  workMode: WorkMode;
  appliedAt?: string;
  applicationDeadline?: string;
  notes?: string;
  status: JobStatus;
}
