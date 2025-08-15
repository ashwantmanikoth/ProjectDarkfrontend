import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const groups = await prisma.group.findMany({
            where: { userId: session.user.id },
            include: {
                _count: {
                    select: { documents: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const groupsWithCount = groups.map(group => ({
            ...group,
            documentCount: group._count.documents
        }));

        return NextResponse.json(groupsWithCount);
    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description } = await request.json();

        if (!name) {
            return NextResponse.json({ error: "Group name is required" }, { status: 400 });
        }

        const group = await prisma.group.create({
            data: {
                name,
                description,
                userId: session.user.id,
            },
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
