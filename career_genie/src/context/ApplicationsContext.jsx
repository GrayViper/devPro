import React, { createContext, useContext, useState, useEffect } from 'react';

const ApplicationsContext = createContext();

const INITIAL_APPLICATIONS = [
  {
    id: 'app_stripe_01',
    studentId: 'usr_student',
    studentName: 'Olivia Chen',
    studentEmail: 'olivia@gmail.com',
    studentSkills: ['React', 'JavaScript', 'HTML/CSS', 'UX Design', 'Figma', 'Python'],
    jobId: 'job_stripe_spd',
    jobTitle: 'Sr. Product Designer',
    company: 'Stripe',
    logo: 'S',
    logoBg: 'bg-indigo-600',
    date: 'Jul 12, 2026',
    status: 'Interview', // Applied, Review, Interview, Offer, Rejected
    matchScore: 84,
    history: [
      { status: 'Applied', date: 'Jul 12, 2026', comment: 'Application submitted successfully with resume Olivia_Chen_Resume_2026.pdf.' },
      { status: 'Review', date: 'Jul 13, 2026', comment: 'Resume parser completed. Match rating: 84%. Forwarded to hiring team.' },
      { status: 'Interview', date: 'Jul 14, 2026', comment: 'Portfolio review interview scheduled with design panel.' }
    ]
  },
  {
    id: 'app_figma_01',
    studentId: 'usr_student',
    studentName: 'Olivia Chen',
    studentEmail: 'olivia@gmail.com',
    studentSkills: ['React', 'JavaScript', 'HTML/CSS', 'UX Design', 'Figma', 'Python'],
    jobId: 'job_figma_uxl',
    jobTitle: 'UX Lead',
    company: 'Figma',
    logo: 'F',
    logoBg: 'bg-black',
    date: 'Jul 10, 2026',
    status: 'Offer',
    matchScore: 78,
    history: [
      { status: 'Applied', date: 'Jul 10, 2026', comment: 'Application submitted.' },
      { status: 'Review', date: 'Jul 11, 2026', comment: 'Under review by design team leader.' },
      { status: 'Interview', date: 'Jul 12, 2026', comment: 'Technical panel and team-fit rounds completed.' },
      { status: 'Offer', date: 'Jul 13, 2026', comment: 'Official job offer extended. Base salary: $185,000 + equity.' }
    ]
  },
  {
    id: 'app_google_01',
    studentId: 'usr_student',
    studentName: 'Olivia Chen',
    studentEmail: 'olivia@gmail.com',
    studentSkills: ['React', 'JavaScript', 'HTML/CSS', 'UX Design', 'Figma', 'Python'],
    jobId: 'job_google_swe',
    jobTitle: 'Software Engineering Intern',
    company: 'Google',
    logo: 'G',
    logoBg: 'bg-red-500',
    date: 'Jul 13, 2026',
    status: 'Applied',
    matchScore: 40,
    history: [
      { status: 'Applied', date: 'Jul 13, 2026', comment: 'Resume submitted. Dynamic match rate: 40% (missing C++, Algorithms keywords).' }
    ]
  }
];

export const ApplicationsProvider = ({ children }) => {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5178';

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('cg_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  // fetch applications from mock API on mount
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/applications`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.applications)) {
          setApplications(data.applications);
        }
      } catch (e) {
        // ignore network errors and keep local state
      }
    };
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('cg_applications', JSON.stringify(applications));
  }, [applications]);

  const applyToJob = (job, student, matchScore) => {
    const isAlreadyApplied = applications.some(app => app.jobId === job.id && app.studentId === student.id);
    if (isAlreadyApplied) return { success: false, message: 'You have already applied for this role.' };

    const payload = {
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentSkills: student.skills || [],
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      logo: job.logo,
      logoBg: job.logoBg,
      matchScore
    };

    // Try to persist to mock API, fallback to local state on failure
    try {
      const token = localStorage.getItem('cg_token');
      fetch(`${API_BASE}/api/applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(payload)
        }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setApplications(prev => [data.application, ...prev]);
        } else {
          // fallback local create
          const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const newApp = { id: `app_${Math.random().toString(36).substr(2, 9)}`, ...payload, date: todayStr, status: 'Applied' };
          setApplications(prev => [newApp, ...prev]);
        }
      }).catch(() => {
        const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const newApp = { id: `app_${Math.random().toString(36).substr(2, 9)}`, ...payload, date: todayStr, status: 'Applied' };
        setApplications(prev => [newApp, ...prev]);
      });

      return { success: true };
    } catch (e) {
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const newApp = { id: `app_${Math.random().toString(36).substr(2, 9)}`, ...payload, date: todayStr, status: 'Applied' };
      setApplications(prev => [newApp, ...prev]);
      return { success: true, application: newApp };
    }
  };

  const updateApplicationStatus = (applicationId, newStatus, comment = '') => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: newStatus,
          history: [
            ...app.history,
            {
              status: newStatus,
              date: todayStr,
              comment: comment || `Status updated to ${newStatus}.`
            }
          ]
        };
      }
      return app;
    }));
  };

  return (
    <ApplicationsContext.Provider value={{ applications, applyToJob, updateApplicationStatus }}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationsProvider');
  }
  return context;
};
