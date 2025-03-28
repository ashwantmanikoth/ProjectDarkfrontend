"use client"
import { useSession, signOut } from "next-auth/react";
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
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;