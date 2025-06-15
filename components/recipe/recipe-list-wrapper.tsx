'use client';

import { Suspense, ReactNode } from 'react';
import { RecipeListSkeleton } from './recipe-skeleton';

interface RecipeListWrapperProps {
    children: ReactNode;
    fallbackCount?: number;
}

export function RecipeListWrapper({ children, fallbackCount = 8 }: RecipeListWrapperProps) {
    return (
        <Suspense fallback={<RecipeListSkeleton count={fallbackCount} />}>
            {children}
        </Suspense>
    );
}
