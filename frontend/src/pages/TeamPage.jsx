import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Users, Search, Shield, Mail, Crown, Code2 } from 'lucide-react';

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: Crown, class: 'text-red-400 bg-red-500/10 border-red-500/20' },
  manager: { label: 'Manager', icon: Shield, class: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  developer: { label: 'Developer', icon: Code2, class: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
};

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    authAPI.getAllUsers().then((data) => {
      setUsers(data.users || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-3">
            <Users size={22} className="text-violet-400" />Team
          </h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} members</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* Team grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user) => {
            const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.developer;
            const RoleIcon = role.icon;
            return (
              <div key={user._id} className="glass rounded-2xl p-5 card-hover">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <Mail size={11} />{user.email}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 ${role.class}`}>
                    <RoleIcon size={11} />{role.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {user.projects?.length || 0} projects
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
