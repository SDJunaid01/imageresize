import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  toggleDarkMode,
  onOpenAuthModal,
}) => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-[#0A0A0A]/85 border-b border-slate-200/90 dark:border-white/[0.08] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <motion.a
            href="/"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-2.5 select-none group cursor-pointer"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="ResizeSnap Logo"
                className="h-8 sm:h-9 w-auto max-w-[48px] sm:max-w-[54px] object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              ResizeSnap
            </span>
          </motion.a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-colors"
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-800" />
            )}
          </motion.button>

          {/* User Auth Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={signOut}
                className="group flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-100 hover:bg-rose-500/10 dark:bg-white/[0.04] dark:hover:bg-rose-500/15 border border-slate-200 hover:border-rose-500/30 dark:border-white/10 dark:hover:border-rose-500/30 transition-all duration-200"
                title="Click to Sign Out"
              >
                {/* Avatar */}
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-white/20">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'User'}
                      className="w-full h-full object-cover group-hover:opacity-20 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center text-xs group-hover:opacity-20 transition-opacity">
                      {profile?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  {/* Logout icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-500">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-rose-500 transition-colors leading-tight">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </div>
                </div>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0071E3] hover:bg-[#0062C4] text-white shadow-sm transition-all duration-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};
