import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            query,
            groupId,
            queryType = "hybrid",
            filters = {},
            limit = 10,
            scoreThreshold = 0.7,
            rerank = true,
            enableFusion = true
        } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: "Search query is required" },
                { status: 400 }
            );
        }

        // Verify the group belongs to the user
        if (groupId) {
            const group = await prisma.group.findFirst({
                where: {
                    id: groupId,
                    userId: session.user.id,
                },
            });

            if (!group) {
                return NextResponse.json(
                    { error: "Group not found" },
                    { status: 404 }
                );
            }
        }

        // Call Flask backend for enhanced RAG fusion search
        const flaskResponse = await fetch(`${process.env.FLASK_URL}/search-advanced`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                user_id: session.user.id,
                group_id: groupId,
                query_type: queryType,
                filters,
                limit,
                score_threshold: scoreThreshold,
                rerank,
                enable_fusion: enableFusion
            }),
        });

        if (!flaskResponse.ok) {
            const errorText = await flaskResponse.text();
            console.error("Flask backend error:", errorText);
            throw new Error("Failed to get search results from backend");
        }

        const searchResults = await flaskResponse.json();

        return NextResponse.json({
            answer: searchResults.answer,
            sources: searchResults.sources || [],
            searchMetadata: searchResults.search_metadata || {},
            contextInfo: searchResults.context_info || {}
        });
    } catch (error) {
        console.error("Error searching:", error);
        return NextResponse.json(
            { error: "Failed to search" },
            { status: 500 }
        );
    }
}
