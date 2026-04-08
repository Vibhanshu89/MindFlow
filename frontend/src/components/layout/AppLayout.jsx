import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CreateProjectModal from '../common/CreateProjectModal';

export default function AppLayout({ children }) {
  const [showCreateProject, setShowCreateProject] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 260, overflow: 'hidden' }}>
        <Navbar onCreateProject={() => setShowCreateProject(true)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }} className="page-enter">
          {children}
        </main>
      </div>
      {showCreateProject && (
        <CreateProjectModal onClose={() => setShowCreateProject(false)} />
      )}
    </div>
  );
}
