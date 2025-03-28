"use client";

import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";
import { Progress } from "./ui/progress";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Progress value={33} />;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </ProtectedRoute>
  );
};

export default AppLayout;

