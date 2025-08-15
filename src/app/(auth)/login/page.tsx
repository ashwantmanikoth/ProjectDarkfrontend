"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnimatedHeading from "@/components/ui/AnimateHeading";
import { HEAD_LINES, LOGIN_HEADER } from "@/lib/constants";
import { Github } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, session, router]);
  

  const signInRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Calculate total delay based on number of lines
    const totalDelay = HEAD_LINES.length * 1.5 * 1000 + 1000; // extra second for pause

    const timer = setTimeout(() => {
      if (signInRef.current) {
        signInRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, totalDelay);
    return () => clearTimeout(timer);
  }, [HEAD_LINES]);

  // Show loading state while checking authentication
  if (status === "loading") {
    console.log("LoginPage - Loading state");
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedHeading lines={HEAD_LINES} />
      </div>
      <div
        ref={signInRef}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="rounded-lg shadow-xl shadow-white p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6">
            {LOGIN_HEADER}
          </h1>
          <div className="space-y-4">
            <button
                onClick={() => signIn("github")}
                className="flex items-center justify-center bg-black hover:bg-gray-100  hover:text-black transition-colors duration-200 text-white py-3 px-4 rounded-md w-full"
              >
              <Github className="mr-2" />
              Sign in with GitHub
            </button>

            <button
                onClick={() => signIn("google")}
                className="flex items-center justify-center bg-red-700 hover:bg-gray-100 hover:text-black transition-colors duration-200 text-white py-3 px-4 rounded-md w-full"
              >
                {/* Google Icon */}
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.69 0 6.98 1.34 9.53 3.53l7.12-7.12C35.09 2.82 30.06 0 24 0 14.76 0 6.69 5.53 2.64 13.46l8.3 6.44C12.61 13.12 17.96 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.8 24.5c0-1.59-.14-3.13-.4-4.61H24v8.74h12.81c-.55 3.08-2.21 5.69-4.71 7.44l7.33 5.7c4.27-3.94 6.72-9.73 6.72-17.27z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.94 28.62c-.63-1.85-1-3.83-1-5.89s.37-4.04 1-5.89L2.64 13.46C.97 16.46 0 19.61 0 23s.97 6.54 2.64 9.54l8.3-6.44z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.06 0 11.17-2 14.89-5.41l-7.33-5.7c-2.04 1.37-4.65 2.16-7.56 2.16-5.84 0-10.78-3.95-12.55-9.29l-8.3 6.44C6.69 42.47 14.76 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                Sign in with Google
              </button>
            </div>
        </div>
      </div>
    </>
  );
} 