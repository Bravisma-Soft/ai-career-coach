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

const typeIcons = {
  Phone: Phone,
  Video: Video,
  Onsite: Building,
  Technical: Code,
  Behavioral: Users,
  Panel: Users,
};

const statusColors = {
  scheduled: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-secondary/10 text-secondary border-secondary/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

export const InterviewCard = ({ interview, onView }: InterviewCardProps) => {
  const TypeIcon = typeIcons[interview.type];
  const isPast = new Date(interview.date) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{interview.companyName}</CardTitle>
            <CardDescription className="mt-1">{interview.jobTitle}</CardDescription>
          </div>
          <Badge variant="outline" className={cn('capitalize', statusColors[interview.status])}>
            {interview.status}
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
          <span>{interview.type}</span>
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
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {interview.type === 'Video' || interview.type === 'Phone' ? (
            <Video className="h-4 w-4" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          <span className="truncate">{interview.locationOrLink}</span>
        </div>
        
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
