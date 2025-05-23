'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Heart, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type User = {
  id?: string;
  name?: string;
  email?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Obtener datos del usuario de la sesión
    const session = localStorage.getItem('session');
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(session);
      console.log('User data from session:', userData); // Debug log
      
      // Si falta algún dato, usamos valores por defecto en lugar de lanzar error
      const validatedUser = {
        id: userData.id || '0',
        name: userData.name || 'Usuario',
        email: userData.email || 'No disponible'
      };
      
      setUser(validatedUser);

      // Solo intentamos obtener contador de favoritos si tenemos un ID válido
      if (validatedUser.id && validatedUser.id !== '0') {
        fetch(`/api/profile?userId=${validatedUser.id}`)
          .then(res => res.json())
          .then(data => {
            setFavoritesCount(data.count || 0);
          })
          .catch((error) => {
            console.error('Error fetching favorites:', error);
            toast({
              title: "Error",
              description: "No se pudieron cargar los datos del perfil",
              variant: "destructive",
            });
          });
      }
    } catch (error) {
      console.error('Error parsing session:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del perfil",
        variant: "destructive",
      });
      // No redireccionar automáticamente, mostrar un error en la UI
    }
  }, [router, toast]);

  function handleLogout(): void {
    localStorage.removeItem('session');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
      variant: "default",
    });
    router.push('/login');
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container max-w-2xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Mi Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <h3 className="text-lg font-medium">Información Personal</h3>
              <div className="grid gap-2">
                <div>
                  <span className="font-medium">Nombre:</span>
                  <span className="ml-2">{user.name}</span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{user.email}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Estadísticas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="text-sm">
                      { `${favoritesCount} Recetas Favoritas`}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            <div className="pt-4 flex justify-end">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}