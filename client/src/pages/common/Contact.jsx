import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Mail, MapPin, Phone } from 'lucide-react';

// Renders the public contact page, allowing users to send inquiries or requests for exhibitor access
const Contact = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        message: '',
        subject: 'General Inquiry'
    });
    const [status, setStatus] = React.useState('idle'); // idle, loading, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setStatus('success');
            setFormData({ name: '', email: '', message: '', subject: 'General Inquiry' });
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans">
            <Navbar />

            <div className="pt-32 px-6 max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">Get in Touch</span>
                    <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tighter mb-6">
                        Contact Us.
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto font-light leading-relaxed">
                        Interested in becoming an exhibitor? Send us a request.
                    </p>
                </header>

                <div className="max-w-xl mx-auto mb-24">
                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl border border-neutral-100 p-8 shadow-sm">
                        <h3 className="text-2xl font-light mb-6">Send a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border-b border-black py-2 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border-b border-black py-2 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Subject</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full border-b border-black py-2 focus:outline-none bg-transparent"
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Exhibitor Access Request">Request Exhibitor Access</option>
                                    <option value="Support">Support</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-1">Message</label>
                                <textarea
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full border-b border-black py-2 focus:outline-none resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50"
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>

                            {status === 'success' && (
                                <p className="text-green-600 text-xs font-bold uppercase tracking-widest text-center">Message Sent Successfully</p>
                            )}
                            {status === 'error' && (
                                <p className="text-red-600 text-xs font-bold uppercase tracking-widest text-center">Failed to send</p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
