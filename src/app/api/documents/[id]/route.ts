import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const document = await prisma.document.findFirst({
            where: {
                id: id,
                userId: session.user.id,
            },
        });

        if (!document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error("Error fetching document:", error);
        return NextResponse.json(
            { error: "Failed to fetch document" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();
        const { status, summary, pageCount, filePath } = data;

        const document = await prisma.document.update({
            where: {
                id: id,
                userId: session.user.id,
            },
            data: {
                status,
                summary,
                pageCount,
                filePath,
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("Error updating document:", error);
        return NextResponse.json(
            { error: "Failed to update document" },
            { status: 500 }
        );
    }
} 