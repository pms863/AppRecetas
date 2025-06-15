import { NextRequest, NextResponse } from "next/server";
import supabase from "../../../../../lib/supabaseClient";

export async function DELETE(req: NextRequest) {
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

    // Log the values we're using to delete
    console.log('Attempting to delete with:', { recipeId, userId });

    // Delete the favorite record directly
    const { error: deleteError, data } = await supabase
        .from("favoritos")
        .delete()
        .eq("usuarioid", userId) // Match the user ID for deletion
        .eq("recetaid", recipeId)
        .select(); // Add select to see what was deleted

    if (deleteError) {
        console.error("Error removing favorite:", deleteError);
        return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
    }

    // Log what was deleted
    console.log('Deleted data:', data);

    if (!data || data.length === 0) {
        return NextResponse.json({
            message: "No record found to delete",
            isFavorite: false
        }, { status: 404 });
    }

    return NextResponse.json({
        message: "Recipe removed from favorites successfully",
        isFavorite: false,
        deletedRecord: data
    }, { status: 200 });
}