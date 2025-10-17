import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CreateJobData, Job, JobStatus } from '@/types/job';
import { useState, useEffect } from 'react';
import { jobService } from '@/services/jobService';
import { toast } from '@/hooks/use-toast';

const jobSchema = z.object({
  parseUrl: z.string().optional(), // Not saved, just for UI
  company: z.string().min(1, 'Company name is required'),
  title: z.string().min(1, 'Job title is required'),
  jobDescription: z.string().min(10, 'Description must be at least 10 characters').optional(),
  jobUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  salaryRange: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']).optional(),
  workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']).optional(),
  appliedAt: z.date().optional(),
  applicationDeadline: z.date().optional(),
  notes: z.string().optional(),
  status: z.enum(['INTERESTED', 'APPLIED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_RECEIVED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN']),
});

type JobFormData = z.infer<typeof jobSchema>;

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobData) => void;
  editJob?: Job | null;
  defaultStatus?: JobStatus;
}

export const AddJobModal = ({ open, onClose, onSubmit, editJob, defaultStatus }: AddJobModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      status: defaultStatus || 'INTERESTED',
      parseUrl: '',
    },
  });

  const handlePopulateFromUrl = async () => {
    const url = form.getValues('parseUrl');

    if (!url) {
      toast({
        title: 'URL Required',
        description: 'Please enter a job posting URL',
        variant: 'destructive',
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
      return;
    }

    setIsParsing(true);
    try {
      const parsedData = await jobService.parseJobUrl(url);

      // Populate form fields
      form.setValue('company', parsedData.company);
      form.setValue('title', parsedData.title);
      form.setValue('jobDescription', parsedData.jobDescription);
      form.setValue('location', parsedData.location);
      form.setValue('salaryRange', parsedData.salaryRange || '');
      form.setValue('jobType', parsedData.jobType);
      form.setValue('workMode', parsedData.workMode);
      form.setValue('jobUrl', url);

      toast({
        title: 'Success',
        description: 'Job details populated automatically!',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Parse URL',
        description: error.message || 'Could not parse job posting from URL. Please fill in the details manually.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Reset form when modal opens or editJob changes
  useEffect(() => {
    if (open) {
      if (editJob) {
        form.reset({
          ...editJob,
          parseUrl: '',
          jobUrl: editJob.jobUrl || '',
          appliedAt: editJob.appliedAt ? new Date(editJob.appliedAt) : undefined,
          applicationDeadline: editJob.applicationDeadline ? new Date(editJob.applicationDeadline) : undefined,
        });
      } else {
        form.reset({
          status: defaultStatus || 'INTERESTED',
          parseUrl: '',
          company: '',
          title: '',
          jobDescription: '',
          jobUrl: '',
          location: '',
          salaryRange: '',
          notes: '',
          appliedAt: undefined,
          applicationDeadline: undefined,
        });
      }
    }
  }, [open, editJob, defaultStatus, form]);

  const handleSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    try {
      const submitData: CreateJobData = {
        company: data.company,
        title: data.title,
        jobDescription: data.jobDescription,
        jobUrl: data.jobUrl,
        location: data.location,
        salaryRange: data.salaryRange,
        jobType: data.jobType || 'FULL_TIME',
        workMode: data.workMode || 'REMOTE',
        notes: data.notes,
        status: data.status,
        appliedAt: data.appliedAt?.toISOString(),
        applicationDeadline: data.applicationDeadline?.toISOString(),
      };
      onSubmit(submitData);
      form.reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editJob ? 'Edit Job' : 'Add New Job'}</DialogTitle>
          <DialogDescription>
            {editJob ? 'Update job information' : 'Fill in the details for the job opportunity'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* URL Parse Section */}
            {!editJob && (
              <div className="space-y-3 p-4 border rounded-lg bg-accent/50">
                <p className="text-sm font-medium">Quick Add from URL</p>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="parseUrl"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Paste job posting URL (e.g., LinkedIn, Indeed, etc.)"
                            {...field}
                            disabled={isParsing}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePopulateFromUrl}
                    disabled={isParsing}
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Populate
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Or fill in the details manually below
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the role, responsibilities, requirements..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="salaryRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Range</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., $100k - $150k" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover">
                      <SelectItem value="FULL_TIME">Full-time</SelectItem>
                      <SelectItem value="PART_TIME">Part-time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                      <SelectItem value="TEMPORARY">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Mode *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
                        <SelectItem value="REMOTE">Remote</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                        <SelectItem value="ONSITE">Onsite</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appliedAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Applied Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Not Applied</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this opportunity..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editJob ? 'Update Job' : 'Add Job'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
