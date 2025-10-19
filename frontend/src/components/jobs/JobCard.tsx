import { Job } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, Briefcase, Calendar, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface JobCardProps {
  job: Job;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<Job['status'], string> = {
  INTERESTED: 'border-l-blue-500',
  APPLIED: 'border-l-purple-500',
  INTERVIEW_SCHEDULED: 'border-l-orange-500',
  INTERVIEW_COMPLETED: 'border-l-yellow-500',
  OFFER_RECEIVED: 'border-l-green-500',
  REJECTED: 'border-l-red-500',
  ACCEPTED: 'border-l-emerald-500',
  WITHDRAWN: 'border-l-gray-500',
};

const workModeColors: Record<Job['workMode'], string> = {
  REMOTE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  HYBRID: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ONSITE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export const JobCard = ({ job, onView, onEdit, onDelete }: JobCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'p-4 border-l-4 hover:shadow-md transition-all duration-200 cursor-move',
        statusColors[job.status]
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{job.company}</h3>
            <p className="text-sm text-muted-foreground truncate">{job.title}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(job); }}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(job); }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(job.id); }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={cn('text-xs', workModeColors[job.workMode])}>
              {job.workMode}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              {job.jobType}
            </Badge>
            {job.matchScore !== null && job.matchScore !== undefined && (
              <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                {job.matchScore}% match
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>{job.appliedAt ? new Date(job.appliedAt).toLocaleDateString() : new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
};
