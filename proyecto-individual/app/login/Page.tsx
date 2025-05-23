'use client';
import { LoginForm } from '@/components/auth/login-form';
import { Header } from '@/components/layout/header';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      {/* App Router handles <head> via layout.tsx or generateMetadata */}
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            <LoginForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </main>
        <footer className="py-6 text-center text-muted-foreground border-t">
            <p>&copy; {new Date().getFullYear()} Gourmet Navigator. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
