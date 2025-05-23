import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const userId = userIdParam ? Number(userIdParam) : null;
    if (!userId || isNaN(userId)) {
        return NextResponse.json({ 
            error: "Valid User ID is required" 
        }, { status: 400 });
    }

    try {
        const { count, error } = await supabase
            .from("favoritos")
            .select('*', { count: 'exact' })
            .eq('usuarioid', userId);

        if (error) {
            console.error("Error fetching favorites count:", error);
            return NextResponse.json({ 
                error: "Failed to fetch favorites count" 
            }, { status: 500 });
        }

        return NextResponse.json({ count: count || 0 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}