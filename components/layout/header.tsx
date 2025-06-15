'use client';

import { ChefHat, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search/search-bar';

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  searchType?: 'name' | 'ingredient';
  setSearchType?: (type: 'name' | 'ingredient') => void;
  onSearch?: (event: React.FormEvent) => void;
  isLoading?: boolean;
}

type User = {
  id?: string;
  name?: string;
  email?: string;
};

export function Header({
  searchTerm = '',
  setSearchTerm = () => { },
  searchType = 'name',
  setSearchType = () => { },
  onSearch = () => { },
  isLoading = false
}: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem('session');
      const storedAvatar = localStorage.getItem('avatar');

      if (session) {
        try {
          const userData = JSON.parse(session);
          setUser(userData);
          if (storedAvatar) setAvatar(storedAvatar);
        } catch (error) {
          console.error('Error parsing session:', error);
          localStorage.removeItem('session');
          setUser(null);
          setAvatar(null);
        }
      } else {
        setUser(null);
        setAvatar(null);
      }
    };

    checkSession();
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, []);

  const handleProfileClick = () => {
    router.push('/profile');
  }; return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-lg">
      <div className="w-full px-4 flex h-14">
        <div className="flex w-full justify-between items-center gap-4 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <ChefHat className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl text-primary">Gourmet Navigator</span>
          </Link>

          <div className="flex-1 max-w-xl">
            {setSearchTerm && setSearchType && onSearch && (
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchType={searchType}
                setSearchType={setSearchType}
                onSearch={onSearch}
                isLoading={isLoading}
              />
            )}
          </div>

          <div className="shrink-0">
            {user ? (
              <Button
                onClick={handleProfileClick}
                variant="ghost"
                size="icon"
                className="rounded-full border border-black bg-transparent hover:bg-black/10"
                aria-label="Ver perfil"
              >
                <Avatar className="h-8 w-8">
                  {avatar && <AvatarImage src={avatar} alt="Avatar del usuario" />}
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase() ?? <UserCircle className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
