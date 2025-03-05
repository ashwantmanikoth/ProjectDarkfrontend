import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, login, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/'); // Redirect to home or dashboard if already logged in
        }
    }, [isAuthenticated, router]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const success = await login(username, password);
        setLoading(false);
        if (!success) {
            setError('Invalid username or password');
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        setError('');
        const success = await logout();
        setLoading(false);
        if (!success) {
            setError('Logout failed');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            {!isAuthenticated ? (
                <form onSubmit={handleLogin} className="mb-4">
                    <div className="mb-2">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="border p-2 w-full"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="border p-2 w-full"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`bg-blue-500 text-white p-2 mt-2 w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            ) : (
                <button
                    onClick={handleLogout}
                    className={`bg-blue-500 text-white p-2 mt-2 w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Logging out...' : 'Logout'}
                </button>
            )}
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
};

export default LoginPage;