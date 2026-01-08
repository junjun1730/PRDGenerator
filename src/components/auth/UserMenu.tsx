'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function UserMenu() {
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label="사용자 메뉴"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-all duration-normal hover:scale-102 active:scale-98 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.email || 'User'}
            className="w-8 h-8 rounded-full border-2 border-neutral-200"
          />
        )}
        <span className="text-sm text-neutral-700">{user.email}</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="사용자 메뉴 옵션"
          className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-neutral-200 min-w-[200px] z-dropdown animate-slideInDown"
        >
          <div className="px-4 py-2 text-sm text-neutral-500 border-b border-neutral-200">
            {user.email}
          </div>
          <button
            role="menuitem"
            onClick={handleLogout}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogout();
              }
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors duration-normal focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
