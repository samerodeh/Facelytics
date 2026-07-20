import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, UserRegister } from '../services/api';
import LoadingButton from '../components/LoadingButton';
import { AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { getErrorMessage } from '../utils/http';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<UserRegister>({ username: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await authAPI.register(formData);
      setSuccess('Account created successfully! Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="mx-auto max-w-md animate-fade-up">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-accent/40 bg-accent-glow">
          <UserPlus size={26} className="text-accent" />
        </div>
        <p className="eyebrow">Get Started</p>
        <h1 className="mt-2 font-display text-3xl font-700 text-content">Create your account</h1>
        <p className="mt-2 text-sm text-content-muted">Join Facelytics in a few seconds.</p>
      </div>

      <div className="panel p-8">
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-bg p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
            <span className="text-sm text-danger-soft">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent-glow p-4">
            <CheckCircle size={18} className="mt-0.5 shrink-0 text-accent" />
            <span className="text-sm text-accent-soft">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="field-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="jane_doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="field-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="field-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="field-input"
              placeholder="Re-enter your password"
            />
          </div>

          <LoadingButton type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </LoadingButton>
        </form>

        <p className="mt-6 text-center text-sm text-content-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-soft">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
