import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/admin/sessions - List all sessions
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch all sessions with user information
        const sessions = await prisma.session.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                lastActive: "desc",
            },
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/admin/sessions/revoke - Revoke a specific session
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            );
        }

        // Revoke the session
        await prisma.session.update({
            where: { id: sessionId },
            data: {
                revoked: true,
                revokedAt: new Date(),
            },
        });

        return NextResponse.json({ message: "Session revoked successfully" });
    } catch (error) {
        console.error("Error revoking session:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/sessions - Delete all expired sessions
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete all expired sessions
        await prisma.session.deleteMany({
            where: {
                expires: {
                    lt: new Date(),
                },
            },
        });

        return NextResponse.json({ message: "Expired sessions deleted successfully" });
    } catch (error) {
        console.error("Error deleting expired sessions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 