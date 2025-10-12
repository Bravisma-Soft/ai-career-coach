import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useProfileStore } from '@/store/profileStore';
import { profileService } from '@/services/profileService';
import { useNavigate } from 'react-router-dom';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function Settings() {
  const navigate = useNavigate();
  const { notificationSettings, privacySettings, setNotificationSettings, setPrivacySettings } = useProfileStore();
  const [isLoading, setIsLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState({
    applicationUpdates: true,
    interviewReminders: true,
    jobMatches: true,
    weeklyDigest: false,
  });
  const [pushNotifications, setPushNotifications] = useState({
    applicationUpdates: true,
    interviewReminders: true,
    jobMatches: false,
    weeklyDigest: false,
  });
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'connections'>('public');
  const [dataRetention, setDataRetention] = useState<'standard' | 'extended'>('standard');

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (notificationSettings) {
      setEmailNotifications(notificationSettings.emailNotifications);
      setPushNotifications(notificationSettings.pushNotifications);
    }
  }, [notificationSettings]);

  useEffect(() => {
    if (privacySettings) {
      setProfileVisibility(privacySettings.profileVisibility);
      setDataRetention(privacySettings.dataRetention);
    }
  }, [privacySettings]);

  const loadSettings = async () => {
    try {
      const [notifications, privacy] = await Promise.all([
        profileService.fetchNotificationSettings(),
        profileService.fetchPrivacySettings(),
      ]);
      setNotificationSettings(notifications);
      setPrivacySettings(privacy);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await profileService.changePassword(data.currentPassword, data.newPassword);
      passwordForm.reset();
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      const updated = await profileService.updateNotificationSettings({
        emailNotifications,
        pushNotifications,
      });
      setNotificationSettings(updated);
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handlePrivacyUpdate = async () => {
    try {
      const updated = await profileService.updatePrivacySettings({
        profileVisibility,
        dataRetention,
      });
      setPrivacySettings(updated);
      toast.success('Privacy settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await profileService.exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await profileService.deleteAccount();
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    }
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
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit">Change Password</Button>
              </form>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>Permanently delete your account and all associated data</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our
                      servers, including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Your profile and personal information</li>
                        <li>All resumes and cover letters</li>
                        <li>Job applications and interview history</li>
                        <li>All saved preferences and settings</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what email notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Application Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about changes to your applications</p>
                </div>
                <Switch
                  checked={emailNotifications.applicationUpdates}
                  onCheckedChange={(checked) =>
                    setEmailNotifications({ ...emailNotifications, applicationUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Interview Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders before scheduled interviews</p>
                </div>
                <Switch
                  checked={emailNotifications.interviewReminders}
                  onCheckedChange={(checked) =>
                    setEmailNotifications({ ...emailNotifications, interviewReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>New Job Matches</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new jobs match your preferences</p>
                </div>
                <Switch
                  checked={emailNotifications.jobMatches}
                  onCheckedChange={(checked) => setEmailNotifications({ ...emailNotifications, jobMatches: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of your job search activity</p>
                </div>
                <Switch
                  checked={emailNotifications.weeklyDigest}
                  onCheckedChange={(checked) => setEmailNotifications({ ...emailNotifications, weeklyDigest: checked })}
                />
              </div>

              <Button onClick={handleNotificationUpdate}>Save Email Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Manage push notifications for your browser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Application Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about changes to your applications</p>
                </div>
                <Switch
                  checked={pushNotifications.applicationUpdates}
                  onCheckedChange={(checked) =>
                    setPushNotifications({ ...pushNotifications, applicationUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Interview Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders before scheduled interviews</p>
                </div>
                <Switch
                  checked={pushNotifications.interviewReminders}
                  onCheckedChange={(checked) =>
                    setPushNotifications({ ...pushNotifications, interviewReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>New Job Matches</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new jobs match your preferences</p>
                </div>
                <Switch
                  checked={pushNotifications.jobMatches}
                  onCheckedChange={(checked) => setPushNotifications({ ...pushNotifications, jobMatches: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of your job search activity</p>
                </div>
                <Switch
                  checked={pushNotifications.weeklyDigest}
                  onCheckedChange={(checked) => setPushNotifications({ ...pushNotifications, weeklyDigest: checked })}
                />
              </div>

              <Button onClick={handleNotificationUpdate}>Save Push Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Download a copy of all your data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Visibility</CardTitle>
              <CardDescription>Control who can see your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Visibility Setting</Label>
                <Select value={profileVisibility} onValueChange={(value: any) => setProfileVisibility(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can view</SelectItem>
                    <SelectItem value="connections">Connections Only</SelectItem>
                    <SelectItem value="private">Private - Hidden from search</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePrivacyUpdate}>Save Visibility Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
              <CardDescription>Manage how long we keep your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Retention Period</Label>
                <Select value={dataRetention} onValueChange={(value: any) => setDataRetention(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard - Delete inactive data after 2 years</SelectItem>
                    <SelectItem value="extended">Extended - Keep all data indefinitely</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePrivacyUpdate}>Save Retention Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You're currently on the Free plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Free Plan</h3>
                    <p className="text-sm text-muted-foreground">Basic features for job seekers</p>
                  </div>
                  <div className="text-2xl font-bold">$0/mo</div>
                </div>

                <div className="space-y-2 text-sm">
                  <p>✓ Up to 3 resumes</p>
                  <p>✓ Basic AI assistance</p>
                  <p>✓ Job tracking</p>
                  <p>✓ Interview preparation</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Usage This Month</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Resumes Created</span>
                    <span>1 / 3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Requests</span>
                    <span>12 / 50</span>
                  </div>
                </div>
              </div>

              <Button disabled>
                Upgrade to Pro (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
