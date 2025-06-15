'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, LogOut, ImagePlus } from 'lucide-react';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// --- NUEVO ---: Importa el componente de la lista de recetas y el tipo Meal
import { RecipeList } from '@/components/recipe/recipe-list';
import type { Meal } from '@/lib/types';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type User = {
  id?: string;
  name?: string;
  email?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [favoritesCount, setFavoritesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState<string>('/images/food/pizza.png');
  const router = useRouter();
  const { toast } = useToast();

  // --- NUEVO ---: Estados para manejar la lista de recetas favoritas
  const [favoriteRecipes, setFavoriteRecipes] = useState<Meal[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('session');
    const savedAvatar = localStorage.getItem('avatar');
    if (savedAvatar) setAvatar(savedAvatar);

    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(session);
      const validatedUser = {
        id: userData.id || '0',
        name: userData.name || 'Usuario',
        email: userData.email || 'No disponible',
      };
      setUser(validatedUser);

      if (validatedUser.id && validatedUser.id !== '0') {
        // Cargar estadísticas (esto ya lo tenías)
        fetch(`/api/profile?userId=${validatedUser.id}`)
          .then(res => res.json())
          .then(data => setFavoritesCount(data.count || 0))
          .catch(() => setFavoritesCount(0));
        
         // --- NUEVO ---: Cargar la lista completa de recetas favoritas
        setIsLoadingFavorites(true);
        setFavoritesError(null);
        // --- MODIFICADO ---: Usar la ruta correcta del endpoint
        fetch(`/api/recipe/favourite/list?userId=${validatedUser.id}`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch favorites');
            return res.json();
          })
          .then((data: Meal[]) => {
            setFavoriteRecipes(data);
            // Si quieres puedes actualizar el contador desde aquí para asegurar consistencia
            setFavoritesCount(data.length); 
          })
          .catch(() => {
            setFavoritesError("No se pudieron cargar tus recetas favoritas.");
            setFavoriteRecipes([]);
          })
          .finally(() => {
            setIsLoadingFavorites(false);
            setLoading(false); // La carga general de la página termina aquí
          });
      } else {
        setLoading(false);
        setIsLoadingFavorites(false);
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del perfil",
        variant: "destructive",
      });
      setLoading(false);
      setIsLoadingFavorites(false);
    }
  }, [router, toast]);

  function handleLogout(): void {
    localStorage.removeItem('session');
    router.push('/login');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
  }

  function handleAvatarChange(newAvatar: string) {
    setAvatar(newAvatar);
    localStorage.setItem('avatar', newAvatar);
  }

  const avatarImages = [
    'beer.png', 'burrito.png', 'cake.png', 'coffe.png', 'donut.png',
    'fast-food.png', 'ice.png', 'noodles.png', 'pizza.png', 'ramen.png',
    'rice.png', 'salad.png', 'shrimp.png', 'sushi.png', 'taco.png'
  ];

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md p-6">
                <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
                <Skeleton className="h-4 w-3/4 mx-auto mb-6" />
                <Skeleton className="h-10 w-full" />
            </Card>
        </div>
    );
  }
  
  if (!user) return null; 

  return (
    <div className="flex flex-col bg-background">
      <Header />
      {/* --- MODIFICADO ---: Contenedor principal con layout de 2 columnas en pantallas grandes */}
      <main className="flex-grow container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Columna de la tarjeta de perfil */}
           <div className="md:col-span-1">
                <Card className="shadow-lg h-full flex flex-col" style={{ backgroundColor: '#B4D3B2' }}>
                    <CardHeader className="flex flex-col items-center text-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="relative group">
                                    <Avatar className="h-24 w-24 border-2 border-background">
                                        <AvatarImage src={avatar} alt="Avatar" />
                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ImagePlus className="h-8 w-8 text-white" />
                                    </div>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 bg-white border shadow-lg">
                                <div className="grid gap-4">
                                    <h4 className="font-medium leading-none">Elige tu avatar</h4>
                                    <div className="grid grid-cols-5 gap-2">
                                    {avatarImages.map((img) => (
                                        <button key={img} onClick={() => handleAvatarChange(`/images/food/${img}`)}
                                            className={`rounded-full transition-transform transform hover:scale-110 ${ avatar === `/images/food/${img}` ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                            <Image src={`/images/food/${img}`} alt={img} width={48} height={48} className="rounded-full" />
                                        </button>
                                    ))}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div>
                            <CardTitle className="text-2xl">Hola, {user.name}</CardTitle>
                            <p className="text-muted-foreground text-sm">{user.email}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 flex flex-col flex-grow">
                        <div className="flex-grow space-y-4">
                            <Separator />
                            <h3 className="text-lg font-medium text-center">Estadísticas</h3>
                            <Card>
                                <CardContent className="pt-6 flex items-center justify-center gap-3">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    <span className="font-bold text-lg">{favoritesCount ?? '0'}</span>
                                    <span>Recetas Favoritas</span>
                                </CardContent>
                            </Card>
                            <Separator />
                        </div>
                        <Button variant="destructive" onClick={handleLogout} className="w-full mt-auto">
                            <LogOut className="h-4 w-4 mr-2" />
                            Cerrar Sesión
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            {/* --- NUEVO ---: Columna para la lista de recetas favoritas */}
            <div className="md:col-span-2">
                <h2 className="text-3xl font-bold mb-6 border-b pb-2">Mis Recetas Favoritas</h2>
                <RecipeList 
                    recipes={favoriteRecipes}
                    isLoading={isLoadingFavorites}
                    error={favoritesError}
                />
            </div>
        </div>
      </main>
    </div>
  );
}