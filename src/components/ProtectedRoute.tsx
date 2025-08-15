"use client"
import { useSession } from "next-auth/react";
// Use next/navigation instead of next/router
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;