import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useJobs } from '../context/useJobs';
import { Users, Briefcase, FileText, Check, X, Activity, CheckCircle2 } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const { jobs, approveJob, rejectJob } = useJobs();

  // Admin states for managing users
  const [mockUsers, setMockUsers] = useState([
    { id: 'usr_student', name: 'Olivia Chen', email: 'olivia@gmail.com', role: 'student', details: 'Resume Score: 84%' },
    { id: 'usr_recruiter', name: 'David Miller', email: 'david@stripe.com', role: 'recruiter', details: 'Company: Stripe' },
    { id: 'usr_admin', name: 'Alex Mercer', email: 'admin@careergenie.com', role: 'admin', details: 'System Overseer' },
    { id: 'usr_mock_stud_2', name: 'James Carter', email: 'james@gmail.com', role: 'student', details: 'Resume Score: 62%' },
    { id: 'usr_mock_rec_2', name: 'Sarah Patel', email: 'sarah@google.com', role: 'recruiter', details: 'Company: Google' }
  ]);

  const [notification, setNotification] = useState('');

  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5178';
    fetch(`${API_BASE}/api/admin/analytics`).then(res => res.json()).then(data => {
      setAnalytics(data);
    }).catch(() => {});
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="py-20 text-center text-xs">
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400 mb-6">Please log in as an administrator to access this panel.</p>
      </div>
    );
  }

  // Filter pending jobs
  const pendingJobs = jobs.filter(job => job.status === 'pending_approval');

  const handleApproveJob = (jobId) => {
    approveJob(jobId);
    setNotification('Job opportunity approved and activated successfully.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleRejectJob = (jobId) => {
    rejectJob(jobId);
    setNotification('Job opportunity has been archived/rejected.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleRoleChange = (userId, newRole) => {
    setMockUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    setNotification(`User role updated to ${newRole}.`);
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="py-10 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 text-left space-y-8">
      {/* Title */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-display font-black text-white">Admin Control Panel</h1>
        <p className="text-sm text-gray-400">Oversee platform activities, moderate job listings, and inspect analytics.</p>
      </div>

      {notification && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-4 rounded-xl font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(analytics ? [
          { label: 'Total Users Registered', value: analytics.totalUsers.toLocaleString(), desc: `${analytics.newUsersToday} new today`, icon: <Users className="w-4 h-4 text-indigo-400" /> },
          { label: 'Total Resume Uploads', value: analytics.resumeUploads.toLocaleString(), desc: `${analytics.avgResumeScore}% average`, icon: <FileText className="w-4 h-4 text-purple-400" /> },
          { label: 'Active Placements', value: analytics.totalJobs.toLocaleString(), desc: `${analytics.pendingJobs} pending approval`, icon: <Briefcase className="w-4 h-4 text-rose-400" /> },
          { label: 'System Performance', value: analytics.systemPerformance, desc: `API Response ${analytics.apiResponseMs}ms`, icon: <Activity className="w-4 h-4 text-emerald-400" /> }
        ] : [
          { label: 'Total Users Registered', value: '—', desc: 'loading...', icon: <Users className="w-4 h-4 text-indigo-400" /> },
          { label: 'Total Resume Uploads', value: '—', desc: 'loading...', icon: <FileText className="w-4 h-4 text-purple-400" /> },
          { label: 'Active Placements', value: '—', desc: 'loading...', icon: <Briefcase className="w-4 h-4 text-rose-400" /> },
          { label: 'System Performance', value: '—', desc: 'loading...', icon: <Activity className="w-4 h-4 text-emerald-400" /> }
        ]).map((stat, i) => (
          <div key={i} className="glass-panel-card p-5 rounded-2xl border border-white/5 space-y-2 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">{stat.label}</span>
              {stat.icon}
            </div>
            <span className="text-2xl font-black text-white block">{stat.value}</span>
            <span className="text-[10px] text-gray-400 block">{stat.desc}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: User Role Moderation Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Registered Users Moderation</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-white/5 pb-2">
                    <th className="pb-3 font-semibold">User Details</th>
                    <th className="pb-3 font-semibold">Current Role</th>
                    <th className="pb-3 font-semibold text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((userItem) => (
                    <tr key={userItem.id} className="border-b border-white/5 last:border-0 hover:bg-white/1 bg-transparent transition-colors">
                      <td className="py-3">
                        <div>
                          <span className="block font-semibold text-white">{userItem.name}</span>
                          <span className="text-[10px] text-gray-500">{userItem.email} • {userItem.details}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          userItem.role === 'admin' ? 'bg-rose-500/10 text-rose-400' :
                          userItem.role === 'recruiter' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <select 
                          value={userItem.role}
                          onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                          className="bg-slate-900 border border-white/10 rounded-lg p-1.5 text-[10px] text-gray-300 focus:outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Column: Pending Job Approvals moderation panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Pending Job Approvals ({pendingJobs.length})</h3>
            
            <div className="flex flex-col gap-3">
              {pendingJobs.map((job) => (
                <div key={job.id} className="p-3 bg-white/2 border border-white/5 rounded-xl text-xs space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-white leading-tight">{job.title}</h4>
                      <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] text-gray-400 font-semibold uppercase">{job.type}</span>
                    </div>
                    <p className="text-indigo-400 font-semibold text-[10px]">{job.company} • {job.location}</p>
                    <p className="text-gray-500 text-[10px] truncate">{job.description}</p>
                  </div>

                  <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
                    <button 
                      onClick={() => handleRejectJob(job.id)}
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg transition"
                      title="Reject/Archive Opportunity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleApproveJob(job.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 text-[10px]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Job</span>
                    </button>
                  </div>
                </div>
              ))}

              {pendingJobs.length === 0 && (
                <div className="text-center py-6 text-gray-500 italic text-xs">
                  No job approvals currently pending.
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
