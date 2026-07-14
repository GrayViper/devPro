import { useState, useEffect } from 'react';
import { useClerk as useClerkAuth } from '@clerk/react';
import { AuthContext } from './AuthContextValue';
import { clearClerkSessionStorage, normalizeClerkUser } from '../utils/clerk';

const MOCK_USERS = {
  student: {
    id: 'usr_student',
    name: 'Olivia Chen',
    email: 'olivia@gmail.com',
    role: 'student',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'UX Design', 'Figma', 'Python'],
    resumeUploaded: true,
    resumeName: 'Olivia_Chen_Resume_2026.pdf',
    resumeScore: 84,
    major: 'Computer Science',
    graduationYear: 2026,
    feedback: {
      score: 84,
      strengths: [
        'Strong React and JavaScript fundamentals demonstrated in projects.',
        'Excellent visual UI layout portfolio references.',
        'Good understanding of design tools like Figma.'
      ],
      weaknesses: [
        'Lacks cloud deployment credentials (AWS/GCP).',
        'Could benefit from more backend experience (Node.js/Express).',
        'No testing framework (Jest/Cypress) mentioned.'
      ],
      suggestions: [
        'Add a Node.js project to demonstrate full-stack capability.',
        'List experience with Git/GitHub and CI/CD pipelines.',
        'Include testing tools in the Skills section.'
      ]
    }
  },
  recruiter: {
    id: 'usr_recruiter',
    name: 'David Miller',
    email: 'david@stripe.com',
    role: 'recruiter',
    company: 'Stripe',
    companyLogo: 'S'
  },
  admin: {
    id: 'usr_admin',
    name: 'Alex Mercer',
    email: 'admin@careergenie.com',
    role: 'admin'
  }
};

export const AuthProvider = ({ children }) => {
  const { signOut, isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, getToken, user: clerkUser } = useClerkAuth();

  // Default to no user (require explicit signin). Do not auto-restore from saved localStorage.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cg_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cg_user');
    }
  }, [user]);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5178';

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
      if (data.token) localStorage.setItem('cg_token', data.token);
      return data.user;
    } catch (error) {
      setLoading(false);
      const isNetworkError = error instanceof TypeError || (typeof error.message === 'string' && error.message.toLowerCase().includes('failed to fetch'));
      if (isNetworkError) {
        // Only enable fallback demo users when explicitly allowed via env flag
        const allowDemo = import.meta.env.VITE_ALLOW_DEMO === 'true';
        if (allowDemo) {
          const fallback = {
            ...((email && email.toLowerCase() === 'david@stripe.com') ? MOCK_USERS.recruiter : (email && email.toLowerCase() === 'admin@careergenie.com' ? MOCK_USERS.admin : MOCK_USERS.student)),
            demo: true
          };
          setUser(fallback);
          try { const demoToken = btoa(JSON.stringify({ sub: fallback.id, role: fallback.role, name: fallback.name, iat: Date.now() })); localStorage.setItem('cg_token', demoToken); } catch {}
          return fallback;
        }
        // otherwise surface network error to caller so no silent demo login occurs
        throw new Error('Network error: unable to reach auth server');
      }
      // Re-throw non-network errors with the original message
      throw error;
    }
  };

  const signup = async (name, email, password, role, extra = {}) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, ...extra })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setUser(data.user);
      if (data.token) localStorage.setItem('cg_token', data.token);
      return data.user;
    } catch (error) {
      setLoading(false);
      const isNetworkError = error instanceof TypeError || (typeof error.message === 'string' && error.message.toLowerCase().includes('failed to fetch'));
      // For network errors, only create a fallback when demo mode is explicitly enabled
      const allowDemo = import.meta.env.VITE_ALLOW_DEMO === 'true';
      if (isNetworkError && allowDemo) {
        const newUser = {
          id: `usr_${Math.random().toString(36).substr(2, 9)}`,
          name,
          email,
          role,
          skills: role === 'student' ? ['JavaScript', 'HTML/CSS'] : [],
          resumeUploaded: false,
          demo: true,
          // include any academic details if provided
          major: extra.major || null,
          graduationYear: extra.graduationYear || null,
          institution: extra.institution || null
        };
        setUser(newUser);
        try { localStorage.setItem('cg_token', btoa(JSON.stringify({ sub: newUser.id, role: newUser.role, name: newUser.name }))); } catch {}
        return newUser;
      }

      // For any other error, surface the original error so caller can handle it
      throw error;
    }
  };

  const getAuthToken = async () => {
    if (clerkLoaded && clerkSignedIn && typeof getToken === 'function') {
      try {
        const token = await getToken();
        if (token) return token;
      } catch {
        // ignore Clerk token retrieval failures and fallback to local token
      }
    }
    return localStorage.getItem('cg_token');
  };

  const logout = async () => {
    setUser(null);
    clearClerkSessionStorage();

    if (clerkLoaded) {
      try {
        await signOut({ redirectUrl: '/' });
      } catch {
        // Keep local sign-out behavior intact even if Clerk sign-out is unavailable.
      }
    }
  };

  const switchRole = (role) => {
    if (MOCK_USERS[role]) {
      setUser(MOCK_USERS[role]);
    } else {
      setUser({
        id: `usr_${role}`,
        name: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        email: `${role}@careergenie.com`,
        role: role,
        skills: role === 'student' ? ['JavaScript'] : []
      });
    }
  };

  const updateUserProfile = (updatedFields) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...updatedFields };
    });
  };

  const fetchProfile = async (userId) => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5178';
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/api/users/${userId}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        return data.user;
      }
      return null;
    } catch {
      return null;
    }
  };

  const saveProfile = async (userId, updates) => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5178';
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        return data.user;
      }
      return null;
    } catch {
      // fallback to local update
      updateUserProfile(updates);
      return { ...user, ...updates };
    }
  };

  // restore session from lightweight token if present (base64 JSON)
  useEffect(() => {
    const token = localStorage.getItem('cg_token');
    const saved = localStorage.getItem('cg_user');
    const clerkSession = localStorage.getItem('clerk_session');

    const allowDemo = import.meta.env.VITE_ALLOW_DEMO === 'true';
    const parseJson = (value) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };

    const savedUser = saved ? parseJson(saved) : null;
    const clerkSessionData = clerkSession ? parseJson(clerkSession) : null;
    const clerkSessionIsDemo = clerkSessionData?.demo === true;
    const savedUserIsDemo = savedUser?.demo === true;

    if (!allowDemo && (savedUserIsDemo || clerkSessionIsDemo)) {
      localStorage.removeItem('cg_user');
      localStorage.removeItem('cg_token');
      localStorage.removeItem('clerk_session');
    }

    if (clerkLoaded && clerkSignedIn && clerkUser) {
      const normalized = normalizeClerkUser(clerkUser, clerkUser.publicMetadata?.role || 'student');
      setUser(normalized);
      localStorage.setItem('clerk_session', JSON.stringify(normalized));
      localStorage.setItem('cg_user', JSON.stringify(normalized));
      return;
    }

    if (clerkSessionData && (!clerkSessionIsDemo || allowDemo)) {
      const normalized = normalizeClerkUser(clerkSessionData.user || clerkSessionData, clerkSessionData.role || 'student');
      setUser(normalized);
      return;
    }

    if (!saved && token) {
      try {
        let payload = null;
        if (token.includes('.')) {
          // JWT - decode payload (middle segment)
          const parts = token.split('.');
          if (parts.length >= 2) {
            const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
            payload = JSON.parse(decoded);
          }
        } else {
          payload = JSON.parse(atob(token));
        }
        if (payload && payload.sub) {
          // try to fetch a full profile from the mock API
          // Do NOT fallback to the token payload automatically — this prevents silent demo logins.
          fetchProfile(payload.sub).then((fetched) => {
            if (fetched) {
              setUser(fetched);
            }
            // if no profile is fetched, do nothing and require explicit sign-in
          }).catch(() => {
            // ignore errors and require explicit sign-in
          });
        }
      } catch {
        // invalid token - ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, switchRole, updateUserProfile, fetchProfile, saveProfile, getAuthToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

