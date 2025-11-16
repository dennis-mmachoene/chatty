// ============================================
// FILE: src/pages/Auth/Login.tsx
// Login page with OTP verification
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { Mail, KeyRound } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
});

type EmailForm = z.infer<typeof emailSchema>;
type OTPForm = z.infer<typeof otpSchema>;

export const Login: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const { requestOTP, verifyOTP, isRequestingOTP, isVerifyingOTP } = useAuth();
  const navigate = useNavigate();

  // Email form
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  // OTP form
  const otpForm = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  });

  const handleEmailSubmit = async (data: EmailForm) => {
    setEmail(data.email);
    requestOTP({ email: data.email }, {
      onSuccess: () => setStep('otp'),
    });
  };

  const handleOTPSubmit = (data: OTPForm) => {
    verifyOTP({ email, code: data.code });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to continue to Chat Platform</p>
        </div>

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-5 w-5" />}
              error={emailForm.formState.errors.email?.message}
              {...emailForm.register('email')}
            />

            <Button type="submit" className="w-full" isLoading={isRequestingOTP}>
              Send OTP
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate(ROUTES.SIGNUP)}
                className="text-primary-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-900/20">
              <p className="text-sm text-primary-800 dark:text-primary-200">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)} className="space-y-4">
              <Input
                label="Enter OTP Code"
                type="text"
                placeholder="000000"
                maxLength={6}
                leftIcon={<KeyRound className="h-5 w-5" />}
                error={otpForm.formState.errors.code?.message}
                {...otpForm.register('code')}
              />

              <Button type="submit" className="w-full" isLoading={isVerifyingOTP}>
                Verify & Login
              </Button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Change email address
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};