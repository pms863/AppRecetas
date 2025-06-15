'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  correo: string;
  contraseña: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    correo: '',
    contraseña: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.correo,
        password: formData.contraseña
      }),
    });

    const data = await response.json();
    console.log("Login response:", data); // Debug log

    if (response.ok && data.user) {
      // Store user session in localStorage with proper data structure
      localStorage.setItem('session', JSON.stringify({
        id: data.user.id,
        name: data.user.nombre,
        email: data.user.correo
      }));

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });

      // Use router for navigation
      router.push('/');
      
      // Force a refresh to update UI components that depend on session
      window.dispatchEvent(new Event('storage'));
    } else {
      throw new Error(data.error || 'Error al iniciar sesión');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('Email o contraseña incorrectos');
    toast({
      title: "Error",
      description: "Email o contraseña incorrectos",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.correo}
              onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.contraseña}
                onChange={(e) => setFormData(prev => ({ ...prev, contraseña: e.target.value }))}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
