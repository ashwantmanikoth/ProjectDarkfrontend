import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : !session ? (
        <div>
          <button
            onClick={() => signIn('github')}
            className="bg-blue-500 text-white p-2 w-full"
          >
            Sign in with GitHub
          </button>
          <button
            onClick={() => signIn('github')}
            className="bg-blue-500 text-white p-2 w-full"
          >
            Sign in with GitHub
          </button>
        </div>
      ) : (
        <div>
          <p>You are signed in as {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="bg-blue-500 text-white p-2 w-full mt-4"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default LoginPage;