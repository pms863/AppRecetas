'use client';
import { SignupForm } from '@/components/auth/signup-form';
import { Header } from '@/components/layout/header';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <SignupForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
      <footer className="py-6 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Gourmet Navigator. All rights reserved.</p>
      </footer>
    </div>
  );
}