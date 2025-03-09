import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const headingLines = [
    "Welcome to IntelliSearch",
    "An Efficient Intelligent Agent",
    "Discover the Future of Search"
  ];

  const signInRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Calculate total delay based on number of lines
    const totalDelay = headingLines.length * 1.5 * 1000 + 1000; // extra second for pause
    const timer = setTimeout(() => {
      if (signInRef.current) {
        signInRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, totalDelay);

    return () => clearTimeout(timer);
  }, [headingLines.length]);

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Session:", session);
    console.log("Status:", status);
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, session, router]);

  return (
   <>
   <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        {headingLines.map((line, index) => (
          <h1
            key={index}
            className="text-4xl font-bold opacity-0"
            style={{
              animation: `fadeIn 1s ease forwards`,
              animationDelay: `${index * 1.5}s`,
            }}
          >
            {line}
          </h1>
        ))}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
    <div ref={signInRef} className="min-h-screen bg-gradient-to-r from-green-200 to-blue-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to IntelliSearch </h1>
        {status === "loading" ? (
          <p className="text-center">Loading...</p>
        ) : !session ? (
          <div className="space-y-4">
            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="flex items-center justify-center bg-gray-900 hover:bg-gray-800 transition-colors duration-200 text-white py-3 px-4 rounded-md w-full"
            >
              {/* GitHub Icon */}
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0.5c-6.627 0-12 5.373-12 12 0 5.304 3.438 9.8 8.205 11.387 0.6 0.111 0.82-0.261 0.82-0.577 0-0.285-0.01-1.04-0.015-2.04-3.338 0.726-4.042-1.61-4.042-1.61-0.546-1.387-1.333-1.756-1.333-1.756-1.089-0.745 0.083-0.73 0.083-0.73 1.205 0.085 1.838 1.236 1.838 1.236 1.07 1.833 2.809 1.304 3.495 0.997 0.108-0.775 0.418-1.304 0.761-1.604-2.665-0.304-5.467-1.334-5.467-5.931 0-1.311 0.469-2.382 1.236-3.221-0.123-0.303-0.536-1.523 0.117-3.176 0 0 1.008-0.322 3.3 1.23 0.957-0.266 1.983-0.399 3.003-0.404 1.02 0.005 2.047 0.138 3.006 0.404 2.29-1.552 3.295-1.23 3.295-1.23 0.655 1.653 0.242 2.873 0.12 3.176 0.77 0.839 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921 0.43 0.371 0.823 1.102 0.823 2.222 0 1.604-0.015 2.896-0.015 3.286 0 0.319 0.217 0.694 0.825 0.576 4.765-1.59 8.2-6.084 8.2-11.385 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </button>
            <button
              onClick={() => signIn("google")}
              className="flex items-center justify-center bg-red-700 hover:bg-red-600 transition-colors duration-200 text-white py-3 px-4 rounded-md w-full"
            >
              {/* Google Icon */}
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" aria-hidden="true">
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
        ) : (
          <div>
            <p className="text-center mb-4">
              You are signed in as{" "}
              <span className="font-semibold">{session.user?.email}</span>
            </p>
            <button
              onClick={() => signOut()}
              className="w-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200 text-white py-3 px-4 rounded-md"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default LoginPage;