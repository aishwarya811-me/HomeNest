import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-dark text-gray-400 mt-20">
            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Home size={15} className="text-white" />
                        </div>
                        <span className="font-display text-white text-xl font-bold">HomeNest</span>
                    </div>
                    <p className="text-sm leading-relaxed">Your trusted platform to find verified rental homes across India.</p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3">For Renters</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/browse" className="hover:text-primary-400 transition-colors">Browse Homes</Link></li>
                        <li><Link to="/register" className="hover:text-primary-400 transition-colors">Create Account</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3">For Owners</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/owner/add" className="hover:text-primary-400 transition-colors">List Property</Link></li>
                        <li><Link to="/owner/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 text-center text-xs text-gray-600 py-4">
                © {new Date().getFullYear()} HomeNest · All rights reserved
            </div>
        </footer>
    );
}