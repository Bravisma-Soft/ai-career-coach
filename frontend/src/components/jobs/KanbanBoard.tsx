import { useState } from 'react';
import { Job, JobStatus } from '@/types/job';
import { JobCard } from './JobCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  jobs: Job[];
  onAddJob: (status: JobStatus) => void;
  onViewJob: (job: Job) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  onUpdateStatus: (id: string, status: JobStatus) => void;
}

const columns: { id: JobStatus; title: string; color: string }[] = [
  { id: 'INTERESTED', title: 'Interested', color: 'bg-blue-500' },
  { id: 'APPLIED', title: 'Applied', color: 'bg-purple-500' },
  { id: 'INTERVIEW_SCHEDULED', title: 'Interview Scheduled', color: 'bg-orange-500' },
  { id: 'INTERVIEW_COMPLETED', title: 'Interview Done', color: 'bg-yellow-500' },
  { id: 'OFFER_RECEIVED', title: 'Offer', color: 'bg-green-500' },
  { id: 'REJECTED', title: 'Rejected', color: 'bg-red-500' },
  { id: 'ACCEPTED', title: 'Accepted', color: 'bg-emerald-500' },
  { id: 'WITHDRAWN', title: 'Withdrawn', color: 'bg-gray-500' },
];

// Droppable column component
const DroppableColumn = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 transition-colors rounded-lg',
        isOver && 'bg-accent/50'
      )}
    >
      {children}
    </div>
  );
};

export const KanbanBoard = ({
  jobs,
  onAddJob,
  onViewJob,
  onEditJob,
  onDeleteJob,
  onUpdateStatus,
}: KanbanBoardProps) => {
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id === event.active.id);
    setActiveJob(job || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);
    setOverId(null);

    if (!over) {
      return;
    }

    const jobId = active.id as string;

    // Check if we dropped on a column (status) or on another job
    let newStatus: JobStatus;

    // If dropped on a column directly
    if (columns.some(col => col.id === over.id)) {
      newStatus = over.id as JobStatus;
    } else {
      // If dropped on another job, find that job's status
      const targetJob = jobs.find((j) => j.id === over.id);
      if (!targetJob) {
        return;
      }
      newStatus = targetJob.status;
    }

    const job = jobs.find((j) => j.id === jobId);
    if (job && job.status !== newStatus) {
      onUpdateStatus(jobId, newStatus);
    }
  };

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter((job) => job.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 overflow-x-auto">
        {columns.map((column) => {
          const columnJobs = getJobsByStatus(column.id);
          return (
            <div key={column.id} className="flex flex-col min-h-[400px] md:min-h-[500px] min-w-[280px]">
              <Card className="p-3 md:p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${column.color}`} />
                    <h3 className="text-sm md:text-base font-semibold">{column.title}</h3>
                    <span className="text-xs text-muted-foreground">({columnJobs.length})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8"
                    onClick={() => onAddJob(column.id)}
                    aria-label={`Add job to ${column.title}`}
                  >
                    <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>

                <DroppableColumn id={column.id}>
                  <SortableContext items={columnJobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 md:space-y-3 flex-1 min-h-[200px]">
                      {columnJobs.length === 0 ? (
                        <div className="text-center text-xs md:text-sm text-muted-foreground py-6 md:py-8">
                          No jobs in this stage
                        </div>
                      ) : (
                        columnJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            onView={onViewJob}
                            onEdit={onEditJob}
                            onDelete={onDeleteJob}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              </Card>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeJob && (
          <div className="opacity-80">
            <JobCard
              job={activeJob}
              onView={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
