import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get('recipeId');
    const userId = searchParams.get('userId');

    if (!recipeId || !userId) {
        return NextResponse.json({ 
            error: "Recipe ID and User ID are required" 
        }, { status: 400 });
    }

    try {
        // Verificar si la receta existe en favoritos
        const { data: favorite, error } = await supabase
            .from("favoritos")
            .select("*")
            .eq("usuarioid", userId)
            .eq("recetaid", recipeId)
            .maybeSingle();

        if (error) {
            console.error("Error checking favorite status:", error);
            return NextResponse.json({ 
                error: "Failed to check favorite status" 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            isFavorite: !!favorite 
        });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}