import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from "react-google-recaptcha";
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

    // Verification State
    const [captchaToken, setCaptchaToken] = useState(null);
    const [tncAccepted, setTncAccepted] = useState(false);

    // Email Verification State (Exhibitor only)
    const [emailCodeSent, setEmailCodeSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const recaptchaRef = useRef();

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
        // Reset email verification if email changes
        if (e.target.name === 'email' && isEmailVerified) {
            setIsEmailVerified(false);
            setEmailCodeSent(false);
            setVerificationCode('');
        }
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

        // Pre-checking conditions
        if (formData.role === 'exhibitor') {
            if (!tncAccepted) {
                setError("You must accept the Terms and Conditions.");
                setLoading(false);
                return;
            }
            if (!isEmailVerified) {
                setError("Please verify your email address.");
                setLoading(false);
                return;
            }
        }
        if (!captchaToken) {
            setError("Please complete the Captcha.");
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('role', formData.role);
            data.append('captchaToken', captchaToken);
            data.append('tncAccepted', tncAccepted);
            data.append('verificationCode', verificationCode);

            if (formData.profilePicture) {
                data.append('profilePicture', formData.profilePicture);
            }

            await api.post('/api/auth/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

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
                if (!captchaToken) {
                    setError("Please complete the Captcha.");
                    setLoading(false);
                    return;
                }
                if (formData.role === 'exhibitor' && !tncAccepted) {
                    setError("You must accept the Terms and Conditions.");
                    setLoading(false);
                    return;
                }

                const response = await api.post('/api/auth/google/register', {
                    token: tokenResponse.access_token,
                    role: formData.role,
                    captchaToken,
                    tncAccepted
                });

                if (response.status === 201 && response.data.user.status === 'pending') {
                    setLoading(false);
                    navigate('/login', { state: { message: "Account created! Your exhibitor status is PENDING approval." } });
                    return;
                }

                const { user } = response.data;
                dispatch(setCredentials({ user, role: user.role }));

                const redirectPath = user.role === 'admin'
                    ? '/dashboard/admin'
                    : user.role === 'exhibitor'
                        ? '/dashboard/exhibitor'
                        : '/';

                navigate(redirectPath);

            } catch (err) {
                console.error("Google Auth Error:", err);
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

    const isExhibitor = formData.role === 'exhibitor';

    // Strict submit disabled check
    const isSubmitDisabled = loading ||
        !captchaToken ||
        (isExhibitor && (!tncAccepted || !isEmailVerified));

    // Google Sign-In only needs Captcha and T&C (Google verifies email)
    const isGoogleDisabled = loading ||
        !captchaToken ||
        (isExhibitor && !tncAccepted);

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-white selection:text-black flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/50 via-neutral-900 to-neutral-950 pointer-events-none" />

                <div className="relative z-10 w-full max-w-5xl">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl">

                        <div className="text-center mb-10">
                            <h1 className="font-serif text-4xl mb-3 text-white">Create Account</h1>
                            <p className="text-neutral-400 text-sm tracking-wide">Join the exhibition platform</p>
                        </div>

                        {error && (
                            <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-pulse">
                                <FontAwesomeIcon icon={faExclamationCircle} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* LEFT COLUMN: Basic Details */}
                            <div className="space-y-6">
                                {/* Profile Picture Input */}
                                <div className="flex flex-col items-center mb-8">
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

                                <div className="space-y-4">
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
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Verification & Actions */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-neutral-800/30 p-6 rounded-xl border border-white/5 flex flex-col gap-6 h-full">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 border-b border-white/5 pb-2">Verification Required</h3>

                                    {/* Email Confirmation */}
                                    {isExhibitor && (
                                        <div className={`p-4 rounded-lg border transition-colors ${isEmailVerified ? 'bg-green-900/20 border-green-900/30' : 'bg-neutral-900 border-neutral-700'}`}>
                                            <label className="text-[10px] uppercase font-bold text-neutral-400 mb-2 block">1. Email Verification</label>
                                            {!isEmailVerified ? (
                                                <div className="flex flex-col gap-3">
                                                    {!emailCodeSent ? (
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (!formData.email) {
                                                                    setError("Please enter an email first.");
                                                                    return;
                                                                }
                                                                try {
                                                                    setLoading(true);
                                                                    await api.post('/api/verification/send-code', { email: formData.email });
                                                                    setEmailCodeSent(true);
                                                                    setLoading(false);
                                                                    setError(null);
                                                                } catch (err) {
                                                                    setError("Failed to send code. " + (err.response?.data?.message || ""));
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                            className="w-full bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-bold py-3 rounded transition-colors"
                                                        >
                                                            Send Code to {formData.email || "Email"}
                                                        </button>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="CODE"
                                                                maxLength={6}
                                                                value={verificationCode}
                                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                                className="flex-1 bg-black text-white px-3 py-2 text-center font-mono text-sm tracking-widest uppercase border border-neutral-600 rounded"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    try {
                                                                        setLoading(true);
                                                                        await api.post('/api/verification/verify-code', { email: formData.email, code: verificationCode });
                                                                        setIsEmailVerified(true);
                                                                        setLoading(false);
                                                                        setError(null);
                                                                    } catch (err) {
                                                                        setError("Invalid code. " + (err.response?.data?.message || ""));
                                                                        setLoading(false);
                                                                    }
                                                                }}
                                                                className="bg-white text-black text-xs font-bold px-4 rounded hover:bg-neutral-200 transition-colors"
                                                            >
                                                                Verify
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                    Verified Successfully
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Captcha */}
                                    <div className="flex flex-col">
                                        <label className={`text-[10px] uppercase font-bold mb-2 block ${isExhibitor ? 'text-neutral-400' : 'text-white'}`}>
                                            {isExhibitor ? '2. Human Verification' : '1. Human Verification'}
                                        </label>
                                        <div className="overflow-hidden rounded border border-neutral-700 self-start">
                                            <ReCAPTCHA
                                                ref={recaptchaRef}
                                                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                                                onChange={(token) => setCaptchaToken(token)}
                                                theme="dark"
                                                size="compact"
                                            />
                                        </div>
                                    </div>

                                    {/* T&C */}
                                    {isExhibitor && (
                                        <div className="flex items-start gap-3 mt-2">
                                            <input
                                                type="checkbox"
                                                id="tnc"
                                                checked={tncAccepted}
                                                onChange={(e) => setTncAccepted(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                            />
                                            <label htmlFor="tnc" className="text-xs text-neutral-400 cursor-pointer select-none leading-relaxed">
                                                I agree to the <span className="text-white hover:underline font-bold">Terms & Conditions</span>. I explicitly understand my account requires <span className="text-white font-bold">Admin Approval</span>.
                                            </label>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitDisabled}
                                            className="w-full bg-white text-black font-bold text-sm uppercase tracking-widest py-4 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {loading ? "Creating..." : (
                                                <>
                                                    Register <FontAwesomeIcon icon={faArrowRight} />
                                                </>
                                            )}
                                        </button>

                                        <div className="flex items-center gap-4">
                                            <div className="h-px bg-white/10 flex-1" />
                                            <span className="text-[10px] uppercase text-neutral-600 font-bold">Or</span>
                                            <div className="h-px bg-white/10 flex-1" />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => googleSignup()}
                                            disabled={isGoogleDisabled}
                                            className="w-full bg-neutral-800 text-white font-medium text-xs py-3 rounded-lg hover:bg-neutral-700 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-700"
                                        >
                                            <FontAwesomeIcon icon={faGoogle} />
                                            <span>Continue with Google</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="mt-8 text-center border-t border-white/5 pt-8">
                            <p className="text-neutral-500 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-white font-semibold hover:underline">
                                    Login to Dashboard
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
