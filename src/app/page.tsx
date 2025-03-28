"use client";

import React from "react";
import { NextPage } from "next";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/Layout";
import AnimatedHeading from "@/components/ui/AnimateHeading";
import { INDEX_PAGE_HEADER } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { Progress } from "@/components/ui/progress";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <Progress value={33} />;
  }

  return (
    <ProtectedRoute>
      <AppLayout children={undefined} />
      <div className="flex flex-col items-center pb-20 justify-center min-h-screen bg-background">
        <div className="items-center justify-center text-foreground">
          <AnimatedHeading lines={INDEX_PAGE_HEADER} />
        </div>
        <div className="flex space-x-4 mt-5">
          <Link
            href="/upload"
            className="px-4 py-2 rounded hover:bg-primary/90 transition-all duration-500 ease-initial transform hover:tracking-wider hover:scale-105"
          >
            Upsert Docs
          </Link>
          <Link
            href="/playground"
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-all duration-500 ease-initial transform hover:tracking-wider hover:scale-105"
          >
            Ask Anything
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Home;