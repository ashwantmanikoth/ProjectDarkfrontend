import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get("groupId");

        const documents = await prisma.document.findMany({
            where: {
                userId: session.user.id,
                ...(groupId && { groupId }),
            },
            orderBy: {
                uploadedAt: "desc",
            },
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error("Error fetching documents:", error);
        return NextResponse.json(
            { error: "Failed to fetch documents" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const { title, fileName, fileSize, status, groupId } = data;

        const document = await prisma.document.create({
            data: {
                title,
                fileName,
                fileSize,
                status,
                userId: session.user.id,
                groupId,
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("Error creating document:", error);
        return NextResponse.json(
            { error: "Failed to create document" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Document ID is required" },
                { status: 400 }
            );
        }

        const document = await prisma.document.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        await prisma.document.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting document:", error);
        return NextResponse.json(
            { error: "Failed to delete document" },
            { status: 500 }
        );
    }
} 