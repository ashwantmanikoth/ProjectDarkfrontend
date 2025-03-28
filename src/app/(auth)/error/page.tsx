"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred while trying to sign in.",
  };

  const errorMessage = error && error in errorMessages
    ? errorMessages[error as keyof typeof errorMessages]
    : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-red-600">
          Authentication Error
        </h1>
        <p className="text-center mb-6 text-gray-600">{errorMessage}</p>
        <div className="flex justify-center">
          <Link
            href="/login"
            className="px-4 py-2 bg-black text-white rounded hover:bg-white hover:text-black transition-all duration-500 ease-initial transform hover:tracking-wider hover:scale-105"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
} 