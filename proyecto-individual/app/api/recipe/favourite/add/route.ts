import { NextRequest, NextResponse } from "next/server";

// Update the import path if necessary to match the actual location of supabaseClient.ts
import supabase from "../../../../../lib/supabaseClient";

export async function POST(req: NextRequest) {
    let json;
    try {
        const body = await req.json();
        if (!body) {
            return NextResponse.json({ error: "Empty request body" }, { status: 400 });
        }
        json = body;
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    
    const { recipeId, userId } = json;
    if (!recipeId || !userId) {
        return NextResponse.json({ error: "Missing requested inputs" }, { status: 400 });
    }

    // Check if recipe exists
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
        const data = await response.json();
        
        if (!data.meals || data.meals.length === 0) {
            return NextResponse.json({ error: "Recipe not found in TheMealDB" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error checking recipe in TheMealDB:", error);
        return NextResponse.json({ error: "Failed to verify recipe" }, { status: 500 });
    }

    // Check if the relationship already exists
    const { data: existingFavorite, error: checkError } = await supabase
        .from("favoritos")
        .select("*")
        .eq("usuarioid", userId )
        .eq("recetaid", recipeId)
        .maybeSingle();  // Devuelve null si no existe, o el registro si existe

    if (checkError) {
        console.error("Error checking existing favorite:", checkError);
        return NextResponse.json({ error: "Error checking existing favorite" }, { status: 500 });
    }

    // If favorite already exists, return success but indicate it already existed
    if (existingFavorite) {
        return NextResponse.json({
            message: "Recipe already in favorites",
        }, { status: 200 });
    }

    // Insert into favorites using correct column names
    const { error: favourite} = await supabase
        .from("favoritos")
        .insert({ usuarioid: userId, recetaid: recipeId }) // 0 pq no tengo usuarios
        .select()
        .single();
        
    if (favourite) {
        console.error("Error adding favorite:", favourite);
        return NextResponse.json({ error: "Error adding favourite" }, { status: 500 });
    }
    
    // Return success response
    return NextResponse.json({ 
        message: "Favourite added successfully", 
        data: recipeId,
        alreadyExists: false
    }, { status: 201 });
}