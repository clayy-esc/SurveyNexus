import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/useToast';
import api from '../../lib/api';
import { RefreshCcw, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newCode, setNewCode] = useState('');
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email, recoveryCode, newPassword });
      setNewCode(res.data.recoveryCode);
      setSuccess(true);
      addToast('Password reset successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md shadow-xl border-border/50 text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">Password Reset Successful</CardTitle>
            <CardDescription>Your password has been changed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-8">
            <p className="text-sm text-foreground">
              A <strong>new</strong> recovery code has been generated. Please save this immediately as the old one is no longer valid:
            </p>
            <div className="bg-muted p-4 rounded-md font-mono text-2xl font-bold tracking-widest my-4">
              {newCode}
            </div>
            <Button onClick={() => navigate('/login')} className="w-full mt-4">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email and recovery code to reset your password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Account Email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              id="code"
              type="text"
              label="Recovery Code"
              placeholder="8-character code"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              required
              disabled={isLoading}
              className="font-mono uppercase"
            />
            <Input
              id="new-password"
              type="password"
              label="New Password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
