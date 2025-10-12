import { FileText, Download, Eye, Trash2, Star, MoreVertical, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Resume } from '@/types/resume';
import { cn } from '@/lib/utils';

interface ResumeCardProps {
  resume: Resume;
  onPreview: (resume: Resume) => void;
  onEdit: (resume: Resume) => void;
  onDownload: (resume: Resume) => void;
  onDelete: (resume: Resume) => void;
  onSetMaster: (resume: Resume) => void;
}

export const ResumeCard = ({
  resume,
  onPreview,
  onEdit,
  onDownload,
  onDelete,
  onSetMaster,
}: ResumeCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', resume.isMaster && 'border-primary')}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{resume.name}</h3>
                {resume.isMaster && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Master
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Version {resume.version}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(resume)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(resume)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(resume)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              {!resume.isMaster && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSetMaster(resume)}>
                    <Star className="h-4 w-4 mr-2" />
                    Set as Master
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(resume)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{formatDate(resume.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span>{formatFileSize(resume.fileSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="capitalize">{resume.type}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => onPreview(resume)} className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(resume)} className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
