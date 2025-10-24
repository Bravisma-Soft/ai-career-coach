import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * OAuth Callback Handler
 * This page receives the OAuth tokens from the backend redirect
 * and stores them in the auth store before redirecting to the dashboard
 */
export const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      // Extract tokens from URL params
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const expiresIn = searchParams.get('expiresIn');
      const userId = searchParams.get('userId');
      const email = searchParams.get('email');
      const error = searchParams.get('error');

      // Check for errors
      if (error) {
        toast.error('Authentication failed', {
          description: getErrorMessage(error),
        });
        navigate('/login');
        return;
      }

      // Validate tokens
      if (!accessToken || !refreshToken || !userId || !email) {
        toast.error('Authentication failed', {
          description: 'Missing authentication credentials',
        });
        navigate('/login');
        return;
      }

      try {
        // Create user object from URL params
        const user = {
          id: userId,
          email: decodeURIComponent(email),
          firstName: null,
          lastName: null,
          role: 'USER' as const,
          status: 'ACTIVE' as const,
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };

        // Create tokens object
        const tokens = {
          accessToken: decodeURIComponent(accessToken),
          refreshToken: decodeURIComponent(refreshToken),
          expiresIn: parseInt(expiresIn || '86400', 10),
        };

        // Store auth data
        setAuth(user, tokens);

        // Show success toast
        toast.success('Welcome!', {
          description: 'You have successfully signed in with Google.',
        });

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication failed', {
          description: 'Failed to process authentication',
        });
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl">Completing Sign In</CardTitle>
          <CardDescription>Please wait while we complete your authentication...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Get user-friendly error message for OAuth errors
 */
function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    oauth_failed: 'Google authentication failed. Please try again.',
    authentication_failed: 'Authentication failed. Please try again.',
    token_generation_failed: 'Failed to generate authentication tokens. Please try again.',
  };

  return errorMessages[error] || 'An unexpected error occurred. Please try again.';
}

export default OAuthCallback;
