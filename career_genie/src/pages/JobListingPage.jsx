import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/useJobs';
import { useAuth } from '../context/useAuth';
import { useApplications } from '../context/useApplications';
import { Search, MapPin, DollarSign, Calendar, ChevronRight, Sparkles } from 'lucide-react';

export default function JobListingPage() {
  const { jobs, calculateMatchScore } = useJobs();
  const { user } = useAuth();
  const { applications } = useApplications();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleType, setRoleType] = useState('All'); // All, Full-time, Internship
  const [skillFilter, setSkillFilter] = useState('All'); // All, React, Python, Figma, Node.js
  const [matchScoreMin, setMatchScoreMin] = useState(0); // 0, 50, 70

  // Filter logic
  const activeJobs = jobs.filter(job => job.status === 'active');
  const userSkills = user?.role === 'student' ? user.skills : [];

  const filteredJobs = activeJobs
    .map(job => {
      const matchScore = calculateMatchScore(job.skills, userSkills);
      return { ...job, matchScore };
    })
    .filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = roleType === 'All' || job.type === roleType;
      
      const matchesSkill = skillFilter === 'All' || job.skills.some(s => s.toLowerCase() === skillFilter.toLowerCase());
      
      const matchesMatchScore = job.matchScore >= matchScoreMin;

      return matchesSearch && matchesType && matchesSkill && matchesMatchScore;
    });

  // Get active applications for checking applied status
  const studentApps = applications.filter(app => app.studentId === user?.id);

  return (
    <div className="py-10 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 text-left space-y-8">
      {/* Title */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-display font-black text-white">Find Opportunities</h1>
        <p className="text-sm text-gray-400">Discover full-time roles and internships aligned with your technical skillset.</p>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="glass-panel-card p-6 rounded-2xl border border-white/5 space-y-4">
        
        {/* Search */}
        <div className="relative text-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by job title, company, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Role Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-400 uppercase tracking-wider block">Role Type</label>
            <select 
              value={roleType} onChange={(e) => setRoleType(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time Job</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Skill Tag */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-400 uppercase tracking-wider block">Core Skill</label>
            <select 
              value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Skills</option>
              <option value="React">React</option>
              <option value="Python">Python</option>
              <option value="Figma">Figma</option>
              <option value="Node.js">Node.js</option>
            </select>
          </div>

          {/* Match Score */}
          {user?.role === 'student' && (
            <div className="space-y-1.5">
              <label className="font-bold text-gray-400 uppercase tracking-wider block">AI Match Rating</label>
              <select 
                value={matchScoreMin} onChange={(e) => setMatchScoreMin(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="0">Show All Matches</option>
                <option value="50">50% + Match rating</option>
                <option value="70">70% + Match rating</option>
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Results grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Showing {filteredJobs.length} opportunities</span>
          <span>Filtered by preference</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => {
            const isApplied = studentApps.some(app => app.jobId === job.id);
            const appliedStatus = studentApps.find(app => app.jobId === job.id)?.status;
            
            return (
              <div 
                key={job.id}
                className="glass-panel-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                {/* Details layout */}
                <div className="flex items-start gap-4 flex-grow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg flex-shrink-0 ${job.logoBg}`}>
                    {job.logo}
                  </div>
                  <div className="space-y-1.5 text-xs text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white leading-none">{job.title}</h3>
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] text-gray-400 font-semibold uppercase">{job.type}</span>
                      {isApplied && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                          Applied: {appliedStatus}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 font-semibold">{job.company}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{job.salary}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Deadline: {job.deadline}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2">
                      {job.skills.map((skill) => (
                        <span key={skill} className="bg-white/3 border border-white/5 rounded px-2 py-0.5 text-[9px] text-gray-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compatibility scoring alignment panel */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-0 border-white/5 pt-4 md:pt-0">
                  {user?.role === 'student' && (
                    <div className="text-left md:text-right">
                      <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold text-[9px]">Compatibility</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-lg font-black ${
                          job.matchScore >= 80 ? 'text-indigo-400' :
                          job.matchScore >= 60 ? 'text-purple-400' :
                          'text-blue-400'
                        }`}>
                          {job.matchScore}%
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </div>
                  )}

                  <Link 
                    to={`/jobs/${job.id}`}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-gray-500 italic text-xs">
              No jobs match the active search and filter constraints.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
