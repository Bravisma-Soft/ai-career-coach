import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useProfileStore } from '@/store/profileStore';
import { profileService } from '@/services/profileService';

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

const professionalSummarySchema = z.object({
  headline: z.string().max(100).optional(),
  summary: z.string().max(300).optional(),
  yearsOfExperience: z.number().min(0).optional(),
});

export default function Profile() {
  const { profile, setProfile, hasUnsavedChanges, setHasUnsavedChanges } = useProfileStore();
  const [isLoading, setIsLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [targetLocations, setTargetLocations] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState<number[]>([50000, 150000]);
  const [openToRemote, setOpenToRemote] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const personalInfoForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      location: '',
      linkedinUrl: '',
      portfolioUrl: '',
    },
  });

  const professionalForm = useForm({
    resolver: zodResolver(professionalSummarySchema),
    defaultValues: {
      headline: '',
      summary: '',
      yearsOfExperience: 0,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      personalInfoForm.reset({
        fullName: profile.fullName,
        phone: profile.phone || '',
        location: profile.location || '',
        linkedinUrl: profile.linkedinUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
      });
      professionalForm.reset({
        headline: profile.headline || '',
        summary: profile.summary || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
      });
      setPhotoPreview(profile.photoUrl || '');
      setTargetRoles(profile.targetRoles);
      setTargetIndustries(profile.targetIndustries);
      setTargetLocations(profile.targetLocations);
      setSalaryRange([profile.salaryMin || 50000, profile.salaryMax || 150000]);
      setOpenToRemote(profile.openToRemote);
    }
  }, [profile]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadProfile = async () => {
    try {
      const data = await profileService.fetchProfile();
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await profileService.uploadPhoto(file);
      setPhotoPreview(url);
      setHasUnsavedChanges(true);
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const onPersonalInfoSubmit = async (data: z.infer<typeof personalInfoSchema>) => {
    try {
      const updated = await profileService.updateProfile({
        ...data,
        photoUrl: photoPreview,
      });
      setProfile(updated);
      setHasUnsavedChanges(false);
      toast.success('Personal information saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const onProfessionalSubmit = async (data: z.infer<typeof professionalSummarySchema>) => {
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      toast.success('Professional summary saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleCareerPreferencesSave = async () => {
    try {
      const updated = await profileService.updateProfile({
        targetRoles,
        targetIndustries,
        targetLocations,
        salaryMin: salaryRange[0],
        salaryMax: salaryRange[1],
        openToRemote,
      });
      setProfile(updated);
      toast.success('Career preferences saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const addTag = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]) => {
    if (value && !current.includes(value)) {
      setter([...current, value]);
      setHasUnsavedChanges(true);
    }
  };

  const removeTag = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]) => {
    setter(current.filter((item) => item !== value));
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your professional profile and preferences</p>
      </div>

      {hasUnsavedChanges && (
        <div className="bg-warning/10 border border-warning p-4 rounded-lg">
          <p className="text-sm font-medium">You have unsaved changes</p>
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic contact and profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">
                      {profile?.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{profile?.fullName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{profile?.email}</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" {...personalInfoForm.register('fullName')} />
                {personalInfoForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{personalInfoForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...personalInfoForm.register('phone')} />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...personalInfoForm.register('location')} placeholder="City, State" />
              </div>

              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input id="linkedinUrl" type="url" {...personalInfoForm.register('linkedinUrl')} />
              </div>

              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input id="portfolioUrl" type="url" {...personalInfoForm.register('portfolioUrl')} />
              </div>
            </div>

            <Button type="submit">Save Personal Information</Button>
          </form>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
          <CardDescription>Highlight your expertise and career focus</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={professionalForm.handleSubmit(onProfessionalSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                {...professionalForm.register('headline')}
                placeholder="e.g., Senior Software Engineer | Full Stack Developer"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {professionalForm.watch('headline')?.length || 0}/100
              </p>
            </div>

            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                {...professionalForm.register('summary')}
                placeholder="Brief overview of your experience and skills"
                maxLength={300}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {professionalForm.watch('summary')?.length || 0}/300
              </p>
            </div>

            <div>
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                {...professionalForm.register('yearsOfExperience', { valueAsNumber: true })}
              />
            </div>

            <Button type="submit">Save Professional Summary</Button>
          </form>
        </CardContent>
      </Card>

      {/* Career Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Career Preferences</CardTitle>
          <CardDescription>Define your ideal job opportunities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Target Roles</Label>
            <div className="flex gap-2 mt-2 mb-3 flex-wrap">
              {targetRoles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                  <button onClick={() => removeTag(role, setTargetRoles, targetRoles)} className="ml-2">
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newRole, setTargetRoles, targetRoles);
                    setNewRole('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addTag(newRole, setTargetRoles, targetRoles);
                  setNewRole('');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Target Industries</Label>
            <div className="flex gap-2 mt-2 mb-3 flex-wrap">
              {targetIndustries.map((industry) => (
                <Badge key={industry} variant="secondary">
                  {industry}
                  <button onClick={() => removeTag(industry, setTargetIndustries, targetIndustries)} className="ml-2">
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add an industry"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newIndustry, setTargetIndustries, targetIndustries);
                    setNewIndustry('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addTag(newIndustry, setTargetIndustries, targetIndustries);
                  setNewIndustry('');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Target Locations</Label>
            <div className="flex gap-2 mt-2 mb-3 flex-wrap">
              {targetLocations.map((location) => (
                <Badge key={location} variant="secondary">
                  {location}
                  <button onClick={() => removeTag(location, setTargetLocations, targetLocations)} className="ml-2">
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newLocation, setTargetLocations, targetLocations);
                    setNewLocation('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addTag(newLocation, setTargetLocations, targetLocations);
                  setNewLocation('');
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Desired Salary Range</Label>
            <div className="pt-6 pb-2">
              <Slider
                min={0}
                max={300000}
                step={5000}
                value={salaryRange}
                onValueChange={(value) => {
                  setSalaryRange(value);
                  setHasUnsavedChanges(true);
                }}
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>${salaryRange[0].toLocaleString()}</span>
                <span>${salaryRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Work Authorization</Label>
              <Select defaultValue="us-citizen">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-citizen">US Citizen</SelectItem>
                  <SelectItem value="green-card">Green Card</SelectItem>
                  <SelectItem value="h1b">H1B</SelectItem>
                  <SelectItem value="opt">OPT</SelectItem>
                  <SelectItem value="require-sponsorship">Require Sponsorship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notice Period</Label>
              <Select defaultValue="2-weeks">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="2-weeks">2 Weeks</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="2-months">2 Months</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Open to Remote Work</Label>
              <p className="text-sm text-muted-foreground">Include remote positions in your job matches</p>
            </div>
            <Switch
              checked={openToRemote}
              onCheckedChange={(checked) => {
                setOpenToRemote(checked);
                setHasUnsavedChanges(true);
              }}
            />
          </div>

          <Button onClick={handleCareerPreferencesSave}>Save Career Preferences</Button>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Experience</CardTitle>
              <CardDescription>Your work history and accomplishments</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {profile?.experiences.map((exp) => (
            <div key={exp.id} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{exp.title}</h4>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate} • {exp.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm mb-2">{exp.description}</p>
              {exp.achievements.length > 0 && (
                <ul className="text-sm space-y-1">
                  {exp.achievements.map((achievement, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Education</CardTitle>
              <CardDescription>Your academic background</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {profile?.educations.map((edu) => (
            <div key={edu.id} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground">
                    {edu.institution} • {edu.field}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </p>
                  {edu.gpa && <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Your technical and soft skills</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['technical', 'soft', 'language', 'tool'].map((category) => {
              const categorySkills = profile?.skills.filter((s) => s.category === category) || [];
              if (categorySkills.length === 0) return null;

              return (
                <div key={category}>
                  <h5 className="text-sm font-medium mb-2 capitalize">{category} Skills</h5>
                  <div className="flex gap-2 flex-wrap">
                    {categorySkills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="gap-2">
                        {skill.name}
                        <span className="text-xs opacity-70">({skill.proficiency})</span>
                        <button className="ml-1 hover:text-destructive">×</button>
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Certifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>Your professional certifications and credentials</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {profile?.certifications.map((cert) => (
            <div key={cert.id} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  <p className="text-xs text-muted-foreground">
                    Issued {cert.issueDate}
                    {cert.expiryDate && ` • Expires ${cert.expiryDate}`}
                  </p>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      View Credential
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
