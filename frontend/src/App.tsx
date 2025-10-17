import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

// Lazy load pages for performance
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Resumes = lazy(() => import("./pages/Resumes"));
const Interviews = lazy(() => import("./pages/Interviews"));
const InterviewDetail = lazy(() => import("./pages/InterviewDetail"));
const MockInterview = lazy(() => import("./pages/MockInterview"));
const MockInterviewResults = lazy(() => import("./pages/MockInterviewResults"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const StyleGuide = lazy(() => import("./pages/StyleGuide"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col pb-16 md:pb-0">
              <Header />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                <Route 
                  path="/" 
                  element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} 
                />
                <Route 
                  path="/login" 
                  element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
                />
                <Route 
                  path="/register" 
                  element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Placeholder routes for navigation */}
                <Route
                  path="/resumes"
                  element={
                    <ProtectedRoute>
                      <Resumes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviews"
                  element={
                    <ProtectedRoute>
                      <Interviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviews/:id"
                  element={
                    <ProtectedRoute>
                      <InterviewDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviews/mock/:id"
                  element={
                    <ProtectedRoute>
                      <MockInterview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interviews/mock/:sessionId/results"
                  element={
                    <ProtectedRoute>
                      <MockInterviewResults />
                    </ProtectedRoute>
                  }
                />
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute>
                    <div className="container py-8">
                      <h1 className="text-3xl font-bold">Job Tracker</h1>
                      <p className="text-muted-foreground mt-2">Coming soon...</p>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/style-guide"
                element={
                  <ProtectedRoute>
                    <StyleGuide />
                  </ProtectedRoute>
                }
              />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              {isAuthenticated && <MobileNav />}
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
