import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Phone, Mail, Shield, Edit3, Save, X, Lock, CheckCircle2 } from 'lucide-react';

export default function Profile() {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '' });
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [pwMsg, setPwMsg] = useState('');
    const [pwError, setPwError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/auth/me').then(({ data }) => {
            setProfile(data);
            setForm({ name: data.name, phone: data.phone || '' });
        });
    }, []);

    const saveProfile = async () => {
        setLoading(true); setMsg(''); setError('');
        try {
            const { data } = await api.put('/auth/profile', form);
            setProfile(data);
            localStorage.setItem('hn_user', JSON.stringify({ ...user, name: data.name }));
            setEditing(false);
            setMsg('Profile updated!');
        } catch (err) { setError(err.response?.data?.error || 'Failed'); }
        finally { setLoading(false); }
    };

    const changePassword = async (e) => {
        e.preventDefault(); setPwMsg(''); setPwError('');
        if (pwForm.new_password !== pwForm.confirm)
            return setPwError('Passwords do not match');
        if (pwForm.new_password.length < 6)
            return setPwError('Password must be at least 6 characters');
        setLoading(true);
        try {
            await api.put('/auth/change-password', {
                current_password: pwForm.current_password,
                new_password: pwForm.new_password
            });
            setPwMsg('Password changed successfully!');
            setPwForm({ current_password: '', new_password: '', confirm: '' });
        } catch (err) { setPwError(err.response?.data?.error || 'Failed'); }
        finally { setLoading(false); }
    };

    if (!profile) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="font-display text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-500 mb-8">Manage your account details</p>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl font-display">
                            {profile.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-bold text-xl">{profile.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`badge capitalize px-3 py-1 ${profile.role === 'owner' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {profile.role}
                                </span>
                                {profile.is_verified
                                    ? <span className="badge bg-green-100 text-green-700 px-2 py-1"><CheckCircle2 size={11} /> Verified</span>
                                    : <span className="badge bg-red-100 text-red-700 px-2 py-1">Not Verified</span>}
                            </div>
                        </div>
                    </div>
                    {!editing
                        ? <button onClick={() => setEditing(true)} className="btn-outline py-2 text-sm"><Edit3 size={14} />Edit</button>
                        : <div className="flex gap-2">
                            <button onClick={saveProfile} disabled={loading} className="btn-primary py-2 text-sm"><Save size={14} />{loading ? 'Saving...' : 'Save'}</button>
                            <button onClick={() => { setEditing(false); setForm({ name: profile.name, phone: profile.phone || '' }); }} className="btn-outline py-2 text-sm"><X size={14} /></button>
                        </div>
                    }
                </div>

                {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl mb-4 text-sm flex items-center gap-2"><CheckCircle2 size={14} />{msg}</div>}
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label flex items-center gap-1.5"><User size={13} /> Full Name</label>
                        {editing
                            ? <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
                            : <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm">{profile.name}</p>}
                    </div>
                    <div>
                        <label className="label flex items-center gap-1.5"><Phone size={13} /> Phone</label>
                        {editing
                            ? <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="Your phone number" />
                            : <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm">{profile.phone || <span className="text-gray-400">Not added</span>}</p>}
                    </div>
                    <div>
                        <label className="label flex items-center gap-1.5"><Mail size={13} /> Email</label>
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-500">{profile.email}</p>
                    </div>
                    <div>
                        <label className="label flex items-center gap-1.5"><Shield size={13} /> Member Since</label>
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-500">{new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-display text-lg font-bold mb-5 flex items-center gap-2"><Lock size={18} className="text-primary-600" />Change Password</h3>
                {pwMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl mb-4 text-sm flex items-center gap-2"><CheckCircle2 size={14} />{pwMsg}</div>}
                {pwError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">{pwError}</div>}
                <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="label text-sm">Current Password</label><input type="password" value={pwForm.current_password} onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })} className="input" required /></div>
                    <div><label className="label text-sm">New Password</label><input type="password" value={pwForm.new_password} onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} className="input" required /></div>
                    <div><label className="label text-sm">Confirm Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} className="input" required /></div>
                    <div className="md:col-span-3">
                        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Updating...' : 'Update Password'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}