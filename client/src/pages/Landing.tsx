// ============================================
// FILE: src/pages/Landing.tsx
// Marketing landing page
// ============================================

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Shield, Zap, Users } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white md:text-6xl">
            Connect Instantly with
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {' '}
              Chat Platform
            </span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Secure, fast, and reliable messaging for teams and individuals. Experience real-time
            communication like never before.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link to={ROUTES.LOGIN}>Get Started</Link>
            </Button>
            
            <Button size="lg" variant="outline" asChild>
              <Link to="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 p-8 shadow-2xl dark:from-primary-900/20 dark:to-secondary-900/20">
          <div className="aspect-video rounded-lg bg-white/50 backdrop-blur-sm dark:bg-gray-800/50" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-900 dark:text-white">
            Why Choose Chat Platform?
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MessageCircle,
                title: 'Real-Time Messaging',
                description: 'Instant message delivery with typing indicators and read receipts.',
              },
              {
                icon: Shield,
                title: 'End-to-End Security',
                description: 'Your conversations are encrypted and protected with industry-standard security.',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Optimized for speed with minimal latency and maximum performance.',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Group chats, file sharing, and voice/video calls all in one place.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
              >
                <feature.icon className="mb-4 h-12 w-12 text-primary-600" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Join thousands of users already using Chat Platform for their daily communication needs.
          </p>
          <Button size="lg" asChild>
            <Link to={ROUTES.LOGIN}>Start Chatting Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};