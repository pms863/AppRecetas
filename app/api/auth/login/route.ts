import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ 
        error: "Email and password are required" 
      }, { status: 400 });
    }

    // Validación del usuario
    const { data: user, error: queryError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", email)
      .eq("contraseña", password)
      .single();

    if (queryError || !user) {
      console.log("Usuario no encontrado o error:", queryError);
      return NextResponse.json({ 
        error: "Invalid email or password" 
      }, { status: 401 });
    }

    console.log("Usuario encontrado:", user); // Debug log

    // Crear datos de sesión asegurando que todos los campos estén presentes
    const session = {
      id: user.id,
      name: user.nombre,  
      email: user.correo
    };

    // Guardar la cookie con sesión
    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify(session), {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 // 1 día
    });

    // Devolver datos para el cliente
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}