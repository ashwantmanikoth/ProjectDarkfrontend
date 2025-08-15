import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        if (!query) {
            return NextResponse.json(
                { error: "Search query is required" },
                { status: 400 }
            );
        }

        const documents = await prisma.document.findMany({
            where: {
                userId: session.user.id,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { summary: { contains: query, mode: 'insensitive' } }
                ]
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error("Error searching documents:", error);
        return NextResponse.json(
            { error: "Failed to search documents" },
            { status: 500 }
        );
    }
} 