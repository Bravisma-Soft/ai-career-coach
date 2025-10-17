import { Interview } from '@/types/interview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, Phone, Building, Users, Code } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface InterviewCardProps {
  interview: Interview;
  onView: () => void;
}

const typeIcons: Record<string, any> = {
  PHONE_SCREEN: Phone,
  VIDEO_CALL: Video,
  IN_PERSON: Building,
  TECHNICAL: Code,
  BEHAVIORAL: Users,
  PANEL: Users,
  FINAL: Users,
  OTHER: Building,
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  PASSED: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400',
  RESCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  NO_SHOW: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',

  // Legacy fallbacks
  scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
};

// Helper to format type names for display
const formatTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    PHONE_SCREEN: 'Phone Screen',
    VIDEO_CALL: 'Video Call',
    IN_PERSON: 'In Person',
    TECHNICAL: 'Technical',
    BEHAVIORAL: 'Behavioral',
    PANEL: 'Panel',
    FINAL: 'Final Round',
    OTHER: 'Other',
  };
  return typeNames[type] || type;
};

// Helper to format status names for display
const formatStatusName = (status: string): string => {
  const statusNames: Record<string, string> = {
    PENDING: 'Scheduled',
    PASSED: 'Completed',
    FAILED: 'Not Selected',
    CANCELLED: 'Cancelled',
    RESCHEDULED: 'Rescheduled',
    NO_SHOW: 'No Show',
  };
  return statusNames[status] || status;
};

export const InterviewCard = ({ interview, onView }: InterviewCardProps) => {
  const TypeIcon = typeIcons[interview.type] || Building; // Fallback icon
  const isPast = new Date(interview.date) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{interview.companyName}</CardTitle>
            <CardDescription className="mt-1">{interview.jobTitle}</CardDescription>
          </div>
          <Badge variant="outline" className={cn(statusColors[interview.status] || statusColors.PENDING)}>
            {formatStatusName(interview.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(interview.date), 'MMM dd, yyyy')}</span>
          <Clock className="h-4 w-4 text-muted-foreground ml-2" />
          <span>{format(new Date(interview.date), 'h:mm a')}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <TypeIcon className="h-4 w-4 text-muted-foreground" />
          <span>{formatTypeName(interview.type)}</span>
          <span className="text-muted-foreground">• {interview.duration} min</span>
        </div>

        {interview.interviewer?.name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {interview.interviewer.name}
              {interview.interviewer.title && ` • ${interview.interviewer.title}`}
            </span>
          </div>
        )}

        {interview.locationOrLink && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {interview.type === 'VIDEO_CALL' || interview.type === 'PHONE_SCREEN' ? (
              <Video className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="truncate">{interview.locationOrLink}</span>
          </div>
        )}
        
        <div className="pt-2">
          <Button 
            variant={isPast ? 'outline' : 'default'} 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            {isPast ? 'View Details' : 'Prepare Interview'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
