import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, Shield, Briefcase, FileText, ArrowRight, Check, Award, ArrowUpRight 
} from 'lucide-react';

const CHART_NODES_DATA = [
  { cx: 40, cy: 130, date: 'May 21, 2026', info: 'Tooling Setup: Skill score +10' },
  { cx: 136, cy: 90, date: 'Jun 14, 2026', info: 'React & JS Completed' },
  { cx: 232, cy: 105, date: 'Jul 23, 2026', info: 'UX Fundamentals Certificate' },
  { cx: 328, cy: 60, date: 'Aug 23, 2026', info: 'Node.js Backend Added' },
  { cx: 424, cy: 50, date: 'Sep 25, 2026', info: 'System Audit completed' },
  { cx: 520, cy: 25, date: 'Oct 12, 2026', info: 'AI Matching Score Reached 98%' }
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleStartGrowth = () => {
    if (user) {
      if (user.role === 'student') navigate('/dashboard/student');
      else if (user.role === 'recruiter') navigate('/dashboard/recruiter');
      else if (user.role === 'admin') navigate('/admin');
    } else {
      navigate('/signup');
    }
  };

  const handleViewDemo = () => {
    const el = document.getElementById('demo-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-overlay opacity-80 pointer-events-none z-0"></div>
      
      {/* Background blobs */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blob-purple opacity-60 blur-3xl pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blob-blue opacity-50 blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>NEW: AI-POWERED RESUME ANALYZER</span>
        </div>
        
        <h1 className="mb-6 font-display text-5xl font-black leading-none tracking-tight text-white sm:text-7xl">
          Your career, <span className="text-gradient-purple">in focus.</span>
        </h1>
        
        <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-xl">
          Transform your professional journey with precision-engineered AI tools for resume feedback, interview preparation, and hyper-personalized job matching.
        </p>
        
        <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button 
            onClick={handleStartGrowth}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 sm:w-auto"
          >
            <span>Start Your Growth</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <button 
            onClick={handleViewDemo}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 sm:w-auto"
          >
            <span>View Demo</span>
          </button>
        </div>

        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
          {[
            { label: 'Resume Match Score', value: '98%' },
            { label: 'Active Opportunities', value: '1.2k+' },
            { label: 'Placement Success', value: '4.9/5' }
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-left shadow-lg shadow-black/10 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">{stat.label}</div>
              <div className="mt-1 text-xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Mockup Dashboard Section */}
      <section id="demo-section" className="py-12 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 z-10 relative">
        <div className="glass-panel-card p-2 rounded-2xl border border-white/10 shadow-2xl bg-slate-950/40">
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-white/5 shadow-inner">
            
            {/* Window bar */}
            <div className="bg-slate-900 px-4 py-3 flex items-center gap-6 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
              </div>
              <div className="bg-slate-950/80 rounded-md py-1 px-4 text-xs text-gray-500 border border-white/5 flex-grow max-w-md mx-auto text-center font-mono">
                careergenie.com/dashboard/student
              </div>
            </div>

            {/* Simulated Desktop Window Workspace */}
            <div className="flex min-h-[450px] flex-col lg:flex-row">
              {/* Mock Sidebar */}
              <aside className="w-full lg:w-60 bg-slate-950 border-r border-white/5 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 px-2 text-white font-bold text-sm">
                  <div className="w-5 h-5 bg-indigo-500 rounded text-xs flex items-center justify-center">G</div>
                  <span>CAREERGENIE</span>
                </div>
                <nav className="flex flex-col gap-1">
                  {['Dashboard', 'My Profile', 'Job Search', 'Applications', 'Skills & Certs', 'Settings'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setActiveTab(item)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                        activeTab === item ? 'bg-indigo-600/10 text-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{item}</span>
                      {item === 'Applications' && <span className="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full text-[9px]">3</span>}
                    </button>
                  ))}
                </nav>
              </aside>

              {/* Mock Main Panel */}
              <main className="flex-grow bg-slate-950/80 p-6 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Welcome back, Olivia!</h2>
                    <p className="text-xs text-gray-400">Your mock student profile is loaded. Check out your career progress.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/resume')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                  >
                    Analyze New Resume
                  </button>
                </div>

                {/* Dashboard Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Job Applications', val: '3 Active', desc: '1 Interview scheduled' },
                    { label: 'Skills Development', val: '6 Verified', desc: 'React, Figma, Python' },
                    { label: 'Resume Score', val: '84 / 100', desc: 'Instant AI review' },
                    { label: 'Job Match Rate', val: '84% Match', desc: 'For Stripe Product role' }
                  ].map((stat, i) => (
                    <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 text-left">
                      <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">{stat.label}</span>
                      <span className="text-white text-lg font-bold block">{stat.val}</span>
                      <span className="text-gray-500 text-[10px] block">{stat.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Chart Card & Applications Table */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Skill Growth Line Chart */}
                  <div className="glass-panel p-4 rounded-xl border border-white/5 text-left flex flex-col gap-4 relative">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Skill Growth Trajectory</h3>
                      <p className="text-[10px] text-gray-500">Hover over chart nodes to see timeline updates.</p>
                    </div>

                    <div className="relative h-44 bg-slate-900/40 rounded-lg p-2 flex items-center justify-center">
                      <svg className="w-full h-full max-h-40" viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        
                        {/* Grid Lines */}
                        <line x1="40" y1="20" x2="520" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="40" y1="60" x2="520" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="40" y1="100" x2="520" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        <line x1="40" y1="140" x2="520" y2="140" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        
                        {/* X-Axis Labels */}
                        <text x="40" y="165" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">May</text>
                        <text x="136" y="165" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">Jun</text>
                        <text x="232" y="165" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">Jul</text>
                        <text x="328" y="165" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">Aug</text>
                        <text x="424" y="165" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">Sep</text>
                        <text x="520" y="165" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">Oct</text>
                        
                        {/* Area gradient under path */}
                        <path d="M 40 140 L 40 130 Q 88 120 136 90 T 232 105 T 328 60 T 424 50 T 520 25 L 520 140 Z" fill="url(#chart-grad)" />
                        
                        {/* Interactive Line Path */}
                        <path d="M 40 130 Q 88 120 136 90 T 232 105 T 328 60 T 424 50 T 520 25" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                        
                        {/* Nodes */}
                        {CHART_NODES_DATA.map((node, i) => (
                          <g 
                            key={i} 
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredNode(node)}
                            onMouseLeave={() => setHoveredNode(null)}
                          >
                            <circle cx={node.cx} cy={node.cy} r="6" fill="#6366f1" className="hover:scale-125 transition-transform" />
                            <circle cx={node.cx} cy={node.cy} r="3" fill="#ffffff" />
                          </g>
                        ))}
                      </svg>

                      {/* Tooltip Overlay */}
                      {hoveredNode && (
                        <div 
                          className="absolute glass-panel p-2.5 rounded-lg border border-indigo-500/30 text-left bg-slate-900 pointer-events-none shadow-xl"
                          style={{
                            left: `${(hoveredNode.cx / 540) * 100}%`,
                            top: `${(hoveredNode.cy / 180) * 100 - 30}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="text-[9px] font-bold text-indigo-400">{hoveredNode.date}</div>
                          <div className="text-[10px] font-semibold text-white whitespace-nowrap">{hoveredNode.info}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Applications List */}
                  <div className="glass-panel p-4 rounded-xl border border-white/5 text-left">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Recent Mock Applications</h3>
                    <div className="flex flex-col gap-2">
                      {[
                        { company: 'Stripe', role: 'Sr. Product Designer', score: '84%', status: 'Interview', bg: 'bg-indigo-600' },
                        { company: 'Figma', role: 'UX Lead', score: '78%', status: 'Offer', bg: 'bg-black border border-white/10' },
                        { company: 'Google', role: 'SWE Intern', score: '40%', status: 'Applied', bg: 'bg-red-500' }
                      ].map((app, i) => (
                        <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/3 border border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-white text-[10px] ${app.bg}`}>
                              {app.company[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{app.role}</div>
                              <div className="text-[10px] text-gray-500">{app.company} • Match score: {app.score}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                            app.status === 'Offer' ? 'bg-emerald-500/10 text-emerald-400' :
                            app.status === 'Interview' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </main>
            </div>
            
          </div>
        </div>
      </section>

      {/* Stakeholders / Ecosystem Section */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 text-center z-10 relative">
        <p className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-2">ECOSYSTEM</p>
        <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mb-12">
          Tailored solutions for every stakeholder.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'For Students',
              desc: 'Unlock your potential with smart resume reviews, gap analysis reports, and direct connection to internship pipelines.',
              icon: <FileText className="w-5 h-5 text-indigo-400" />,
              bullets: ['Resume Parsing & Feedback', 'Automated Job Match Alignment', 'Visual Application Tracking']
            },
            {
              title: 'For Recruiters / Faculty',
              desc: 'Streamline campus and direct hiring. Post roles and instantly view matched candidates sorted by AI resume scoring.',
              icon: <Briefcase className="w-5 h-5 text-purple-400" />,
              bullets: ['Dynamic Job Postings UI', 'AI Match Insights per Candidate', 'Applicant Status Stepper Modals']
            },
            {
              title: 'For Admins',
              desc: 'Oversee placement rates, moderate job listings, verify roles, and examine site analytics logs in a secure panel.',
              icon: <Shield className="w-5 h-5 text-rose-400" />,
              bullets: ['Pending Job Approvals Panel', 'System Analytics Metrics', 'Full User Role Moderation']
            }
          ].map((item, index) => (
            <div key={index} className="glass-panel-card p-8 rounded-2xl border border-white/5 text-left flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">{item.desc}</p>
              </div>
              <ul className="flex flex-col gap-2.5 text-xs text-gray-300">
                {item.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Profile Showcase Section */}
      <section id="about" className="py-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-white leading-tight mb-6">
              Resumes are dead.<br />Long live the Profile.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Static PDF documents no longer capture the true potential of professional students. Our platform parses your resume to build a living profile model, highlighting technical trajectory and direct alignment with leading recruiters.
            </p>
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-950/20 flex gap-4">
              <span className="text-3xl">💡</span>
              <p className="text-xs text-gray-300 leading-relaxed">
                <strong>Did you know?</strong> Profiles with verified skills matching score algorithms receive 3x higher response rates from Stripe, Airbnb, and other hiring panel companies than static PDFs.
              </p>
            </div>
          </div>
          
          {/* Visual Showcase (Restored PNGs with CSS float class animations) */}
          <div className="relative h-[360px] md:h-[450px] w-full flex items-center justify-center">
            {/* Candidate portrait */}
            <div className="absolute top-[10%] left-[5%] w-[60%] glass-panel p-2 rounded-2xl border border-white/10 shadow-2xl animate-float-slow bg-slate-900/60 z-20">
              <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-950">
                <img 
                  src="/assets/candidate_a.png" 
                  alt="Candidate Olivia Chen" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop";
                  }}
                />
              </div>
              <div className="text-[10px] text-center font-mono py-2 text-indigo-400 font-bold tracking-widest uppercase">CANDIDATE A</div>
            </div>

            {/* Network hub */}
            <div className="absolute bottom-[10%] right-[5%] w-[60%] glass-panel p-2 rounded-2xl border border-white/10 shadow-2xl animate-float-delayed bg-slate-900/60 z-10">
              <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-950">
                <img 
                  src="/assets/network_hub.png" 
                  alt="Recruiting Network Office Hub" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop";
                  }}
                />
              </div>
              <div className="text-[10px] text-center font-mono py-2 text-purple-400 font-bold tracking-widest uppercase">NETWORK HUB</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 text-center z-10 relative">
        <p className="text-xs uppercase tracking-wider text-indigo-400 font-bold mb-2">PRICING PLANS</p>
        <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mb-12">
          Invest in your career growth.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {[
            {
              name: 'Free Plan',
              price: '$0',
              desc: 'For individuals starting out',
              bullets: ['Basic AI Resume review (score-only)', '3 Job applications per month', 'Standard skills matching index'],
              featured: false
            },
            {
              name: 'Professional',
              price: '$19',
              desc: 'For serious job seekers',
              bullets: ['Unlimited AI resume parsing & suggestions', 'Unlimited job matching applications', 'Actionable skill gap training index', 'Mock interview sandbox & priority scoring'],
              featured: true
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              desc: 'For universities and organizations',
              bullets: ['Everything in Pro plan', 'Admin Placement dashboard panel', 'University API integrations & exports', 'Dedicated accounts and metrics moderation'],
              featured: false
            }
          ].map((plan, i) => (
            <div 
              key={i} 
              className={`glass-panel-card p-8 rounded-2xl flex flex-col justify-between relative ${
                plan.featured ? 'border-indigo-500/50 shadow-2xl bg-indigo-950/20 scale-102 z-20' : 'border-white/5 z-10'
              }`}
            >
              {plan.featured && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  MOST POPULAR
                </span>
              )}
              
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-6">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-8 text-white">
                  <span className="text-4xl font-extrabold font-display">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-xs text-gray-500">/month</span>}
                </div>
                <ul className="flex flex-col gap-4 text-xs text-gray-300 mb-8">
                  {plan.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={plan.price === 'Custom' ? () => alert('Contacting sales at sales@careergenie.com') : handleStartGrowth}
                className={`w-full py-3 rounded-xl text-xs font-bold transition duration-300 ${
                  plan.featured 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 z-10 relative">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-500/20 px-8 py-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_60%)]"></div>
          
          <h2 className="relative font-display font-black text-3xl sm:text-5xl text-white mb-4">
            Ready to focus your future?
          </h2>
          <p className="relative max-w-xl mx-auto text-gray-300 text-sm sm:text-base mb-8">
            Join 50,000+ placement students using CareerGenie to parse resumes and unlock matches at top-tier companies.
          </p>
          <button 
            onClick={handleStartGrowth}
            className="relative bg-white hover:bg-gray-100 text-slate-950 font-bold px-8 py-4 rounded-xl text-xs sm:text-sm tracking-wider uppercase transition shadow-xl"
          >
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
}
