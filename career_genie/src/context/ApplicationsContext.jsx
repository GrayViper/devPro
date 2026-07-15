import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { ApplicationsContext } from './ApplicationsContextValue';

// Start with an empty applications list by default so users don't see demo data
// unless they've actually applied. Demo data was removed to avoid confusing users.
const INITIAL_APPLICATIONS = [];

export const buildStatusChangeNotification = (application, newStatus, comment = '') => {
  const normalizedStatus = String(newStatus || 'updated').toLowerCase();
  const message = [
    `Your application for ${application.jobTitle || 'this role'} at ${application.company || 'the company'} is now ${normalizedStatus}.`,
    comment || `Recruiter updated your application status to ${newStatus}.`
  ].filter(Boolean).join(' ');

  return {
    id: `notif_${Math.random().toString(36).slice(2, 9)}`,
    type: 'application_status_update',
    recipientId: application.studentId,
    recipientEmail: application.studentEmail,
    jobId: application.jobId,
    jobTitle: application.jobTitle,
    company: application.company,
    message,
    subject: `Update on your application for ${application.jobTitle || 'this role'}`,
    delivery: {
      channel: 'in-app',
      status: 'queued',
      provider: 'local',
      sentAt: new Date().toISOString(),
      to: application.studentEmail || application.studentId,
      messageId: null
    },
    createdAt: new Date().toISOString(),
    read: false
  };
};

export const ApplicationsProvider = ({ children }) => {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5178';

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('cg_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const { getAuthToken } = useAuth();

  // fetch applications from mock API on mount
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const token = await getAuthToken();
        const res = await fetch(`${API_BASE}/api/applications`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
        const data = await res.json();
        if (res.ok && Array.isArray(data.applications)) {
          setApplications(data.applications);
        }
      } catch {
        // ignore network errors and keep local state
      }
    };
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('cg_applications', JSON.stringify(applications));
  }, [applications]);

  const applyToJob = async (job, student, matchScore) => {
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

    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const createLocalApplication = () => ({
      id: `app_${Math.random().toString(36).substr(2, 9)}`,
      ...payload,
      date: todayStr,
      status: 'Applied'
    });

    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setApplications(prev => [data.application, ...prev]);
        return { success: true, application: data.application };
      }

      const newApp = createLocalApplication();
      setApplications(prev => [newApp, ...prev]);
      return { success: true, application: newApp };
    } catch {
      const newApp = createLocalApplication();
      setApplications(prev => [newApp, ...prev]);
      return { success: true, application: newApp };
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus, comment = '') => {
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

    try {
      const token = await getAuthToken();
      await fetch(`${API_BASE}/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus, comment })
      });
    } catch {
      // keep local UI responsive even if the server is temporarily unavailable
    }
  };

  return (
    <ApplicationsContext.Provider value={{ applications, applyToJob, updateApplicationStatus }}>
      {children}
    </ApplicationsContext.Provider>
  );
};
