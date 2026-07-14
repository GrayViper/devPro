import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useJobs } from '../context/useJobs';
import { useApplications } from '../context/useApplications';
import { FileText, Briefcase, ChevronRight, ArrowUpRight, Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';

export default function StudentDashboard() {
  const { user, updateUserProfile } = useAuth();
  const { jobs, calculateMatchScore } = useJobs();
  const { applications } = useApplications();
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedMajor, setEditedMajor] = useState(user?.major || 'Computer Science');
  const [editedGradYear, setEditedGradYear] = useState(user?.graduationYear || 2026);
  const [newSkill, setNewSkill] = useState('');

  if (!user || user.role !== 'student') {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
        <p className="text-gray-400 mb-6">Please log in as a student to access this dashboard.</p>
        <button onClick={() => navigate('/login')} className="bg-indigo-600 px-6 py-2 rounded-lg text-white font-semibold">
          Go to Login
        </button>
      </div>
    );
  }

  // Get active applications for this user
  const studentApps = applications.filter(app => app.studentId === user.id);

  // Filter jobs that are active, and calculate match scores
  const matchedJobs = jobs
    .filter(job => job.status === 'active')
    .map(job => {
      const matchScore = calculateMatchScore(job.skills, user.skills);
      return { ...job, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3); // top 3 matches

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({
      major: editedMajor,
      graduationYear: parseInt(editedGradYear)
    });
    setIsEditingProfile(false);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !user.skills.includes(newSkill.trim())) {
      const updatedSkills = [...user.skills, newSkill.trim()];
      updateUserProfile({ skills: updatedSkills });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = user.skills.filter(s => s !== skillToRemove);
    updateUserProfile({ skills: updatedSkills });
  };

  return (
    <div className="py-10 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 text-left space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-display font-black text-white">Welcome back, {user.name}!</h1>
          <p className="text-sm text-gray-400">Here's your career trajectory at a glance.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/resume" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/10"
          >
            <FileText className="w-4 h-4" />
            <span>AI Resume Reviewer</span>
          </Link>
          <Link 
            to="/jobs" 
            className="glass-panel text-white hover:text-white border border-white/10 hover:border-white/20 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Briefcase className="w-4 h-4" />
            <span>Explore Internships</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card & Skill Tag Editor */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass-panel-card p-6 rounded-2xl border border-white/5 space-y-5">
            <div className="flex justify-between items-start">
              <h3 className="font-display font-bold text-lg text-white">Academic Details</h3>
              <button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-indigo-400 hover:text-indigo-300 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Major</label>
                  <input 
                    type="text" 
                    value={editedMajor} 
                    onChange={(e) => setEditedMajor(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Graduation Year</label>
                  <input 
                    type="number" 
                    value={editedGradYear} 
                    onChange={(e) => setEditedGradYear(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white">Save</button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="bg-white/5 px-3 py-1.5 rounded-lg text-[10px] text-gray-400">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Degree & Major</span>
                  <span className="text-white font-medium">{user.major || 'Computer Science'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Expected Graduation</span>
                  <span className="text-white font-medium">Class of {user.graduationYear || '2026'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Skills Editor Card */}
          <div className="glass-panel-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-display font-bold text-lg text-white">My Skills & Keywords</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              These keywords are extracted from your resume and matched against jobs. Add/delete skills to view updated compatibility scores.
            </p>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Docker, PyTorch" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-grow bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg text-white transition">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {user.skills?.map((skill) => (
                <span 
                  key={skill}
                  className="bg-white/5 border border-white/5 rounded-full px-2.5 py-1 text-xs text-gray-300 flex items-center gap-1 hover:border-rose-500/20 hover:text-white transition group"
                >
                  <span>{skill}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSkill(skill)}
                    className="opacity-40 group-hover:opacity-100 text-gray-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(!user.skills || user.skills.length === 0) && (
                <span className="text-xs text-gray-500 italic">No skills listed yet. Add skills or upload a resume.</span>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right Columns: Resume AI Insights, Applications, and Job Matches */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Resume AI Summary Card */}
          <div className="glass-panel-card p-6 rounded-2xl border border-white/5">
            {user.resumeUploaded ? (
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-grow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">AI Resume Analysis</h3>
                      <p className="text-[10px] text-gray-400 font-mono">{user.resumeName}</p>
                    </div>
                  </div>
                  
                  {/* Actionable recommendations */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Top Recommendation</span>
                    <p className="text-xs text-gray-300 flex items-start gap-1.5 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{user.feedback?.suggestions[0]}</span>
                    </p>
                  </div>
                  
                  <Link 
                    to="/resume" 
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 pt-2 transition-colors"
                  >
                    <span>View full analysis report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Circular Score Gauge */}
                <div className="flex flex-col items-center justify-center flex-shrink-0 bg-slate-900/40 p-4 rounded-xl border border-white/5">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                      <circle 
                        cx="48" cy="48" r="40" 
                        stroke="#6366f1" strokeWidth="8" fill="transparent" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * user.resumeScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-white leading-none">{user.resumeScore}%</span>
                      <span className="text-[9px] text-indigo-400 uppercase font-bold mt-0.5">Rating</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold mt-3">Overall Strength</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <FileText className="w-12 h-12 text-gray-500 mx-auto" />
                <div>
                  <h3 className="font-display font-bold text-lg text-white">No Resume Uploaded</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                    Upload your resume to get instant NLP parsing, compatibility suggestions, and accurate matching alignment scores.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/resume')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  Upload Resume
                </button>
              </div>
            )}
          </div>

          {/* Job matches summary */}
          <div className="glass-panel-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-white">Top Personalized Matches</h3>
              <Link to="/jobs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 transition-colors">
                <span>View all listings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchedJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="glass-panel p-4 rounded-xl border border-white/5 hover:border-indigo-500/20 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-white text-[10px] ${job.logoBg}`}>
                        {job.logo}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        job.matchScore >= 80 ? 'bg-indigo-500/10 text-indigo-400' :
                        job.matchScore >= 60 ? 'bg-purple-500/10 text-purple-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {job.matchScore}% Match
                      </span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white truncate">{job.title}</h4>
                      <p className="text-[10px] text-gray-400">{job.company} • {job.type}</p>
                    </div>
                  </div>
                  <Link 
                    to={`/jobs/${job.id}`}
                    className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 mt-4 transition-colors"
                  >
                    <span>View compatibility details</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Active applications tracking card */}
          <div className="glass-panel-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-white">Active Applications ({studentApps.length})</h3>
              <Link to="/applications" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 transition-colors">
                <span>Open Application Tracker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            {studentApps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-white/5">
                      <th className="pb-3 font-semibold">Company & Role</th>
                      <th className="pb-3 font-semibold">Date Applied</th>
                      <th className="pb-3 font-semibold">Match Score</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentApps.map((app) => (
                      <tr key={app.id} className="border-b border-white/5 last:border-0 hover:bg-white/1 bg-transparent transition-colors">
                        <td className="py-3.5 font-semibold text-white flex items-center gap-2">
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-white text-[9px] ${app.logoBg}`}>
                            {app.logo}
                          </span>
                          <div>
                            <span className="block font-semibold">{app.jobTitle}</span>
                            <span className="text-[10px] text-gray-500">{app.company}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-gray-400">{app.date}</td>
                        <td className="py-3.5">
                          <span className="font-semibold text-indigo-400">{app.matchScore}%</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${
                            app.status === 'Offer' ? 'bg-emerald-500/10 text-emerald-400' :
                            app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                            app.status === 'Interview' ? 'bg-purple-500/10 text-purple-400' :
                            app.status === 'Review' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500 italic">
                No active applications. Explore available jobs and submit an application.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
