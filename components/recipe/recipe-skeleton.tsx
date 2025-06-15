// Este archivo está obsoleto - usar @/components/ui/shimmer en su lugar
// Mantenido para compatibilidad temporal

import { RecipeCardShimmer, RecipeListShimmer } from '@/components/ui/shimmer';

export function RecipeCardSkeleton() {
    return <RecipeCardShimmer />;
}

export function RecipeListSkeleton({ count = 8 }: { count?: number }) {
    return <RecipeListShimmer />;
}
