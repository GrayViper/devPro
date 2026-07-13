import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JobsProvider } from './context/JobsContext';
import { ApplicationsProvider } from './context/ApplicationsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPages from './pages/AuthPages';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobListingPage from './pages/JobListingPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ApplicationTracker from './pages/ApplicationTracker';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <AuthProvider>
      <JobsProvider>
        <ApplicationsProvider>
          <Router>
            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#080710] text-[#f3f4f6]">
              <div className="absolute inset-0 grid-overlay opacity-70 pointer-events-none z-0"></div>
              <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_28%)]"></div>
              
              <Navbar />
              
              <main className="relative z-10 flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<AuthPages />} />
                  <Route path="/signup" element={<AuthPages />} />
                  <Route path="/dashboard/student" element={<StudentDashboard />} />
                  <Route path="/dashboard/recruiter" element={<RecruiterDashboard />} />
                  <Route path="/resume" element={<ResumeUpload />} />
                  <Route path="/jobs" element={<JobListingPage />} />
                  <Route path="/jobs/:id" element={<JobDetailsPage />} />
                  <Route path="/applications" element={<ApplicationTracker />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
        </ApplicationsProvider>
      </JobsProvider>
    </AuthProvider>
  );
}
