'use client';

import { ChefHat, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

export function Header({
  searchTerm = '',
  setSearchTerm = () => { },
  searchType = 'name',
  setSearchType = () => { },
  onSearch = () => { },
  isLoading = false
}: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check session when component mounts and when localStorage changes
    const checkSession = () => {
      const session = localStorage.getItem('session');
      if (session) {
        try {
          const userData = JSON.parse(session);
          // Asignar userData aunque falten campos
          setUser(userData);
          console.log('Session data loaded:', userData);
        } catch (error) {
          console.error('Error parsing session:', error);
          localStorage.removeItem('session');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkSession();
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, []);

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center h-14 max-w-screen-2xl">
        <div className="flex w-full justify-between items-center pl-10 gap-4">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <ChefHat className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl text-primary">Gourmet Navigator</span>
          </Link>

          <div className="flex-1 max-w-xl mx-4">
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
                  <AvatarFallback>
                    {user.name && user.name.length > 0 ?
                      user.name[0].toUpperCase() :
                      <UserCircle className="h-5 w-5" />}
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