'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';

export function LoginView() {
  const { loginWithEmail } = useAuth();
  const router = useRouter();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setErrorMsg('Please enter your Login ID or corporate email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const success = await loginWithEmail(loginId, password);
      if (success) {
        router.push('/');
      } else {
        setErrorMsg('Invalid Login ID. Please verify your credentials.');
      }
    } catch {
      setErrorMsg('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredential = async (id: string) => {
    setLoginId(id);
    setPassword('password123');
    setErrorMsg('');
  };

  const testAccounts = [
    'admin@redhillinfra.in',
    'sales1@redhillinfra.in',
    'sales2@redhillinfra.in',
    'sales3@redhillinfra.in',
    'sales4@redhillinfra.in',
    'telecaller1@redhillinfra.in',
    'telecaller2@redhillinfra.in',
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-[#1E242B] relative flex flex-col justify-between overflow-x-hidden font-['Plus_Jakarta_Sans'] select-none">
      
      {/* Background Architectural Sweeping Arcs (Quiet Luxury Ambient) */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[850px] max-h-[850px] pointer-events-none opacity-60 z-0">
        <svg viewBox="0 0 850 850" fill="none" className="w-full h-full">
          <circle
            cx="850"
            cy="0"
            r="680"
            stroke="#E7DFD2"
            strokeWidth="1.5"
          />
          <circle
            cx="850"
            cy="0"
            r="480"
            stroke="#DFD4C0"
            strokeWidth="2"
          />
          <circle
            cx="850"
            cy="0"
            r="300"
            stroke="#EAE2D5"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
        </svg>
      </div>

      {/* Bottom Left Architectural Building Visualization */}
      <div className="absolute bottom-0 left-0 w-[45vw] max-w-[620px] h-[52vh] max-h-[480px] pointer-events-none z-0 hidden lg:block overflow-hidden">
        <div className="relative w-full h-full">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            alt="Red Hill Infra Contemporary Architecture"
            className="w-full h-full object-cover object-left-bottom sepia-[0.35] contrast-[0.92] brightness-[1.04] opacity-80 mix-blend-multiply"
          />
          {/* Ivory edge blend masks */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-[#FAF8F5]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FAF8F5]/30 to-[#FAF8F5]" />
        </div>
      </div>

      {/* Main Screen Layout */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10 lg:px-16 xl:px-24">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Brand Identity */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 z-10 lg:pl-4">
            
            {/* Top Left Bronze Logo */}
            <div className="flex items-center gap-3.5">
              <div className="flex items-end gap-1 h-11 text-[#B86B38]">
                <div className="w-2.5 h-6 bg-[#B86B38] rounded-t-sm" />
                <div className="w-2.5 h-9 bg-[#B86B38] rounded-t-sm" />
                <div className="w-2.5 h-11 bg-[#B86B38] rounded-t-sm" />
                <div className="w-2.5 h-8 bg-[#B86B38] rounded-t-sm" />
                <div className="w-2.5 h-5 bg-[#B86B38] rounded-t-sm" />
              </div>
              <div className="flex flex-col tracking-[0.22em] font-['Outfit'] select-none">
                <span className="text-[13px] font-bold text-[#1E242B] leading-tight">
                  RED HILL
                </span>
                <span className="text-[11px] font-semibold text-[#1E242B] tracking-[0.28em] leading-tight">
                  INFRA
                </span>
              </div>
            </div>

            {/* Headline and Slogan */}
            <div className="space-y-3 pt-4 sm:pt-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-[#1E242B] font-['Outfit'] leading-[1.12]">
                Red Hill Infra <span className="text-[#B86B38] font-normal">•</span>{' '}
                <span className="text-[#B86B38]">CRM</span>
              </h1>
              <p className="text-xl sm:text-2xl font-light text-[#4B5563] tracking-wide font-['Plus_Jakarta_Sans']">
                Build. Manage. Grow.
              </p>
              {/* Muted Copper Underline Accent */}
              <div className="w-14 h-[3.5px] bg-[#B86B38] rounded-full mt-4" />
            </div>

          </div>

          {/* Right Column: Floating White Login Card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end z-20">
            <div className="w-full max-w-[430px] bg-white rounded-[26px] p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(30,25,20,0.07),0_1px_3px_0_rgba(0,0,0,0.02)] border border-[#EFECE6] relative">
              
              {/* Card Header (Centered) */}
              <div className="text-center mb-7">
                <h2 className="text-2xl sm:text-[26px] font-bold text-[#1E242B] tracking-tight font-['Outfit']">
                  Welcome Back
                </h2>
                <p className="text-xs sm:text-[13px] text-[#6B7280] mt-1.5 font-normal">
                  Sign in to access your CRM workspace
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-5 p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Login ID / Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 text-left">
                    Login ID / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => {
                        setLoginId(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="you@redhillinfra.in"
                      className="w-full bg-white hover:border-[#D1D5DB] border border-[#E5E7EB] focus:border-[#B86B38] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#1E242B] placeholder-[#9CA3AF] outline-none transition duration-150"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5 text-left">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-white hover:border-[#D1D5DB] border border-[#E5E7EB] focus:border-[#B86B38] rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#1E242B] placeholder-[#9CA3AF] outline-none transition duration-150"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#9CA3AF] hover:text-[#4B5563] transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#B86B38] hover:bg-[#A3592B] active:bg-[#8F4E24] text-white font-semibold text-xs sm:text-sm tracking-wide transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#F0ECE1]" />
                </div>
                <span className="relative bg-white px-3 text-[11px] text-[#9CA3AF] lowercase">
                  or
                </span>
              </div>

              {/* Security Footnote */}
              <div className="flex items-center justify-center gap-2 text-[12px] text-[#6B7280]">
                <Shield className="w-4 h-4 text-[#4B5563]" />
                <span>Secure &amp; Encrypted Access</span>
              </div>

            </div>

            {/* Quick Testing Accounts Helper (Clean single-click email tags, no role badges or pics) */}
            <div className="w-full max-w-[430px] mt-4 px-2">
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[10px] text-[#9CA3AF] mr-1 uppercase tracking-wider font-semibold">
                  Test Logins:
                </span>
                {testAccounts.map((emailId) => (
                  <button
                    key={emailId}
                    type="button"
                    onClick={() => fillCredential(emailId)}
                    className="px-2 py-0.5 rounded-md bg-[#F2EDE4]/70 hover:bg-[#EBE2D4] text-[#6B7280] hover:text-[#1E242B] text-[10px] font-mono transition cursor-pointer"
                  >
                    {emailId.split('@')[0]}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}