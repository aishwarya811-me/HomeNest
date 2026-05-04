import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Home, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({ otp: '', new_password: '', confirm: '' });
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const email = searchParams.get('email') || '';

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('');
        if (form.new_password !== form.confirm) return setError('Passwords do not match');
        if (form.new_password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp: form.otp, new_password: form.new_password });
            setSuccess(true);
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

                {!success ? (
                    <>
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4"><Lock size={22} className="text-primary-600" /></div>
                        <h1 className="font-display text-2xl font-bold mb-1">Reset Password</h1>
                        <p className="text-gray-500 text-sm mb-6">Enter the OTP sent to <strong>{email}</strong> and your new password.</p>
                        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="label">OTP Code</label><input value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} className="input text-center text-2xl tracking-widest font-bold" placeholder="000000" maxLength={6} required /></div>
                            <div>
                                <label className="label">New Password</label>
                                <div className="relative">
                                    <input type={show ? 'text' : 'password'} value={form.new_password} onChange={e => setForm({ ...form, new_password: e.target.value })} className="input pr-10" placeholder="Min 6 characters" required />
                                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>
                            <div><label className="label">Confirm Password</label><input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="input" placeholder="Repeat password" required /></div>
                            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">{loading ? 'Resetting...' : 'Reset Password'}</button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <CheckCircle2 size={52} className="text-green-500 mx-auto mb-4" />
                        <h2 className="font-display text-2xl font-bold mb-2">Password Reset!</h2>
                        <p className="text-gray-500 mb-6">Your password has been successfully updated.</p>
                        <Link to="/login" className="btn-primary inline-flex justify-center w-full py-3">Go to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
}