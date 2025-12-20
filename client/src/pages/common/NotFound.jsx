import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Renders a 404 error page when a requested route or resource is not found
const NotFound = () => {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <span className="font-mono text-9xl font-bold text-neutral-100 leading-none select-none">
                    404
                </span>

                <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tighter -mt-12 mb-6">
                    Page Not Found
                </h1>

                <p className="text-neutral-500 max-w-md mb-8 text-lg">
                    The exhibition you are looking for might have been moved, removed, or never existed in this dimension.
                </p>

                <Link to="/">
                    <Button className="h-12 px-8 bg-black text-white hover:bg-neutral-800 rounded-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
