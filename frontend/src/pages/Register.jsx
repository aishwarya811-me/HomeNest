import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Home, Building2, Shield } from 'lucide-react';
import api from '../utils/api';

export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=form, 2=otp
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'renter' });
    const [otp, setOtp] = useState('');
    const [devOtp, setDevOtp] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault(); setError('');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            setDevOtp(data.otp); // dev mode: show OTP on screen
            setStep(2);
        } catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
        finally { setLoading(false); }
    };

    const handleVerify = async (e) => {
        e.preventDefault(); setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-email', { email: form.email, otp });
            localStorage.setItem('hn_token', data.token);
            localStorage.setItem('hn_user', JSON.stringify(data.user));
            navigate(data.user.role === 'owner' ? '/owner/dashboard' : '/browse');
        } catch (err) { setError(err.response?.data?.error || 'Verification failed'); }
        finally { setLoading(false); }
    };

    const resendOtp = async () => {
        try {
            const { data } = await api.post('/auth/resend-otp', { email: form.email, type: 'verify' });
            setDevOtp(data.otp);
            setError('');
        } catch (err) { setError('Failed to resend OTP'); }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full max-w-md p-8">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <Home size={16} className="text-white" />
                    </div>
                    <span className="font-display font-bold text-xl">HomeNest</span>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                    {['Account Details', 'Verify Email'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs font-medium ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
                            {i < 1 && <div className={`flex-1 h-0.5 ${step > 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <>
                        <h1 className="font-display text-2xl font-bold mb-1">Create Account</h1>
                        <p className="text-gray-500 text-sm mb-6">Already have one? <Link to="/login" className="text-primary-600 font-semibold">Sign in</Link></p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[{ value: 'renter', label: 'I want to Rent', icon: <Home size={18} /> }, { value: 'owner', label: 'I own Property', icon: <Building2 size={18} /> }].map(r => (
                                <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.role === r.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                    {r.icon}<span className="text-sm font-semibold">{r.label}</span>
                                </button>
                            ))}
                        </div>

                        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="label">Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your name" required /></div>
                                <div><label className="label">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="Optional" /></div>
                            </div>
                            <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" required /></div>
                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <input type={show ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input pr-10" placeholder="Min 6 characters" required />
                                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                                {loading ? 'Creating...' : 'Continue'}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Shield size={26} className="text-primary-600" />
                            </div>
                            <h1 className="font-display text-2xl font-bold mb-1">Verify Email</h1>
                            <p className="text-gray-500 text-sm">Enter the 6-digit OTP sent to<br /><strong>{form.email}</strong></p>
                        </div>

                        {/* DEV MODE — show OTP on screen */}
                        {devOtp && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-center">
                                <p className="text-xs text-amber-600 font-medium mb-1">🔧 DEV MODE — Your OTP:</p>
                                <p className="text-2xl font-bold text-amber-700 tracking-widest">{devOtp}</p>
                            </div>
                        )}

                        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="label">Enter OTP</label>
                                <input value={otp} onChange={e => setOtp(e.target.value)} className="input text-center text-2xl tracking-widest font-bold" placeholder="000000" maxLength={6} required />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                                {loading ? 'Verifying...' : 'Verify & Create Account'}
                            </button>
                        </form>
                        <div className="text-center mt-4">
                            <button onClick={resendOtp} className="text-sm text-primary-600 hover:underline">Didn't receive OTP? Resend</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}