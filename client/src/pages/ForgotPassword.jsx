import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/auth.api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await authApi.forgotPassword(email);
      setSubmitted(true);
      if (res.data?.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
      toast.success(res.message || 'Password reset link generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              CampusNotes
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Reset Your Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Check Your Email</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If an account exists with <span className="font-semibold text-slate-800">{email}</span>, a password reset token has been issued.
              </p>

              {devToken && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs">
                  <span className="font-bold text-amber-800">Development Demo Token:</span>
                  <p className="font-mono text-[11px] text-amber-900 break-all mt-1">{devToken}</p>
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="inline-block mt-2 font-semibold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Click to Reset Now →
                  </Link>
                </div>
              )}

              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mt-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campusnotes.edu"
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                isLoading={loading}
                icon={KeyRound}
              >
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
