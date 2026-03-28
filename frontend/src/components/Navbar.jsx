import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, Heart, LayoutDashboard, Plus, MessageSquare, LogOut, LogIn, Menu, X, Calculator, User } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const active = (p) => pathname === p;

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <Home size={17} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-xl text-dark">HomeNest</span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    <NavLink to="/browse" label="Browse" icon={<Search size={15} />} active={active('/browse')} />
                    <NavLink to="/calculator" label="Calculator" icon={<Calculator size={15} />} active={active('/calculator')} />
                    {user?.role === 'renter' && <>
                        <NavLink to="/renter/dashboard" label="Dashboard" icon={<LayoutDashboard size={15} />} active={active('/renter/dashboard')} />
                        <NavLink to="/bookmarks" label="Saved" icon={<Heart size={15} />} active={active('/bookmarks')} />
                    </>}
                    {user?.role === 'owner' && <>
                        <NavLink to="/owner/dashboard" label="Dashboard" icon={<LayoutDashboard size={15} />} active={active('/owner/dashboard')} />
                        <NavLink to="/owner/add" label="Add Property" icon={<Plus size={15} />} active={active('/owner/add')} />
                        <NavLink to="/owner/contacts" label="Requests" icon={<MessageSquare size={15} />} active={active('/owner/contacts')} />
                    </>}
                </div>

                <div className="hidden md:flex items-center gap-2">
                    {user ? (
                        <div className="flex items-center gap-2">
                            <NotificationBell />
                            <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                                    <p className="text-xs text-primary-600 capitalize">{user.role}</p>
                                </div>
                            </Link>
                            <button onClick={() => { logout(); navigate('/'); }}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                                <LogOut size={17} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn-outline py-2 text-sm"><LogIn size={15} /> Login</Link>
                            <Link to="/register" className="btn-primary py-2 text-sm">Sign Up</Link>
                        </>
                    )}
                </div>

                <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {open && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
                    {[
                        { to: '/browse', label: 'Browse Properties' },
                        { to: '/calculator', label: 'Rent Calculator' },
                        ...(user?.role === 'renter' ? [
                            { to: '/renter/dashboard', label: 'Dashboard' },
                            { to: '/bookmarks', label: 'Saved' },
                        ] : []),
                        ...(user?.role === 'owner' ? [
                            { to: '/owner/dashboard', label: 'Dashboard' },
                            { to: '/owner/add', label: 'Add Property' },
                            { to: '/owner/contacts', label: 'Requests' },
                        ] : []),
                        ...(user ? [{ to: '/profile', label: 'My Profile' }] : []),
                    ].map(l => (
                        <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                            className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                            {l.label}
                        </Link>
                    ))}
                    {user
                        ? <button onClick={() => { logout(); navigate('/'); setOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                            Logout
                        </button>
                        : <>
                            <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Login</Link>
                            <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm text-primary-600 font-semibold hover:bg-primary-50 rounded-lg">Sign Up</Link>
                        </>
                    }
                </div>
            )}
        </nav>
    );
}

function NavLink({ to, label, icon, active }) {
    return (
        <Link to={to} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            {icon}{label}
        </Link>
    );
}
