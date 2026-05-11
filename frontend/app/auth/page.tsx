'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { Chrome, Eye, EyeOff, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth-provider';
import { firebaseAuth, googleProvider } from '@/lib/firebase';

type AuthMode = 'login' | 'signup';

function formatFirebaseError(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by the browser. Please allow popups and try again.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/missing-email':
        return 'Please enter your email address first.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a bit and try again.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Authentication settings.';
      default:
        break;
    }
  }

  return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
}

export default function AuthPage() {
  const router = useRouter();
  const { user, loading: authLoading, isConfigured, configError, logout } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!authLoading && user?.emailVerified) {
      router.replace('/app');
    }
  }, [authLoading, router, user]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const resetMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const email = loginEmail.trim().toLowerCase();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }
    if (!firebaseAuth) {
      setError(configError || 'Firebase authentication is not available.');
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, loginPassword);
      await reload(credential.user);

      if (!credential.user.emailVerified) {
        setError('Please verify your email before logging in.');
        setSuccessMessage('');
        return;
      }

      router.replace('/app');
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const email = signupEmail.trim().toLowerCase();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!firebaseAuth) {
      setError(configError || 'Firebase authentication is not available.');
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, signupPassword);
      await sendEmailVerification(credential.user);
      setMode('login');
      setLoginEmail(email);
      setLoginPassword('');
      setSuccessMessage('Verification email sent. Please verify your email before logging in.');
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    resetMessages();

    if (!firebaseAuth || !googleProvider) {
      setError(configError || 'Google sign-in is not available.');
      return;
    }

    setLoading(true);
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
      router.replace('/app');
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    resetMessages();

    const email = loginEmail.trim().toLowerCase();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!firebaseAuth) {
      setError(configError || 'Firebase authentication is not available.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setSuccessMessage('Password reset link sent to your email.');
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    resetMessages();

    if (!user) {
      setError('Please sign in with your email and password first.');
      return;
    }

    setLoading(true);
    try {
      await sendEmailVerification(user);
      setSuccessMessage('Verification email sent again. Please check your inbox.');
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshVerification = async () => {
    resetMessages();

    if (!user) {
      setError('Please sign in with your email and password first.');
      return;
    }

    setLoading(true);
    try {
      await reload(user);
      if (firebaseAuth?.currentUser?.emailVerified) {
        setSuccessMessage('Email verified successfully. Redirecting...');
        router.replace('/app');
      } else {
        setError('Your email is still not verified. Please check your inbox and click the verification link.');
      }
    } catch (err) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-sky-50 to-secondary flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md text-center mb-12">
        <div className="mb-6">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Skin Burn Detection</h1>
          <p className="text-lg text-primary font-medium mb-1">AI-powered burn analysis and medical guidance</p>
          <p className="text-sm text-muted-foreground">Secure healthcare platform for professionals</p>
        </div>
      </div>

      <Card className="w-full max-w-md bg-white shadow-lg">
        <div className="p-8">
          {user && !user.emailVerified ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MailCheck className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Verify Your Email</h2>
                <p className="text-sm text-muted-foreground">
                  Please verify your email before logging in.
                </p>
                <p className="text-sm text-foreground mt-2 font-medium">
                  {user.email}
                </p>
              </div>

              {!isConfigured && configError && (
                <div className="text-sm text-red-500">{configError}</div>
              )}
              {error && <div className="text-sm text-red-500">{error}</div>}
              {successMessage && <div className="text-sm text-green-600">{successMessage}</div>}

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleRefreshVerification}
                  disabled={loading || !isConfigured}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  {loading ? 'Checking...' : "I've Verified My Email"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={loading || !isConfigured}
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={logout}
                  disabled={loading}
                  className="w-full"
                >
                  Use Another Account
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                If you do not see the email, check your spam or promotions folder.
              </p>
            </div>
          ) : (
            <>
              <Tabs
                value={mode}
                onValueChange={(value) => {
                  resetMessages();
                  setMode(value as AuthMode);
                }}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {!isConfigured && configError && (
                  <div className="text-sm text-red-500">{configError}</div>
                )}
                {error && <div className="text-sm text-red-500">{error}</div>}
                {successMessage && <div className="text-sm text-green-600">{successMessage}</div>}

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          resetMessages();
                        }}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                      <div className="relative">
                        <Input
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            resetMessages();
                          }}
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading || !isConfigured} className="w-full bg-primary hover:bg-primary/90 text-white">
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loading || !isConfigured}
                        className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => {
                          setSignupEmail(e.target.value);
                          resetMessages();
                        }}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                      <div className="relative">
                        <Input
                          type={showSignupPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={signupPassword}
                          onChange={(e) => {
                            setSignupPassword(e.target.value);
                            resetMessages();
                          }}
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            resetMessages();
                          }}
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading || !isConfigured} className="w-full bg-primary hover:bg-primary/90 text-white">
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogleLogin}
                disabled={loading || !isConfigured}
              >
                <Chrome className="h-4 w-4" />
                Continue with Google
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
