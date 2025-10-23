import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MobileMenu } from '@/components/MobileMenu';
import { Briefcase, User, LogOut, Settings } from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Use hard redirect to ensure clean state reset and avoid race conditions
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Career Coach
          </span>
        </Link>

        <nav className="flex items-center space-x-2 md:space-x-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hidden md:block text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link to="/resumes" className="hidden md:block text-sm font-medium transition-colors hover:text-primary">
                Resume
              </Link>
              <Link to="/jobs" className="hidden md:block text-sm font-medium transition-colors hover:text-primary">
                Jobs
              </Link>
              <Link to="/interviews" className="hidden md:block text-sm font-medium transition-colors hover:text-primary">
                Interviews
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:flex">
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <MobileMenu />
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="hero" size="sm" className="md:size-default">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
