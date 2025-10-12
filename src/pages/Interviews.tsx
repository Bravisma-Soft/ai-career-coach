import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { InterviewCard } from '@/components/interviews/InterviewCard';
import { AddInterviewModal } from '@/components/interviews/AddInterviewModal';
import { useInterviews } from '@/hooks/useInterviews';
import { Skeleton } from '@/components/ui/skeleton';
import { Interview } from '@/types/interview';

type FilterType = 'all' | 'upcoming' | 'past';
type SortType = 'date' | 'company';

export default function Interviews() {
  const navigate = useNavigate();
  const { interviews, isLoading } = useInterviews();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');

  const now = new Date();

  const filteredInterviews = interviews.filter((interview) => {
    const interviewDate = new Date(interview.date);
    
    if (filter === 'upcoming') {
      return interviewDate >= now && interview.status === 'scheduled';
    }
    if (filter === 'past') {
      return interviewDate < now || interview.status === 'completed';
    }
    return true;
  });

  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    if (sort === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return a.companyName.localeCompare(b.companyName);
  });

  const handleViewInterview = (interview: Interview) => {
    navigate(`/interviews/${interview.id}`);
  };

  return (
    <div className="container py-4 md:py-8 mb-20 md:mb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 md:h-8 md:w-8" />
            Interviews
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Manage and prepare for your upcoming interviews
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={sort} onValueChange={(v) => setSort(v as SortType)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="date">Sort by Date</TabsTrigger>
            <TabsTrigger value="company">Sort by Company</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[280px]" />
          ))}
        </div>
      ) : sortedInterviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Start by scheduling your first interview to begin your preparation journey
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedInterviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onView={() => handleViewInterview(interview)}
            />
          ))}
        </div>
      )}

      <AddInterviewModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
