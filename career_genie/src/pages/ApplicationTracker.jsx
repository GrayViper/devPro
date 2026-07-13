import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../context/ApplicationsContext';
import { 
  CheckSquare, Clock, ShieldCheck, Mail, ArrowRight, Check, 
  ChevronRight, Calendar, Sparkles, MessageCircle, AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApplicationTracker() {
  const { user } = useAuth();
  const { applications } = useApplications();
  const [selectedAppId, setSelectedAppId] = useState(null);

  if (!user || user.role !== 'student') {
    return (
      <div className="py-20 text-center text-xs">
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400 mb-6">Please log in as a student to track applications.</p>
      </div>
    );
  }

  const studentApps = applications.filter(app => app.studentId === user.id);
  const activeApp = studentApps.find(app => app.id === selectedAppId) || studentApps[0];

  // Map status names to stepper stages for visual representation
  const stages = ['Applied', 'Review', 'Interview', 'Outcome'];
  
  const getStageIndex = (status) => {
    if (status === 'Applied') return 0;
    if (status === 'Review') return 1;
    if (status === 'Interview') return 2;
    if (status === 'Offer' || status === 'Rejected') return 3;
    return 0;
  };

  return (
    <div className="py-10 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 text-left space-y-8">
      {/* Title */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-display font-black text-white">Application Tracker</h1>
        <p className="text-sm text-gray-400">Track and monitor the status of your applications in real-time.</p>
      </div>

      {studentApps.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Panel: Applications List */}
          <div className="lg:col-span-1 space-y-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Submitted Applications ({studentApps.length})</span>
            
            <div className="flex flex-col gap-3">
              {studentApps.map((app) => {
                const isActive = activeApp?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-4 rounded-xl border text-xs text-left cursor-pointer transition select-none flex justify-between items-center ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-950/20 shadow-md' 
                        : 'border-white/5 bg-white/2 hover:border-white/10'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-white text-[9px] ${app.logoBg}`}>
                          {app.logo}
                        </span>
                        <h4 className="font-semibold text-white truncate max-w-[130px]">{app.jobTitle}</h4>
                      </div>
                      <p className="text-gray-400 font-medium">{app.company}</p>
                      <p className="text-[10px] text-gray-500">Applied: {app.date}</p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${
                        app.status === 'Offer' ? 'bg-emerald-500/10 text-emerald-400' :
                        app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                        app.status === 'Interview' ? 'bg-purple-500/10 text-purple-400' :
                        app.status === 'Review' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {app.status}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-400">{app.matchScore}% match</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Active Application Progress Tracker */}
          {activeApp && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card Container */}
              <div className="glass-panel-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-8">
                
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base ${activeApp.logoBg}`}>
                      {activeApp.logo}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-white leading-none">{activeApp.jobTitle}</h3>
                      <p className="text-gray-400 font-semibold">{activeApp.company} • Applied: {activeApp.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">Match score: <strong className="text-indigo-400">{activeApp.matchScore}%</strong></span>
                    <Link 
                      to={`/jobs/${activeApp.jobId}`}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg font-semibold transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Progress Stepper Visualizer */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Application Progress</span>
                  
                  <div className="flex items-center justify-between relative px-2 py-4">
                    {/* Background Bar */}
                    <div className="absolute left-8 right-8 top-[36px] h-0.5 bg-white/5 z-0"></div>
                    
                    {/* Active Filled Bar */}
                    <div 
                      className="absolute left-8 top-[36px] h-0.5 bg-indigo-500 z-0 transition-all duration-500"
                      style={{
                        width: `${(getStageIndex(activeApp.status) / (stages.length - 1)) * 90}%`
                      }}
                    ></div>

                    {stages.map((stage, index) => {
                      const curIndex = getStageIndex(activeApp.status);
                      const isCompleted = index < curIndex;
                      const isActive = index === curIndex;
                      
                      let displayStatus = stage;
                      if (stage === 'Outcome') {
                        if (activeApp.status === 'Offer') displayStatus = 'Offer Extended';
                        else if (activeApp.status === 'Rejected') displayStatus = 'Outcome (Rejected)';
                        else displayStatus = 'Final Outcome';
                      }

                      return (
                        <div key={stage} className="flex flex-col items-center z-10 relative text-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition duration-300 font-semibold text-xs ${
                            isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' :
                            isActive ? (
                              activeApp.status === 'Rejected' 
                                ? 'bg-rose-500 border-rose-500 text-white animate-pulse' 
                                : activeApp.status === 'Offer' 
                                  ? 'bg-emerald-500 border-emerald-500 text-white animate-pulse'
                                  : 'bg-indigo-650 border-indigo-500 text-white animate-pulse'
                            ) : 'bg-slate-950 border-white/10 text-gray-500'
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
                          </div>
                          <span className={`text-[10px] font-bold mt-2.5 tracking-wider uppercase ${
                            isActive ? 'text-white' : 'text-gray-500'
                          }`}>
                            {displayStatus}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking Logs History */}
                <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status History Logs</span>
                  
                  <div className="flex flex-col gap-4 pl-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                    {activeApp.history.map((log, i) => (
                      <div key={i} className="flex items-start gap-4 relative">
                        {/* Dot indicator */}
                        <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 flex-shrink-0 flex items-center justify-center z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        </div>
                        
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white">{log.status} Log</span>
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{log.date}</span>
                            </span>
                          </div>
                          <p className="text-gray-400 leading-relaxed">{log.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl border border-white/5 text-center flex flex-col justify-center items-center max-w-md mx-auto text-gray-500">
          <CheckSquare className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm font-semibold mb-1 text-gray-400">No Applications Submitted</p>
          <p className="text-xs leading-relaxed mb-6">
            Find technical opportunities, match your resume profile keywords, and apply to track updates.
          </p>
          <Link to="/jobs" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition">
            Explore Opportunities
          </Link>
        </div>
      )}
    </div>
  );
}
