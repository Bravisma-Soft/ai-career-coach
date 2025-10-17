import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, Star, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ResumeUpload } from '@/components/resumes/ResumeUpload';
import { ResumeCard } from '@/components/resumes/ResumeCard';
import { ResumePreview } from '@/components/resumes/ResumePreview';
import { ResumeEditor } from '@/components/resumes/ResumeEditor';
import { useResumes } from '@/hooks/useResumes';
import { useResumesStore } from '@/store/resumesStore';
import { Resume } from '@/types/resume';
import { toast } from '@/hooks/use-toast';

type FilterType = 'all' | 'master' | 'tailored' | 'recent';
type SortType = 'date' | 'name' | 'version';

export default function Resumes() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date');

  const location = useLocation();
  const { resumes, isLoading, uploadResume, isUploading, updateResume, deleteResume, setMasterResume, parseResume } = useResumes();
  const { selectedResume, setSelectedResume, masterResume } = useResumesStore();

  // Auto-open editor if navigated from TailorResumeModal
  useEffect(() => {
    const state = location.state as { openEditorForResumeId?: string; newResume?: any };

    // If we have a newResume passed directly, use it immediately
    if (state?.newResume && !isLoading) {
      setSelectedResume(state.newResume);
      setEditorModalOpen(true);
      // Clear the state to prevent re-opening on subsequent renders
      window.history.replaceState({}, document.title);
      return;
    }

    // Otherwise, wait for resumes to load and find it
    if (state?.openEditorForResumeId && !isLoading && resumes.length > 0) {
      const resumeToEdit = resumes.find(r => r.id === state.openEditorForResumeId);
      if (resumeToEdit) {
        setSelectedResume(resumeToEdit);
        setEditorModalOpen(true);
        // Clear the state to prevent re-opening on subsequent renders
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, resumes, isLoading, setSelectedResume]);

  const filteredAndSortedResumes = useMemo(() => {
    let filtered = [...resumes];

    // Apply filters
    switch (filterType) {
      case 'master':
        filtered = filtered.filter((r) => r.isMaster);
        break;
      case 'tailored':
        filtered = filtered.filter((r) => r.type === 'tailored');
        break;
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter((r) => new Date(r.createdAt) > thirtyDaysAgo);
        break;
    }

    // Apply sorting
    switch (sortType) {
      case 'date':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'version':
        filtered.sort((a, b) => b.version - a.version);
        break;
    }

    return filtered;
  }, [resumes, filterType, sortType]);

  const handleUpload = (file: File, name: string) => {
    uploadResume({ name, type: 'version', file });
    setUploadModalOpen(false);
  };

  const handlePreview = (resume: Resume) => {
    setSelectedResume(resume);
    setPreviewModalOpen(true);
  };

  const handleEdit = (resume: Resume) => {
    setSelectedResume(resume);
    setEditorModalOpen(true);
  };

  const handleDownload = (resume: Resume) => {
    toast({
      title: 'Downloading resume',
      description: `${resume.name} is being downloaded...`,
    });
    // In production, implement actual download
  };

  const handleDelete = (resume: Resume) => {
    if (confirm(`Are you sure you want to delete "${resume.name}"?`)) {
      deleteResume(resume.id);
    }
  };

  const handleSetMaster = (resume: Resume) => {
    setMasterResume(resume.id);
  };

  const handleParse = (resume: Resume) => {
    parseResume(resume.id);
  };

  const handleSaveEdit = (id: string, data: any) => {
    updateResume({ id, data });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8 mb-20 md:mb-0">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Resumes</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your resumes and create tailored versions for different applications
            </p>
          </div>
          <Button onClick={() => setUploadModalOpen(true)} className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
        </div>

        {/* Master Resume Section */}
        {masterResume ? (
          <Card className="border-primary shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary fill-current" />
                <CardTitle>Master Resume</CardTitle>
              </div>
              <CardDescription>Your primary resume template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{masterResume.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Version {masterResume.version} • Last updated{' '}
                      {new Date(masterResume.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handlePreview(masterResume)}>
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(masterResume)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(masterResume)}>
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Master Resume</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a resume and set it as your master template
              </p>
              <Button onClick={() => setUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Resume
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Select value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resumes</SelectItem>
                <SelectItem value="master">Master Only</SelectItem>
                <SelectItem value="tailored">Tailored Only</SelectItem>
                <SelectItem value="recent">Recent (30 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={sortType} onValueChange={(value) => setSortType(value as SortType)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="version">Sort by Version</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resume Versions Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Versions</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedResumes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No resumes found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onPreview={handlePreview}
                  onEdit={handleEdit}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onSetMaster={handleSetMaster}
                  onParse={handleParse}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Upload a new resume in PDF, DOCX, or TXT format (max 5MB)
            </DialogDescription>
          </DialogHeader>
          <ResumeUpload onUpload={handleUpload} isUploading={isUploading} />
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <ResumePreview
        resume={selectedResume}
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      {/* Editor Modal */}
      <ResumeEditor
        resume={selectedResume}
        open={editorModalOpen}
        onOpenChange={setEditorModalOpen}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
