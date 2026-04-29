import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Home } from 'lucide-react';
import api from '../utils/api';

export default function Login() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [needsVerify, setNeedsVerify] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('');
        try {
            const user = await login(form.email, form.password);
            navigate(user.role === 'owner' ? '/owner/dashboard' : '/browse');
        } catch (err) {
            if (err.response?.data?.needsVerification) {
                setNeedsVerify(true);
                setError('Please verify your email before logging in.');
            } else {
                setError(err.response?.data?.error || 'Login failed');
            }
        }
    };

    const resendVerification = async () => {
        try {
            const { data } = await api.post('/auth/resend-otp', { email: form.email, type: 'verify' });
            navigate(`/verify-email?email=${form.email}&otp=${data.otp}`);
        } catch { setError('Failed to resend OTP'); }
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-dark flex-col justify-between p-12 text-white">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><Home size={16} /></div>
                    <span className="font-display font-bold text-xl">HomeNest</span>
                </div>
                <div>
                    <h2 className="font-display text-4xl font-black mb-4 leading-tight">Welcome back to<br /><span className="text-primary-400">HomeNest</span></h2>
                    <p className="text-gray-400">Sign in to manage your listings or continue your home search.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {['2,400+ Properties', 'Zero Brokerage', 'Verified Owners', 'Direct Contact'].map(t => (
                        <div key={t} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">{t}</div>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <h1 className="font-display text-3xl font-bold mb-1">Sign In</h1>
                    <p className="text-gray-500 mb-8 text-sm">New here? <Link to="/register" className="text-primary-600 font-semibold">Create account</Link></p>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                            {error}
                            {needsVerify && (
                                <button onClick={resendVerification} className="block mt-2 text-primary-600 font-semibold underline text-xs">
                                    Click here to verify your email
                                </button>
                            )}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" required /></div>
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="label mb-0">Password</label>
                                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <input type={show ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input pr-10" placeholder="Enter password" required />
                                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}