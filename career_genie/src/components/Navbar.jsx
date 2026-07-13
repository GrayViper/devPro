import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, LogOut, User, Briefcase, FileText, 
  CheckSquare, Shield, Sparkles, RefreshCw 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleRoleChange = (role) => {
    switchRole(role);
    setMobileMenuOpen(false);
    if (role === 'student') navigate('/dashboard/student');
    else if (role === 'recruiter') navigate('/dashboard/recruiter');
    else if (role === 'admin') navigate('/admin');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Floating Demo Role Switcher Bar */}
      {showRoleSwitcher && (
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-indigo-500/20 bg-indigo-950/85 px-4 py-1.5 text-[11px] text-indigo-200 backdrop-blur-xl">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
            <span>Demo Mode: You are viewing as <strong className="capitalize text-white">{user?.role || 'Guest'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden opacity-75 sm:inline">Switch role:</span>
            <button 
              onClick={() => handleRoleChange('student')}
              className={`rounded-full px-2.5 py-1 transition ${user?.role === 'student' ? 'bg-indigo-600 font-semibold text-white' : 'hover:bg-indigo-900/60'}`}
            >
              Student
            </button>
            <button 
              onClick={() => handleRoleChange('recruiter')}
              className={`rounded-full px-2.5 py-1 transition ${user?.role === 'recruiter' ? 'bg-indigo-600 font-semibold text-white' : 'hover:bg-indigo-900/60'}`}
            >
              Recruiter
            </button>
            <button 
              onClick={() => handleRoleChange('admin')}
              className={`rounded-full px-2.5 py-1 transition ${user?.role === 'admin' ? 'bg-indigo-600 font-semibold text-white' : 'hover:bg-indigo-900/60'}`}
            >
              Admin
            </button>
            <button 
              onClick={() => { logout(); navigate('/'); }}
              className={`rounded-full px-2.5 py-1 transition ${!user ? 'bg-indigo-600 font-semibold text-white' : 'hover:bg-indigo-900/60'}`}
            >
              Guest
            </button>
            <button 
              onClick={() => setShowRoleSwitcher(false)}
              className="ml-1 rounded-full p-1 opacity-60 transition hover:bg-white/10 hover:opacity-100"
              title="Hide switcher"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <header className={`glass-navbar sticky z-40 w-full shadow-lg shadow-black/10 ${showRoleSwitcher ? 'top-[33px]' : 'top-0'} transition-all`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="group flex items-center gap-2 text-xl font-bold tracking-tight text-white">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
                  G
                </div>
                <span className="font-display">CareerGenie</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden space-x-1 md:flex">
              {!user ? (
                <>
                  <a href="#features" className="rounded-full px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white">Features</a>
                  <a href="#pricing" className="rounded-full px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white">Pricing</a>
                  <a href="#about" className="rounded-full px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white">About</a>
                </>
              ) : user.role === 'student' ? (
                <>
                  <Link 
                    to="/dashboard/student" 
                    className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive('/dashboard/student') ? 'bg-white/10 text-indigo-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/resume" 
                    className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive('/resume') ? 'bg-white/10 text-indigo-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <FileText className="w-4 h-4" />
                    Resume AI
                  </Link>
                  <Link 
                    to="/jobs" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/jobs') ? 'text-indigo-400 bg-white/5' : 'text-gray-300 hover:text-white'}`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Find Jobs
                  </Link>
                  <Link 
                    to="/applications" 
                    className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive('/applications') ? 'bg-white/10 text-indigo-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Applications
                  </Link>
                </>
              ) : user.role === 'recruiter' ? (
                <>
                  <Link 
                    to="/dashboard/recruiter" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard/recruiter') ? 'text-indigo-400 bg-white/5' : 'text-gray-300 hover:text-white'}`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Recruiter Panel
                  </Link>
                  <Link 
                    to="/jobs" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/jobs') ? 'text-indigo-400 bg-white/5' : 'text-gray-300 hover:text-white'}`}
                  >
                    View Listings
                  </Link>
                </>
              ) : user.role === 'admin' ? (
                <>
                  <Link 
                    to="/admin" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin') ? 'text-indigo-400 bg-white/5' : 'text-gray-300 hover:text-white'}`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Command
                  </Link>
                  <Link 
                    to="/jobs" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/jobs') ? 'text-indigo-400 bg-white/5' : 'text-gray-300 hover:text-white'}`}
                  >
                    Moderate Jobs
                  </Link>
                </>
              ) : null}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <>
                  <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white">
                    Login
                  </Link>
                  <Link to="/signup" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500">
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col text-right">
                    <span className="text-white text-xs font-semibold">{user.name}</span>
                    <span className="text-gray-400 text-[10px] capitalize">{user.role} {user.company ? `@ ${user.company}` : ''}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-sm font-medium text-gray-400 transition-colors hover:border-white/20 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-b border-white/10 bg-slate-950/95 px-2 pb-3 pt-2 shadow-2xl shadow-black/20 md:hidden">
            {!user ? (
              <>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Features</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Pricing</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">About</a>
                <div className="pt-4 pb-2 border-t border-white/5 flex flex-col gap-2 px-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-gray-300 hover:text-white py-2 rounded-md text-base font-medium">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-md text-base font-medium shadow-md shadow-indigo-600/10">
                    Get Started
                  </Link>
                </div>
              </>
            ) : (
              <>
                {user.role === 'student' && (
                  <>
                    <Link to="/dashboard/student" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
                    <Link to="/resume" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Resume AI</Link>
                    <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Find Jobs</Link>
                    <Link to="/applications" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Applications</Link>
                  </>
                )}
                {user.role === 'recruiter' && (
                  <>
                    <Link to="/dashboard/recruiter" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
                    <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">View Listings</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Admin Panel</Link>
                    <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Moderate Jobs</Link>
                  </>
                )}
                <div className="pt-4 pb-2 border-t border-white/5 flex flex-col gap-2 px-3">
                  <div className="flex flex-col mb-2">
                    <span className="text-white text-sm font-semibold">{user.name}</span>
                    <span className="text-gray-400 text-xs capitalize">{user.role} {user.company ? `@ ${user.company}` : ''}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white py-2 rounded-md text-base font-medium border border-white/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
