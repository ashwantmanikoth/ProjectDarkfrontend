import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // 🔐 Authenticate request with NextAuth
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch user using authenticated session
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                name: true,
                email: true,
                membership: true,
                image: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 