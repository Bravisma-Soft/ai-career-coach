import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, User, Settings, LogOut, LayoutDashboard, FileText, Briefcase, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setOpen(false);
    // Use hard redirect to ensure clean state reset and avoid race conditions
    window.location.href = '/login';
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Resume', path: '/resumes' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: MessageSquare, label: 'Interviews', path: '/interviews' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full pt-6">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          <Separator className="my-4" />

          {/* Account Actions */}
          <div className="space-y-1">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Profile</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors w-full text-left"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
