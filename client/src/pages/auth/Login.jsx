import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import api from '@/api/axios';
import { Navbar } from '@/components/common/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setLoading as setGlobalLoading } from '@/features/auth/authSlice';

// Renders the login page, allowing existing users to authenticate with email/password or Google
const Login = () => {
    // Local state for email/password form
    const [credentials, setCredentialsState] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Redux & Router hooks
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if user is already authenticated
    const { isAuthenticated } = useSelector((state) => state.auth);

    const from = location.state?.from?.pathname || "/";

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    // Handle form input changes
    const handleChange = (e) => {
        setCredentialsState({ ...credentials, [e.target.name]: e.target.value });
        setError(null);
    };

    // Handle Email/Password Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        dispatch(setGlobalLoading(true));
        setError(null);

        try {
            const response = await api.post('/api/auth/login', credentials);
            const { user, redirectPath } = response.data;

            // Update Redux state
            dispatch(setCredentials({ user, role: user.role }));

            // Navigate based on backend instruction (Strict Enforcement)
            if (redirectPath) {
                navigate(redirectPath);
            } else {
                navigate(from, { replace: true });
            }

        } catch (err) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message || "Invalid email or password.";
            setError(msg);
            setLoading(false);
            dispatch(setGlobalLoading(false));
        }
    };

    // Google Sign-In Hook (Custom Button)
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            dispatch(setGlobalLoading(true));
            setError(null);
            try {
                // STRICT LOGIN FLOW
                const response = await api.post('/api/auth/google/login', {
                    token: tokenResponse.access_token
                });

                const { user, redirectPath } = response.data;
                dispatch(setCredentials({ user, role: user.role }));

                if (redirectPath) {
                    navigate(redirectPath);
                } else {
                    navigate(from, { replace: true });
                }
            } catch (err) {
                console.error("Google Auth Error:", err);

                // Specific Handling for Unregistered Users
                if (err.response?.data?.needRegistration) {
                    setError(
                        <span>
                            Account not found. <Link to="/register" className="underline hover:text-white">Please register first.</Link>
                        </span>
                    );
                } else {
                    const msg = err.response?.data?.message || "Google Sign-In failed. Please try again.";
                    setError(msg);
                }
                setLoading(false);
                dispatch(setGlobalLoading(false));
            }
        },
        onError: () => {
            setError("Google Sign-In failed. Please check your network.");
            setLoading(false);
            dispatch(setGlobalLoading(false));
        }
    });

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-white selection:text-black flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center px-6 py-24 relative overflow-hidden">
                {/* Background ambient effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/50 via-neutral-900 to-neutral-950 pointer-events-none" />

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl">

                        <div className="text-center mb-10">
                            <h1 className="font-serif text-4xl mb-3 text-white">Welcome Back</h1>
                            <p className="text-neutral-400 text-sm tracking-wide">Sign in to access your curated collection</p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-pulse">
                                <FontAwesomeIcon icon={faExclamationCircle} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold ml-1">Email Address</label>
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={credentials.email}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900/50 border border-neutral-700 text-white rounded-lg pl-12 pr-4 py-3 outline-none focus:border-white/50 focus:bg-neutral-800 transition-all placeholder:text-neutral-600"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold ml-1">Password</label>
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={credentials.password}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900/50 border border-neutral-700 text-white rounded-lg pl-12 pr-4 py-3 outline-none focus:border-white/50 focus:bg-neutral-800 transition-all placeholder:text-neutral-600"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black font-bold text-sm uppercase tracking-widest py-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? "Authenticating..." : (
                                    <>
                                        Login <FontAwesomeIcon icon={faSignInAlt} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 flex flex-col items-center gap-4">
                            <div className="flex items-center w-full gap-4">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-neutral-500 text-xs uppercase tracking-widest">Or continue with</span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            {/* Custom Google Button */}
                            <button
                                onClick={() => googleLogin()}
                                className="w-full max-w-[300px] bg-white text-black font-medium text-sm py-3 px-6 rounded-full hover:bg-neutral-200 transition-colors flex items-center justify-center gap-3"
                            >
                                <FontAwesomeIcon icon={faGoogle} className="text-lg" />
                                <span>Sign in with Google</span>
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-neutral-500 text-sm">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-white font-semibold hover:underline">
                                    Register
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
