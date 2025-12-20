import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '@/api/axios'; // Use configured API
import { useSelector } from 'react-redux';
import { Navbar } from '@/components/common/Navbar';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Lock, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

// Renders the secure checkout page, handling payment processing via Razorpay and order creation
const Checkout = () => {
    const { exhibitionId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth); // Token not needed from Redux
    const [exhibition, setExhibition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchExhibition = async () => {
            try {
                const response = await api.get(`/api/exhibitions/${exhibitionId}`);
                setExhibition(response.data);
            } catch {
                setError('Failed to load exhibition details.');
            } finally {
                setLoading(false);
            }
        };

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        fetchExhibition();

        return () => {
            document.body.removeChild(script);
        };
    }, [exhibitionId]);

    const location = useLocation();

    const handlePayment = async () => {
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }

        setProcessing(true);

        try {
            // 1. Create Order on Backend
            const orderUrl = '/api/payments/create-order';
            const { data } = await api.post(
                orderUrl,
                { exhibitionId }
            );

            // --- TEST MODE / MOCK FLOW ---
            if (data.isMock) {
                // Simulate delay acting like user is interacting with gateway
                setTimeout(async () => {
                    if (window.confirm("TEST MODE: Simulate successful payment?")) {
                        try {
                            const verifyUrl = '/api/payments/verify-payment';
                            await api.post(
                                verifyUrl,
                                {
                                    razorpay_order_id: data.orderId,
                                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                                    razorpay_signature: 'bypass_signature_mock'
                                }
                            );
                            navigate(`/exhibitions/${exhibitionId}/view`);
                        } catch (err) {
                            console.error("Mock verification failed", err);
                            alert("Mock Verification Failed");
                            setProcessing(false);
                        }
                    } else {
                        setProcessing(false); // User cancelled
                    }
                }, 1000);
                return;
            }

            // 2. Initialize Razorpay (REAL MODE)
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "Virtual Gallery",
                description: `Acquisition: ${exhibition.title}`,
                order_id: data.orderId,
                image: exhibition.coverImage, // Show artwork in Razorpay modal
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verifyUrl = '/api/payments/verify-payment';
                        const verificationResponse = await api.post(
                            verifyUrl,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            }
                        );

                        // Success Redirect
                        if (verificationResponse.data && verificationResponse.data.redirectTo) {
                            navigate(verificationResponse.data.redirectTo);
                        } else {
                            navigate(`/exhibitions/view/${exhibitionId}`);
                        }

                    } catch (verifyErr) {
                        alert('Payment verification failed.');
                        console.error(verifyErr);
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email
                },
                theme: {
                    color: "#000000" // Premium Black
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert(response.error.description);
                setProcessing(false);
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                navigate('/login', { state: { from: location } });
            } else {
                alert('Error initiating payment. Please try again.');
            }
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <Spinner className="w-8 h-8 text-black" />
        </div>
    );

    if (error || !exhibition) return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-bold mb-4">Exhibition Unavailable</h2>
            <Link to="/" className="text-blue-600 hover:underline">Return to Gallery</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <Link to={`/exhibitions/${exhibitionId}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Cancel & Return
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Left Column: Artwork Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1"
                    >
                        <div className="bg-white p-8 shadow-sm border border-neutral-200">
                            <div className="aspect-[3/4] overflow-hidden mb-8 bg-neutral-100 relative">
                                {exhibition.coverImage ? (
                                    <img
                                        src={exhibition.coverImage}
                                        alt={exhibition.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">🖼️</div>
                                            <div className="text-xs uppercase tracking-widest">No Preview</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Authenticity Guaranteed</h3>
                                    <p className="text-sm text-neutral-600 leading-relaxed">
                                        This work is verified by the Virtual Exhibition Platform.
                                        You will receive a digital certificate of ownership upon completion.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-400">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Verified by Independent Curators</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Checkout Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="order-1 lg:order-2 lg:sticky lg:top-32 h-fit"
                    >
                        <div className="bg-white p-8 lg:p-12 shadow-xl border-t-4 border-black">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 mb-6">
                                <Lock className="w-3 h-3" /> Secure Checkout
                            </div>

                            <h1 className="text-4xl font-light mb-2">{exhibition.title}</h1>
                            <p className="text-neutral-500 font-mono text-sm mb-8">
                                by {exhibition.createdBy?.name || "The Artist"} • {new Date(exhibition.createdAt).getFullYear()}
                            </p>

                            <div className="border-t border-b border-neutral-100 py-6 mb-8 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">Item Price ({exhibition.referenceCurrency || 'INR'})</span>
                                    <span className="font-mono">
                                        {exhibition.referenceCurrency} {exhibition.referencePrice ? exhibition.referencePrice.toLocaleString() : exhibition.price.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">Service Fee</span>
                                    <span className="font-mono">₹0.00</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">Taxes</span>
                                    <span className="font-mono text-neutral-400">Calculated at payment</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end mb-8">
                                <span className="text-lg font-bold">Total Payable</span>
                                <span className="text-3xl font-light tracking-tight text-emerald-600">
                                    INR {exhibition.priceINR ? exhibition.priceINR.toLocaleString() : exhibition.price.toLocaleString()}
                                </span>
                                {exhibition.referenceCurrency !== 'INR' && (
                                    <span className="text-xs text-neutral-400 mt-1">
                                        (Converted from {exhibition.referenceCurrency} {exhibition.referencePrice})
                                    </span>
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-2">
                                    Charged in INR
                                </span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                            >
                                {processing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" /> Pay Securely
                                    </>
                                )}
                            </button>

                            <div className="mt-6 flex flex-col items-center gap-2 opacity-60">
                                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-neutral-500">
                                    <span>Powered by Razorpay</span>
                                    <span>•</span>
                                    <span>AES-256 Encryption</span>
                                </div>
                            </div>


                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
