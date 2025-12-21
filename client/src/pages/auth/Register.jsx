import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faUserTag, faArrowRight, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import api from '@/api/axios';
import { Navbar } from '@/components/common/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';

// Renders the registration page, allowing new users to sign up as visitors or exhibitors
const Register = () => {
    // Redux & Router
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'visitor',
        profilePicture: null,
        profilePreview: null
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Handlers
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                profilePicture: file,
                profilePreview: URL.createObjectURL(file)
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('role', formData.role);
            if (formData.profilePicture) {
                data.append('profilePicture', formData.profilePicture);
            }

            await api.post('/api/auth/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Auto-login logic could go here, but for now we redirect to login
            navigate('/login', { state: { message: "Account created! Please sign in with your new credentials." } });
        } catch (err) {
            console.error("Register Error:", err);
            const msg = err.response?.data?.message || "Registration failed. Please try again.";
            setError(msg);
            setLoading(false);
        }
    };

    // Google Hook
    const googleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError(null);
            try {
                // STRICT REGISTER FLOW
                const response = await api.post('/api/auth/google/register', {
                    token: tokenResponse.access_token,
                    role: formData.role // Role MUST be selected in UI
                });

                const { user } = response.data;

                // Update Redux (Auto-login after register)
                dispatch(setCredentials({ user, role: user.role }));

                // Redirect based on role
                const redirectPath = user.role === 'admin'
                    ? '/dashboard/admin'
                    : user.role === 'exhibitor'
                        ? '/dashboard/exhibitor'
                        : '/';

                navigate(redirectPath);

            } catch (err) {
                console.error("Google Auth Error:", err);
                // Fallback message
                const msg = err.response?.data?.message || "Google Sign-Up failed. Please try again.";
                setError(msg);
                setLoading(false);
            }
        },
        onError: () => {
            setError("Google Sign-Up failed. Please check your network.");
            setLoading(false);
        }
    });

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-white selection:text-black flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center px-6 py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/50 via-neutral-900 to-neutral-950 pointer-events-none" />

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl">

                        <div className="text-center mb-10">
                            <h1 className="font-serif text-4xl mb-3 text-white">Create Account</h1>
                            <p className="text-neutral-400 text-sm tracking-wide">Join the exhibition platform</p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-pulse">
                                <FontAwesomeIcon icon={faExclamationCircle} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Profile Picture Input */}
                            <div className="flex flex-col items-center">
                                <label className="relative cursor-pointer group">
                                    <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-dashed border-neutral-600 flex items-center justify-center overflow-hidden transition-colors group-hover:border-white">
                                        {formData.profilePreview ? (
                                            <img src={formData.profilePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <FontAwesomeIcon icon={faUser} className="text-2xl text-neutral-500 group-hover:text-white transition-colors" />
                                                <div className="text-[10px] uppercase mt-1 text-neutral-500 font-bold">Upload</div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        name="profilePicture"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                <span className="text-xs text-neutral-500 mt-2">Optional Profile Photo</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold ml-1">Full Name</label>
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900/50 border border-neutral-700 text-white rounded-lg pl-12 pr-4 py-3 outline-none focus:border-white/50 focus:bg-neutral-800 transition-all placeholder:text-neutral-600"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold ml-1">Email Address</label>
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
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
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900/50 border border-neutral-700 text-white rounded-lg pl-12 pr-4 py-3 outline-none focus:border-white/50 focus:bg-neutral-800 transition-all placeholder:text-neutral-600"
                                        placeholder="Create a password"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold ml-1">I am a...</label>
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faUserTag} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-white transition-colors z-10" />
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900/50 border border-neutral-700 text-white rounded-lg pl-12 pr-4 py-3 outline-none focus:border-white/50 focus:bg-neutral-800 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="visitor">Visitor (Browse Exhibitions)</option>
                                        <option value="exhibitor">Exhibitor (Host Exhibitions)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none text-xs">▼</div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black font-bold text-sm uppercase tracking-widest py-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? "Creating Account..." : (
                                    <>
                                        Register <FontAwesomeIcon icon={faArrowRight} />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col items-center gap-4">
                            <div className="flex items-center w-full gap-4">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-neutral-500 text-xs uppercase tracking-widest">Or join with</span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            <button
                                onClick={() => googleSignup()}
                                className="w-full max-w-[300px] bg-white text-black font-medium text-sm py-3 px-6 rounded-full hover:bg-neutral-200 transition-colors flex items-center justify-center gap-3"
                            >
                                <FontAwesomeIcon icon={faGoogle} className="text-lg" />
                                <span>Sign up with Google</span>
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-neutral-500 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-white font-semibold hover:underline">
                                    Login
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
