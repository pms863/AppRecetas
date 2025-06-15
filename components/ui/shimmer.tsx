import { Card, CardContent } from "@/components/ui/card";

// Componente base de shimmer reutilizable
export function ShimmerBox({ className = "", height = "h-4" }: { className?: string; height?: string }) {
    return (
        <div
            className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded ${height} ${className}`}
        />
    );
}

// Shimmer para tarjetas de recetas
export function RecipeCardShimmer() {
    return (
        <Card className="shadow-sm animate-pulse">
            <div className="relative overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full animate-[slide_2s_ease-in-out_infinite]" />
            </div>
            <CardContent className="p-4 space-y-3">
                <ShimmerBox height="h-6" />
                <ShimmerBox height="h-4" className="w-3/4" />
                <ShimmerBox height="h-4" className="w-1/2" />
            </CardContent>
        </Card>
    );
}

// Shimmer para lista de recetas
export function RecipeListShimmer({ variant = "default" }: { variant?: "default" | "profile" }) {
    const gridClasses = variant === 'profile'
        ? "grid grid-cols-1 md:grid-cols-2 gap-6"
        : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8";

    const itemCount = variant === 'profile' ? 4 : 8;

    return (
        <div className={gridClasses}>
            {[...Array(itemCount)].map((_, index) => (
                <RecipeCardShimmer key={index} />
            ))}
        </div>
    );
}

// Shimmer para header/perfil
export function ProfileShimmer() {
    return (
        <Card className="shadow-lg h-full" style={{ backgroundColor: '#B4D3B2' }}>
            <div className="flex flex-col items-center text-center gap-4 p-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
                <div className="space-y-2">
                    <ShimmerBox height="h-6" className="w-32 mx-auto" />
                    <ShimmerBox height="h-4" className="w-40 mx-auto" />
                </div>
            </div>
            <CardContent className="space-y-4 pt-4">
                <div className="h-px bg-gray-200" />
                <ShimmerBox height="h-5" className="w-24 mx-auto" />
                <Card>
                    <CardContent className="pt-6">
                        <ShimmerBox height="h-8" />
                    </CardContent>
                </Card>
                <div className="h-px bg-gray-200" />
                <ShimmerBox height="h-10" />
            </CardContent>
        </Card>
    );
}

// Shimmer para barra de búsqueda
export function SearchBarShimmer() {
    return (
        <div className="relative">
            <ShimmerBox height="h-10" className="w-full rounded-md" />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <ShimmerBox height="h-4" className="w-4 rounded" />
            </div>
        </div>
    );
}

// Shimmer para botones
export function ButtonShimmer({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
    const heightClass = size === "sm" ? "h-8" : size === "lg" ? "h-12" : "h-10";
    const widthClass = size === "sm" ? "w-20" : size === "lg" ? "w-32" : "w-24";

    return (
        <ShimmerBox height={heightClass} className={`${widthClass} rounded-md`} />
    );
}

// Shimmer para texto de párrafo
export function TextShimmer({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {[...Array(lines)].map((_, index) => (
                <ShimmerBox
                    key={index}
                    height="h-4"
                    className={index === lines - 1 ? "w-3/4" : "w-full"}
                />
            ))}
        </div>
    );
}
