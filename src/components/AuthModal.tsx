import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingVariantIndex?: number | null;
}

// Strict RFC-compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  pendingVariantIndex,
}) => {
  const { signInWithOtp, signInWithPassword, signUpWithPassword, user } = useAuth();

  const [authMode, setAuthMode] = useState<'magic' | 'password'>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Anti-spam cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Close automatically once signed in
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  // Strict email validation state
  const isEmailValid = useMemo(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return false;
    if (!EMAIL_REGEX.test(trimmed)) return false;
    if (trimmed.endsWith('@example.com') || trimmed.endsWith('@test.com') || trimmed.endsWith('@fake.com')) {
      return false;
    }
    return true;
  }, [email]);

  const emailErrorMessage = useMemo(() => {
    if (!touchedEmail || !email) return null;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      return 'Email must include "@" (e.g. name@gmail.com)';
    }
    const parts = trimmed.split('@');
    if (!parts[1] || !parts[1].includes('.')) {
      return 'Please include a valid domain (e.g. .com, .net, .org)';
    }
    const domainParts = parts[1].split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return 'Domain extension must be at least 2 characters (e.g. .com)';
    }
    if (trimmed.endsWith('@example.com') || trimmed.endsWith('@test.com')) {
      return 'Please enter a real email address (e.g. @gmail.com)';
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      return 'Invalid email format. Please check for spaces or special characters.';
    }
    return null;
  }, [email, touchedEmail]);

  // Handle Magic Link Submit
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedEmail(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !isEmailValid) {
      setStatusMessage({
        text: 'Please enter a valid email address before requesting a login link.',
        isError: true,
      });
      return;
    }

    if (cooldown > 0) return;

    setLoading(true);
    setStatusMessage(null);

    const res = await signInWithOtp(cleanEmail);
    setLoading(false);

    if (res.success) {
      setIsMagicLinkSent(true);
      setStatusMessage({
        text: `We sent a secure login link to ${cleanEmail}. Click the link in your email to complete sign in!`,
        isError: false,
      });
      setCooldown(60);
    } else {
      setStatusMessage({
        text: res.message || 'Failed to send login link. Please try again.',
        isError: true,
      });
    }
  };

  // Handle Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedEmail(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !isEmailValid) {
      setStatusMessage({
        text: 'Please enter a valid email address.',
        isError: true,
      });
      return;
    }

    if (password.length < 6) {
      setStatusMessage({
        text: 'Password must be at least 6 characters.',
        isError: true,
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const res = isSignUp
      ? await signUpWithPassword(cleanEmail, password)
      : await signInWithPassword(cleanEmail, password);

    setLoading(false);
    if (res.success) {
      setStatusMessage({ text: res.message, isError: false });
    } else {
      setStatusMessage({ text: res.message, isError: true });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-[390px] rounded-3xl p-7 sm:p-8 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 shadow-apple-modal overflow-hidden z-10"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="flex items-center justify-center py-1 mb-2">
                <img
                  src="/logo.png"
                  alt="ResizeSnap"
                  className="h-11 w-auto object-contain select-none"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {authMode === 'magic'
                  ? 'Sign in with Magic Link'
                  : isSignUp
                  ? 'Create an Account'
                  : 'Sign in to ResizeSnap'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                {authMode === 'magic'
                  ? 'Passwordless login. We will send a secure one-click login link to your email.'
                  : 'Enter your credentials to sync and manage your compressed images across devices.'}
              </p>
            </div>

            {/* Status Message (Success / Error / Feedback) */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 border font-medium flex items-start gap-2.5 ${
                  statusMessage.isError
                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                }`}
              >
                {statusMessage.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                )}
                <span className="leading-tight">{statusMessage.text}</span>
              </div>
            )}

            {/* PRIMARY FLOW: MAGIC LINK (PASSWORDLESS) */}
            {authMode === 'magic' ? (
              <div className="space-y-4">
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                  {/* Email Field with Live Validation */}
                  <div className="text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Your Email Address
                      </label>
                      {touchedEmail && email && isEmailValid && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valid email
                        </span>
                      )}
                    </div>

                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 z-10">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="name@gmail.com"
                        value={email}
                        onBlur={() => setTouchedEmail(true)}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (!touchedEmail) setTouchedEmail(true);
                        }}
                        style={{ paddingLeft: '42px', paddingRight: '16px' }}
                        className={`w-full !pl-[42px] pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#1C1C1E] text-slate-900 dark:text-white border outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                          touchedEmail && email && !isEmailValid
                            ? 'border-rose-400 dark:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : touchedEmail && email && isEmailValid
                            ? 'border-emerald-400 dark:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : 'border-slate-300 dark:border-white/15 focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:bg-white dark:focus:bg-[#141414] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/20'
                        }`}
                      />
                    </div>

                    {emailErrorMessage && (
                      <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{emailErrorMessage}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={isEmailValid && !loading && cooldown === 0 ? { scale: 1.02 } : {}}
                    whileTap={isEmailValid && !loading && cooldown === 0 ? { scale: 0.98 } : {}}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    type="submit"
                    disabled={loading || !isEmailValid || cooldown > 0}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#0071E3] hover:bg-[#0062C4] text-white shadow-sm flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending Login Link...</span>
                      </>
                    ) : cooldown > 0 ? (
                      <span>Resend in {cooldown}s</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isMagicLinkSent ? 'Resend Magic Link' : 'Send Magic Link'}</span>
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Toggle to Password Mode */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setStatusMessage(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium hover:underline transition-colors"
                  >
                    Or sign in with email and password →
                  </button>
                </div>
              </div>
            ) : (
              /* SECONDARY FLOW: EMAIL & PASSWORD */
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Email Field with Live Validation */}
                <div className="text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Email address
                    </label>
                    {touchedEmail && email && isEmailValid && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid email
                      </span>
                    )}
                  </div>

                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 z-10">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={email}
                      onBlur={() => setTouchedEmail(true)}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (!touchedEmail) setTouchedEmail(true);
                      }}
                      style={{ paddingLeft: '42px', paddingRight: '16px' }}
                      className={`w-full !pl-[42px] pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#1C1C1E] text-slate-900 dark:text-white border outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                        touchedEmail && email && !isEmailValid
                          ? 'border-rose-400 dark:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : touchedEmail && email && isEmailValid
                          ? 'border-emerald-400 dark:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-slate-300 dark:border-white/15 focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:bg-white dark:focus:bg-[#141414] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/20'
                      }`}
                    />
                  </div>

                  {emailErrorMessage && (
                    <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{emailErrorMessage}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 z-10">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: '42px', paddingRight: '42px' }}
                      className="w-full !pl-[42px] !pr-[42px] py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#1C1C1E] text-slate-900 dark:text-white border border-slate-300 dark:border-white/15 focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:bg-white dark:focus:bg-[#141414] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors z-10"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    At least 6 characters
                  </p>
                </div>

                {/* Submit Action */}
                <motion.button
                  whileHover={isEmailValid && password.length >= 6 && !loading ? { scale: 1.02 } : {}}
                  whileTap={isEmailValid && password.length >= 6 && !loading ? { scale: 0.98 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  type="submit"
                  disabled={loading || !isEmailValid || password.length < 6}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-black dark:bg-[#F5F5F7] dark:hover:bg-white text-white dark:text-slate-900 shadow-sm flex items-center justify-center gap-2 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Please wait...'
                    : isSignUp
                    ? 'Create Account & Download'
                    : 'Sign In & Download'}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                {/* Toggle Sign Up / Sign In & Back to Magic Link */}
                <div className="flex flex-col items-center gap-1.5 pt-2">
                  <div className="text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setStatusMessage(null);
                      }}
                      className="text-xs text-[#0071E3] dark:text-[#2997FF] font-semibold hover:underline ml-1.5"
                    >
                      {isSignUp ? 'Sign in' : 'Create one'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('magic');
                      setStatusMessage(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium hover:underline transition-colors mt-1"
                  >
                    ← Back to passwordless Magic Link
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
