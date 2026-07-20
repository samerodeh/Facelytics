import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { authAPI, UserLogin } from '../services/api';
import LoadingButton from '../components/LoadingButton';
import { AlertCircle, ScanFace } from 'lucide-react';
import { getErrorMessage } from '../utils/http';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<UserLogin>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      if (response.user) {
        login(response.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed. Please try again.'));
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
          <ScanFace size={28} className="text-accent" />
        </div>
        <p className="eyebrow">Secure Access</p>
        <h1 className="mt-2 font-display text-3xl font-700 text-content">Welcome back</h1>
        <p className="mt-2 text-sm text-content-muted">Sign in to your Facelytics console.</p>
      </div>

      <div className="panel p-8">
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-bg p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
            <span className="text-sm text-danger-soft">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="••••••••"
            />
          </div>

          <LoadingButton type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </LoadingButton>
        </form>

        <p className="mt-6 text-center text-sm text-content-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-accent hover:text-accent-soft">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
