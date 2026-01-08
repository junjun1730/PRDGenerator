'use client';

import LoginButton from '@/components/auth/LoginButton';
import UserMenu from '@/components/auth/UserMenu';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function Header() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-soft">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Service Name */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-brand-600">
              AI PRD Generator
            </h1>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? <UserMenu /> : <LoginButton />}
          </div>
        </div>
      </div>
    </header>
  );
}
