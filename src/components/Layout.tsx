"use client";

import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";
import { Progress } from "./ui/progress";
import { Toaster } from "sonner";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </ProtectedRoute>
  );
};

export default AppLayout;

