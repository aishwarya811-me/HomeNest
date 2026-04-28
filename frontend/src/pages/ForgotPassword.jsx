import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Home, Mail, ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [devOtp, setDevOtp] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setDevOtp(data.otp);
            setSent(true);
        } catch (err) { setError(err.response?.data?.error || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm w-full max-w-md p-8">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><Home size={16} className="text-white" /></div>
                    <span className="font-display font-bold text-xl">HomeNest</span>
                </div>

                {!sent ? (
                    <>
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4"><Mail size={22} className="text-primary-600" /></div>
                        <h1 className="font-display text-2xl font-bold mb-1">Forgot Password?</h1>
                        <p className="text-gray-500 text-sm mb-6">Enter your registered email and we'll send you an OTP to reset your password.</p>
                        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="label">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" required /></div>
                            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                                {loading ? 'Sending...' : <><ArrowRight size={16} /> Send OTP</>}
                            </button>
                        </form>
                        <p className="text-center mt-4 text-sm text-gray-500"><Link to="/login" className="text-primary-600 font-semibold">Back to Login</Link></p>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Mail size={26} className="text-green-600" />
                        </div>
                        <h2 className="font-display text-xl font-bold mb-2">OTP Sent!</h2>
                        <p className="text-gray-500 text-sm mb-4">Check your email at <strong>{email}</strong></p>
                        {devOtp && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
                                <p className="text-xs text-amber-600 font-medium mb-1">🔧 DEV MODE — Your OTP:</p>
                                <p className="text-3xl font-bold text-amber-700 tracking-widest">{devOtp}</p>
                            </div>
                        )}
                        <Link to={`/reset-password?email=${email}`} className="btn-primary w-full justify-center py-3 inline-flex">
                            Enter OTP & Reset Password
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}