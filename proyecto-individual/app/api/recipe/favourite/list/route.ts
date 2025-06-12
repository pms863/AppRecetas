import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ 
            error: "User ID is required" 
        }, { status: 400 });
    }

    try {
        // Obtener los IDs de las recetas favoritas del usuario
        const { data: favorites, error: favoritesError } = await supabase
            .from("favoritos")
            .select("recetaid")
            .eq("usuarioid", Number(userId));

        if (favoritesError) {
            console.error("Error fetching favorites:", favoritesError);
            return NextResponse.json({ 
                error: "Failed to fetch favorites" 
            }, { status: 500 });
        }

        if (!favorites || favorites.length === 0) {
            return NextResponse.json([]);
        }

        // Obtener los detalles de cada receta desde TheMealDB
        const recipePromises = favorites.map(async (favorite) => {
            try {
                const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${favorite.recetaid}`);
                const data = await response.json();
                return data.meals ? data.meals[0] : null;
            } catch (error) {
                console.error(`Error fetching recipe ${favorite.recetaid}:`, error);
                return null;
            }
        });

        const recipes = await Promise.all(recipePromises);
        const validRecipes = recipes.filter(recipe => recipe !== null);

        return NextResponse.json(validRecipes);

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}