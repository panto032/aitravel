import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Sva polja su obavezna" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Lozinka mora imati najmanje 6 karaktera" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Korisnik sa ovim emailom vec postoji" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Doslo je do greske prilikom registracije" },
      { status: 500 }
    );
  }
}
