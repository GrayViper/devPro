import { useState, useEffect } from 'react';
import { useClerk } from '@clerk/react';
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
  const { signOut, isLoaded: clerkLoaded } = useClerk();

  // Default to student for a seamless first-time preview of the dashboard
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cg_user');
    return saved ? JSON.parse(saved) : MOCK_USERS.student;
  });

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
        // Fallback to in-memory mock if the auth server is unreachable
        const fallback = (email && email.toLowerCase() === 'david@stripe.com') ? MOCK_USERS.recruiter : (email && email.toLowerCase() === 'admin@careergenie.com' ? MOCK_USERS.admin : MOCK_USERS.student);
        setUser(fallback);
        try { const demoToken = btoa(JSON.stringify({ sub: fallback.id, role: fallback.role, name: fallback.name, iat: Date.now() })); localStorage.setItem('cg_token', demoToken); } catch {}
        return fallback;
      }
      // Re-throw non-network errors with the original message
      throw error;
    }
  };

  const signup = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
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
      
      // For network errors or any signup issues, create a fallback in-memory user
      const newUser = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        role,
        skills: role === 'student' ? ['JavaScript', 'HTML/CSS'] : [],
        resumeUploaded: false
      };
      setUser(newUser);
      try { localStorage.setItem('cg_token', btoa(JSON.stringify({ sub: newUser.id, role: newUser.role, name: newUser.name }))); } catch {}
      
      // For non-network errors, still return the user but keep the error context
      if (!isNetworkError) {
        throw new Error(`Account created with demo mode: ${error.message}`);
      }
      return newUser;
    }
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
      const token = localStorage.getItem('cg_token');
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
      const token = localStorage.getItem('cg_token');
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

    if (clerkSession) {
      try {
        const parsed = JSON.parse(clerkSession);
        const normalized = normalizeClerkUser(parsed.user || parsed, parsed.role || 'student');
        setUser(normalized);
        return;
      } catch {
        localStorage.removeItem('clerk_session');
      }
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
          fetchProfile(payload.sub).then((fetched) => {
            if (!fetched) {
              // fallback to token payload
              setUser({ id: payload.sub, name: payload.name || payload.sub, role: payload.role || 'student', email: `${payload.name || 'user'}@careergenie.com` });
            }
          }).catch(() => {
            setUser({ id: payload.sub, name: payload.name || payload.sub, role: payload.role || 'student', email: `${payload.name || 'user'}@careergenie.com` });
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
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, switchRole, updateUserProfile, fetchProfile, saveProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

