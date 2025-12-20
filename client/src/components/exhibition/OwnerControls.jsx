import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

// Renders floating controls for exhibition owners to toggle publish status or delete the exhibition
const OwnerControls = ({ status, onToggleStatus, onDelete, category }) => {
    const themes = {
        'Art & Fashion': {
            bg: "bg-neutral-900/90 text-white border-neutral-700",
            subtext: "text-neutral-500",
            statusPub: "text-emerald-400",
            statusDraft: "text-amber-400"
        },
        'Historic & Antique': {
            bg: "bg-[#F5F0E6]/90 text-[#2C1810] border-[#E5E0D8]",
            subtext: "text-[#8C8077]",
            statusPub: "text-[#5D4037]",
            statusDraft: "text-[#C5A059]"
        },
        'Science & Technology': {
            bg: "bg-[#0B1120]/90 text-cyan-100 border-cyan-900 shadow-[0_0_20px_rgba(6,182,212,0.2)]",
            subtext: "text-cyan-700",
            statusPub: "text-emerald-400",
            statusDraft: "text-amber-400"
        },
        'Photography & Media': {
            bg: "bg-black/90 text-white border-red-900/50",
            subtext: "text-red-900",
            statusPub: "text-red-500",
            statusDraft: "text-neutral-500"
        },
        'Architecture & Design': {
            bg: "bg-white/90 text-slate-900 border-blue-600 shadow-[4px_4px_0px_#2563EB]",
            subtext: "text-slate-400",
            statusPub: "text-blue-600",
            statusDraft: "text-slate-400"
        },
        'Culture & Heritage': {
            bg: "bg-stone-900/90 text-stone-200 border-stone-700",
            subtext: "text-stone-500",
            statusPub: "text-orange-400",
            statusDraft: "text-stone-400"
        }
    };

    const theme = themes[category] || themes['Art & Fashion'];

    return (
        <div className={`fixed bottom-8 right-8 z-50 flex flex-col gap-2 p-4 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom duration-500 ${theme.bg}`}>
            <span className={`text-[10px] font-mono uppercase mb-1 text-center ${theme.subtext}`}>Owner Controls</span>

            <div className="flex gap-2">
                <Button
                    onClick={onToggleStatus}
                    className={`w-32 ${status === 'published' ? 'bg-amber-500 hover:bg-amber-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-black font-bold border-none`}
                >
                    {status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>

                <Button
                    onClick={onDelete}
                    variant="destructive"
                    className="w-12 px-0 bg-red-600 hover:bg-red-500 border-none"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
            <div className={`text-[10px] font-mono text-center ${theme.subtext}`}>
                Current: <span className={status === 'published' ? theme.statusPub : theme.statusDraft}>{status.toUpperCase()}</span>
            </div>
        </div>
    );
};

export default OwnerControls;
