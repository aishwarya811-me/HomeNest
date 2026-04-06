import { useState } from 'react';
import { Share2, MessageCircle, Copy, Check } from 'lucide-react';

export default function ShareButton({ title, id }) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const url = `${window.location.origin}/property/${id}`;

    const copyLink = async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => { setCopied(false); setOpen(false); }, 2000);
    };

    const shareWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this property on HomeNest: ${title}\n${url}`)}`, '_blank');
        setOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="btn-outline py-2 px-3 text-sm">
                <Share2 size={15} /> Share
            </button>
            {open && (
                <div className="absolute right-0 top-11 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 w-52 overflow-hidden">
                    <button onClick={shareWhatsApp} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm transition-colors">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <MessageCircle size={16} className="text-green-600" />
                        </div>
                        Share on WhatsApp
                    </button>
                    <button onClick={copyLink} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm transition-colors border-t border-gray-100">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${copied ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-600" />}
                        </div>
                        {copied ? 'Link Copied!' : 'Copy Link'}
                    </button>
                </div>
            )}
        </div>
    );
}