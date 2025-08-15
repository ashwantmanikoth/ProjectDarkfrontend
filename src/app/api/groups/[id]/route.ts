import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const group = await prisma.group.findFirst({
            where: {
                id: id,
                userId: session.user.id
            },
            include: {
                documents: {
                    orderBy: { uploadedAt: 'desc' }
                },
                _count: {
                    select: { documents: true }
                }
            }
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        return NextResponse.json({
            ...group,
            documentCount: group._count.documents
        });
    } catch (error) {
        console.error("Error fetching group:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { name, description } = await request.json();

        const group = await prisma.group.findFirst({
            where: {
                id: id,
                userId: session.user.id
            }
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const updatedGroup = await prisma.group.update({
            where: { id: id },
            data: {
                name: name || group.name,
                description: description !== undefined ? description : group.description,
            },
        });

        return NextResponse.json(updatedGroup);
    } catch (error) {
        console.error("Error updating group:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const group = await prisma.group.findFirst({
            where: {
                id: id,
                userId: session.user.id
            }
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        await prisma.group.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Error deleting group:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
