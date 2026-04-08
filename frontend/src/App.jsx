import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TasksPage from './pages/TasksPage';
import NotificationsPage from './pages/NotificationsPage';
import TeamPage from './pages/TeamPage';
import CalendarPage from './pages/CalendarPage';

// Profile page & sub-routes
import ProfilePage, { ProfileInfo } from './pages/ProfilePage';
import ActivityTab from './pages/profile/ActivityTab';

// AI Insights page & sub-tabs
import AIInsightsPage from './pages/AIInsightsPage';
import StandupTab from './pages/ai/StandupTab';
import RiskTab from './pages/ai/RiskTab';
import PrioritizeTab from './pages/ai/PrioritizeTab';
import GenerateTab from './pages/ai/GenerateTab';

// Project detail sub-tabs
import ProjectTasksTab from './pages/project/ProjectTasksTab';
import ProjectTeamTab from './pages/project/ProjectTeamTab';
import ProjectSettingsTab from './pages/project/ProjectSettingsTab';

// Reports page & sub-routes
import ReportsPage, { ReportsOverview, ReportsTasks, ReportsProjects } from './pages/ReportsPage';

// Settings page & sub-routes
import SettingsPage, { SettingsGeneral, SettingsNotifications, SettingsTeam } from './pages/SettingsPage';

// ── Outlet wrapper components ──
function ProjectTasksTabWrapper() {
  const ctx = useOutletContext();
  return <ProjectTasksTab {...ctx} />;
}
function ProjectTeamTabWrapper() {
  const ctx = useOutletContext();
  return <ProjectTeamTab project={ctx.project} />;
}
function ProjectSettingsTabWrapper() {
  const ctx = useOutletContext();
  return <ProjectSettingsTab project={ctx.project} onProjectUpdate={ctx.onProjectUpdate} />;
}
function StandupTabWrapper() {
  const { selectedProject, projects } = useOutletContext();
  return <StandupTab selectedProject={selectedProject} projects={projects} />;
}
function RiskTabWrapper() {
  const { selectedProject } = useOutletContext();
  return <RiskTab selectedProject={selectedProject} />;
}
function PrioritizeTabWrapper() {
  const { selectedProject } = useOutletContext();
  return <PrioritizeTab selectedProject={selectedProject} />;
}
function GenerateTabWrapper() {
  const { selectedProject, projects } = useOutletContext();
  return <GenerateTab selectedProject={selectedProject} projects={projects} />;
}
function ProfileInfoWrapper() {
  return <ProfileInfo />;
}
function ActivityTabWrapper() {
  const { user } = useOutletContext();
  return <ActivityTab user={user} />;
}

// ── Route Guards ──
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid var(--border-light)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

// ── All Routes ──
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Flat protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><AppLayout><ProjectsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><AppLayout><TasksPage /></AppLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><AppLayout><TeamPage /></AppLayout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><AppLayout><CalendarPage /></AppLayout></ProtectedRoute>} />

      {/* Project Detail — nested sub-tabs */}
      <Route path="/projects/:id" element={<ProtectedRoute><AppLayout><ProjectDetailPage /></AppLayout></ProtectedRoute>}>
        <Route index element={<Navigate to="tasks" replace />} />
        <Route path="tasks" element={<ProjectTasksTabWrapper />} />
        <Route path="team" element={<ProjectTeamTabWrapper />} />
        <Route path="settings" element={<ProjectSettingsTabWrapper />} />
      </Route>

      {/* AI Insights — nested sub-tabs */}
      <Route path="/ai-insights" element={<ProtectedRoute><AppLayout><AIInsightsPage /></AppLayout></ProtectedRoute>}>
        <Route index element={<Navigate to="standup" replace />} />
        <Route path="standup" element={<StandupTabWrapper />} />
        <Route path="risk" element={<RiskTabWrapper />} />
        <Route path="prioritize" element={<PrioritizeTabWrapper />} />
        <Route path="generate" element={<GenerateTabWrapper />} />
      </Route>

      {/* Profile — nested sub-tabs */}
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>}>
        <Route index element={<Navigate to="info" replace />} />
        <Route path="info" element={<ProfileInfoWrapper />} />
        <Route path="activity" element={<ActivityTabWrapper />} />
      </Route>

      {/* Reports — nested sub-tabs */}
      <Route path="/reports" element={<ProtectedRoute><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ReportsOverview />} />
        <Route path="tasks" element={<ReportsTasks />} />
        <Route path="projects" element={<ReportsProjects />} />
      </Route>

      {/* Settings — nested sub-tabs */}
      <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>}>
        <Route index element={<Navigate to="general" replace />} />
        <Route path="general" element={<SettingsGeneral />} />
        <Route path="notifications" element={<SettingsNotifications />} />
        <Route path="team" element={<SettingsTeam />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#FFFFFF',
                color: '#1A1033',
                border: '1px solid #E4E2F5',
                boxShadow: '0 8px 32px rgba(108,99,255,0.15)',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#6C63FF', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
