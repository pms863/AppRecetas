import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
    try {
        const { email, password, displayName } = await req.json();

        if (!email || !password || !displayName) {
            return NextResponse.json({ 
                error: "Missing required fields" 
            }, { status: 400 });
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('usuarios')
            .select('correo')
            .eq('correo', email)
            .single();

        if (existingUser) {
            return NextResponse.json({ 
                error: "User already exists with this email" 
            }, { status: 409 });
        }

        // Insert new user
        const { data: newUser, error: insertError } = await supabase
            .from('usuarios')
            .insert([
                { 
                    nombre: displayName,
                    correo: email,
                    contraseña: password, // Note: In a real app, you should hash the password
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error('Error creating user:', insertError);
            return NextResponse.json({ 
                error: "Failed to create user" 
            }, { status: 500 });
        }

        return NextResponse.json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                displayName: newUser.nombre,
                email: newUser.correo
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}