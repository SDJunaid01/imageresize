import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingVariantIndex?: number | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  pendingVariantIndex,
}) => {
  const { signInWithGoogle, signInWithPassword, signUpWithPassword, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Close automatically once signed in
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setStatusMessage(null);

    const res = isSignUp
      ? await signUpWithPassword(email, password)
      : await signInWithPassword(email, password);

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

          {/* Modal Card with Apple Spring Physics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-[400px] rounded-3xl p-7 sm:p-8 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 shadow-apple-modal overflow-hidden z-10"
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
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex items-center justify-center py-1 mb-2">
                <img
                  src="/logo.png"
                  alt="ResizeSnap"
                  className="h-11 w-auto object-contain select-none"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sign in to ResizeSnap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] leading-relaxed">
                {pendingVariantIndex
                  ? `Variant #${pendingVariantIndex} is ready. Sign in to unlock your file.`
                  : 'Sign in to download and manage your compressed images.'}
              </p>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs mb-5 border font-medium flex items-start gap-2.5 ${
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

            <div className="space-y-5">
              {/* GOOGLE SIGN-IN */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={signInWithGoogle}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#1E1E1E] dark:hover:bg-[#252525] text-slate-800 dark:text-white font-semibold text-xs sm:text-sm border border-slate-300 dark:border-white/15 shadow-sm flex items-center justify-center gap-3 transition-colors active:scale-[0.98]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </motion.button>

              {/* Minimal Divider with comfortable spacing */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                <span className="bg-white dark:bg-[#141414] px-3 text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-medium uppercase tracking-wider">
                  or with email
                </span>
                <div className="border-t border-slate-200 dark:border-white/10 w-full" />
              </div>

              {/* Email & Password Form with Generous Spacing */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {/* Email Field */}
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 z-10">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '42px', paddingRight: '16px' }}
                      className="w-full !pl-[42px] pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#1C1C1E] text-slate-900 dark:text-white border border-slate-300 dark:border-white/15 focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:bg-white dark:focus:bg-[#141414] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all"
                    />
                  </div>
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
                </div>

                {/* Submit Action */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-black dark:bg-[#F5F5F7] dark:hover:bg-white text-white dark:text-slate-900 shadow-sm flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  {loading
                    ? 'Processing...'
                    : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                {/* Toggle Sign Up / Sign In */}
                <div className="text-center pt-2">
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
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
