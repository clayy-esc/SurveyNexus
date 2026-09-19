import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/useAuth';
import { useToast } from '../../components/ui/useToast';
import api from '../../lib/api';
import { UserPlus, KeyRound } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { SurveyNexusLogo } from '../../components/common/SurveyNexusLogo';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', { email, password });
      setRecoveryCode(res.data.recoveryCode);
      login(res.data.token, res.data.user);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to create account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseRecovery = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="mb-8 flex justify-center">
        <SurveyNexusLogo size={48} showText={true} subtitle="Cosmic Intelligence Platform" interactive={true} />
      </div>
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
            />
            <Input
              id="confirm-password"
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Sign up
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      <Modal isOpen={!!recoveryCode} onClose={handleCloseRecovery} title="Save Your Recovery Code">
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            This is your one-time recovery code. If you forget your password, you will need this code to reset it.
            <strong className="block text-foreground mt-1">Please copy it and store it in a secure place.</strong>
          </p>
          <div className="bg-muted p-4 rounded-md font-mono text-2xl font-bold tracking-widest my-6">
            {recoveryCode}
          </div>
          <Button onClick={handleCloseRecovery} className="w-full">
            I have saved it securely
          </Button>
        </div>
      </Modal>
    </div>
  );
};
