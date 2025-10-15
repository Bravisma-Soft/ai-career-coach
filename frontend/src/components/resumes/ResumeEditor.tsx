import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Resume, UpdateResumeData } from '@/types/resume';

const resumeEditorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  personalInfo: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email').or(z.literal('')),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }),
  summary: z.string().optional(),
  experience: z.array(
    z.object({
      company: z.string().optional(),
      position: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean(),
      description: z.string().optional(),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string().optional(),
      degree: z.string().optional(),
      field: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean(),
      gpa: z.string().optional(),
    })
  ),
  skills: z.string().optional(),
});

type ResumeEditorFormData = z.infer<typeof resumeEditorSchema>;

interface ResumeEditorProps {
  resume: Resume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: UpdateResumeData) => void;
}

export const ResumeEditor = ({ resume, open, onOpenChange, onSave }: ResumeEditorProps) => {
  const form = useForm<ResumeEditorFormData>({
    resolver: zodResolver(resumeEditorSchema),
    defaultValues: {
      name: '',
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: '',
    },
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  useEffect(() => {
    if (resume) {
      form.reset({
        name: resume.name,
        personalInfo: resume.personalInfo || {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          website: '',
        },
        summary: resume.summary || '',
        experience: resume.experience?.map(exp => ({
          ...exp,
          endDate: exp.endDate || '', // Convert null to empty string
          description: exp.description.join('\n'),
        })) || [],
        education: resume.education?.map(edu => ({
          ...edu,
          endDate: edu.endDate || '', // Convert null to empty string
          gpa: edu.gpa || '', // Convert undefined to empty string
        })) || [],
        skills: resume.skills?.join(', ') || '',
      });
    }
  }, [resume, form]);

  const onSubmit = (data: ResumeEditorFormData) => {
    if (!resume) return;

    const updateData: UpdateResumeData = {
      name: data.name,
      personalInfo: {
        fullName: data.personalInfo.fullName,
        email: data.personalInfo.email || '',
        phone: data.personalInfo.phone || '',
        location: data.personalInfo.location || '',
        linkedin: data.personalInfo.linkedin,
        website: data.personalInfo.website,
      },
      summary: data.summary || '',
      experience: data.experience.map(exp => ({
        id: (exp.company || 'exp').toLowerCase().replace(/\s+/g, '-'),
        company: exp.company || '',
        position: exp.position || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || null, // Convert empty string back to null
        current: exp.current,
        description: exp.description
          ? (typeof exp.description === 'string'
              ? exp.description.split('\n').filter(line => line.trim())
              : exp.description)
          : [],
      })),
      education: data.education.map(edu => ({
        id: (edu.institution || 'edu').toLowerCase().replace(/\s+/g, '-'),
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || null, // Convert empty string back to null
        current: edu.current,
        gpa: edu.gpa,
      })),
      skills: data.skills ? data.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
    };

    onSave(resume.id, updateData);
    onOpenChange(false);
  };

  if (!resume) return null;

  // Check if resume has been parsed
  const isParsed = resume.personalInfo && resume.experience && resume.education && resume.skills;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Resume</DialogTitle>
          <DialogDescription>
            {isParsed
              ? 'Update your resume information'
              : 'This resume needs to be parsed before it can be edited. Click "Parse Resume" first.'}
          </DialogDescription>
        </DialogHeader>

        {!isParsed && (
          <div className="p-4 bg-muted rounded-lg text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This resume hasn't been parsed yet. Parse it first to edit the content.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}

        {isParsed && (

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Resume Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Summary */}
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Experience */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Experience</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendExperience({
                          company: '',
                          position: '',
                          location: '',
                          startDate: '',
                          endDate: null,
                          current: false,
                          description: '',
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                  {experienceFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`experience.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.location`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="month" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="month" value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.current`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0 pt-8">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Current Position</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`experience.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (one bullet per line)</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Education */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Education</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendEducation({
                          institution: '',
                          degree: '',
                          field: '',
                          location: '',
                          startDate: '',
                          endDate: null,
                          current: false,
                          gpa: '',
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  </div>
                  {educationFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.institution`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institution</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Degree</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.field`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field of Study</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.location`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="month" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input {...field} type="month" value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.gpa`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GPA (optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.current`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0 pt-8">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Currently Studying</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Skills */}
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="React, TypeScript, Node.js, ..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
