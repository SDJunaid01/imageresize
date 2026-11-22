import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { UserProfile, OriginalImage, ImageVariant } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isDemoUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; message: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  demoUnlock: () => void;
  signOut: () => Promise<void>;
  saveProjectToCloud: (
    original: OriginalImage,
    variants: ImageVariant[],
    thumbnailBase64?: string
  ) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or create profile
  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile:', error.message);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // Fallback profile from user metadata
        const fallbackProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0],
          avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture,
          storage_saved_bytes: 0,
          total_compressions: 0,
        };
        setProfile(fallbackProfile);

        try {
          await supabase.from('profiles').upsert(fallbackProfile, { onConflict: 'id' });
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Profile fetch exception:', err);
    }
  };

  useEffect(() => {
    // 1. Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setIsLoading(false);
    });

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setIsDemoUser(false);
        await fetchProfile(newSession.user);
      } else if (!isDemoUser) {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isDemoUser]);

  // Google OAuth sign-in
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      alert('Google Sign-In error: ' + (err.message || 'Please check popup settings'));
    }
  };

  // Email Magic Link / OTP
  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Check your email for the magic login link / code!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send login email.' };
    }
  };

  // Verify OTP
  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) return { success: false, message: error.message };
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (data.user) await fetchProfile(data.user);
      }
      return { success: true, message: 'Successfully authenticated!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Verification failed.' };
    }
  };

  // Email & Password Sign In
  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, message: error.message };
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user);
      }
      return { success: true, message: 'Signed in successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Sign in failed.' };
    }
  };

  // Email & Password Sign Up
  const signUpWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) return { success: false, message: error.message };
      if (data.session && data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user);
        return { success: true, message: 'Account created and signed in!' };
      }
      return {
        success: true,
        message: 'Account created! Please check your inbox for the confirmation email or log in.',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Sign up failed.' };
    }
  };

  // Instant Demo Unlock (For instantaneous testing without email delays)
  const demoUnlock = () => {
    setIsDemoUser(true);
    const mockUser: any = {
      id: 'demo-guest-user',
      email: 'guest@resizesnap.local',
      user_metadata: { full_name: 'Guest Tester' },
    };
    setUser(mockUser);
    setProfile({
      id: 'demo-guest-user',
      email: 'guest@resizesnap.local',
      full_name: 'Guest Tester',
      storage_saved_bytes: 4200000,
      total_compressions: 5,
    });
  };

  // Sign out
  const signOut = async () => {
    if (!isDemoUser) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsDemoUser(false);
  };

  // Save project activity to Supabase Postgres (0$ storage cost, 0 bandwidth cost)
  const saveProjectToCloud = async (
    original: OriginalImage,
    variants: ImageVariant[],
    thumbnailBase64?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const totalSavedBytes = variants.reduce(
        (acc, v) => acc + Math.max(0, original.sizeBytes - v.actualSizeBytes),
        0
      );

      const variantsSummary = variants.map((v) => ({
        variant_index: v.index,
        target_kb: v.targetKb,
        actual_kb: v.actualSizeKb,
        width: v.width,
        height: v.height,
        quality_pct: v.visualScorePct,
      }));

      // In demo mode, skip remote DB insert
      if (isDemoUser) {
        if (profile) {
          setProfile({
            ...profile,
            storage_saved_bytes: (profile.storage_saved_bytes || 0) + totalSavedBytes,
            total_compressions: (profile.total_compressions || 0) + variants.length,
          });
        }
        return true;
      }

      // 1. Insert into projects
      const { error: projectError } = await supabase.from('projects').insert({
        user_id: user.id,
        filename: original.name,
        original_size_bytes: original.sizeBytes,
        original_width: original.width,
        original_height: original.height,
        variants_count: variants.length,
        variants_summary: variantsSummary,
        thumbnail_base64: thumbnailBase64 || null,
      });

      if (projectError) {
        console.warn('Cloud save skipped or table not yet initialized:', projectError.message);
      }

      // 2. Increment user profile stats locally & in DB
      if (profile) {
        const updatedSaved = (profile.storage_saved_bytes || 0) + totalSavedBytes;
        const updatedTotal = (profile.total_compressions || 0) + variants.length;

        setProfile({
          ...profile,
          storage_saved_bytes: updatedSaved,
          total_compressions: updatedTotal,
        });

        try {
          await supabase
            .from('profiles')
            .update({
              storage_saved_bytes: updatedSaved,
              total_compressions: updatedTotal,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        } catch (_) {}
      }

      return true;
    } catch (e) {
      console.warn('saveProjectToCloud error:', e);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user && !isDemoUser) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isDemoUser,
        signInWithGoogle,
        signInWithOtp,
        verifyOtp,
        signInWithPassword,
        signUpWithPassword,
        demoUnlock,
        signOut,
        saveProjectToCloud,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
