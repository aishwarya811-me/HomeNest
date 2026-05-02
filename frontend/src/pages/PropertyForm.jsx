import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const AMENITIES_LIST = [
    'WiFi', 'AC', 'Geyser', 'Washing Machine', 'Refrigerator',
    'TV', 'Parking', 'Lift', 'Security', 'CCTV',
    'Power Backup', 'Gym', 'Swimming Pool', 'Garden'
];

export default function PropertyForm({ initial = {}, onSubmit, submitting }) {
    const [form, setForm] = useState({
        title: initial.title || '',
        description: initial.description || '',
        city: initial.city || '',
        state: initial.state || '',
        address: initial.address || '',
        rent: initial.rent || '',
        security_deposit: initial.security_deposit || '',
        bedrooms: initial.bedrooms || '',
        bathrooms: initial.bathrooms || '',
        area_sqft: initial.area_sqft || '',
        property_type: initial.property_type || 'apartment',
        furnished: initial.furnished || 'unfurnished',
        floor: initial.floor || '',
        total_floors: initial.total_floors || '',
        parking: initial.parking || 0,
        available_from: initial.available_from || '',
        bachelor_friendly: initial.bachelor_friendly || 0,
        pet_friendly: initial.pet_friendly || 0,
        near_metro: initial.near_metro || 0,
    });

    const [amenities, setAmenities] = useState(initial.amenities || []);
    const [customAmenity, setCustomAmenity] = useState('');
    const [rules, setRules] = useState(
        initial.rules?.map(r => ({ text: r.rule_text, type: r.rule_type })) || [{ text: '', type: 'general' }]
    );
    const [errors, setErrors] = useState({});

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Required';
        if (!form.city.trim()) e.city = 'Required';
        if (!form.state.trim()) e.state = 'Required';
        if (!form.rent) e.rent = 'Required';
        if (!form.bedrooms) e.bedrooms = 'Required';
        if (!form.bathrooms) e.bathrooms = 'Required';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
            ...form,
            rent: +form.rent,
            security_deposit: +(form.security_deposit || 0),
            bedrooms: +form.bedrooms,
            bathrooms: +form.bathrooms,
            area_sqft: form.area_sqft ? +form.area_sqft : null,
            floor: form.floor ? +form.floor : null,
            total_floors: form.total_floors ? +form.total_floors : null,
            parking: +(form.parking || 0),
            bachelor_friendly: form.bachelor_friendly ? 1 : 0,
            pet_friendly: form.pet_friendly ? 1 : 0,
            near_metro: form.near_metro ? 1 : 0,
            rules: rules.filter(r => r.text.trim()),
            amenities,
        });
    };

    const addCustomAmenity = () => {
        if (customAmenity.trim()) {
            setAmenities(prev => [...prev, customAmenity.trim()]);
            setCustomAmenity('');
        }
    };

    const Section = ({ title, children }) => (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-display text-lg font-bold mb-5 pb-3 border-b border-gray-100">{title}</h2>
            {children}
        </div>
    );

    const Field = ({ label, error, children }) => (
        <div>
            <label className="label">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Basic Information ── */}
            <Section title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <Field label="Property Title *" error={errors.title}>
                            <input
                                value={form.title}
                                onChange={e => set('title', e.target.value)}
                                className="input"
                                placeholder="e.g. Spacious 2BHK in Koramangala" />
                        </Field>
                    </div>
                    <Field label="Property Type">
                        <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className="input">
                            {['apartment', 'house', 'villa', 'studio', 'pg', 'commercial'].map(t => (
                                <option key={t} value={t} className="capitalize">{t}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Furnished Status">
                        <select value={form.furnished} onChange={e => set('furnished', e.target.value)} className="input">
                            <option value="unfurnished">Unfurnished</option>
                            <option value="semi">Semi Furnished</option>
                            <option value="fully">Fully Furnished</option>
                        </select>
                    </Field>
                    <div className="md:col-span-2">
                        <Field label="Description">
                            <textarea
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                                rows={3}
                                className="input resize-none"
                                placeholder="Describe the property, surroundings, nearby landmarks..." />
                        </Field>
                    </div>
                </div>
            </Section>

            {/* ── Location ── */}
            <Section title="Location">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="City *" error={errors.city}>
                        <input value={form.city} onChange={e => set('city', e.target.value)} className="input" placeholder="e.g. Bangalore" />
                    </Field>
                    <Field label="State *" error={errors.state}>
                        <input value={form.state} onChange={e => set('state', e.target.value)} className="input" placeholder="e.g. Karnataka" />
                    </Field>
                    <div className="md:col-span-2">
                        <Field label="Full Address">
                            <input value={form.address} onChange={e => set('address', e.target.value)} className="input" placeholder="Street name, locality, landmark..." />
                        </Field>
                    </div>
                </div>
            </Section>

            {/* ── Details & Pricing ── */}
            <Section title="Details & Pricing">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <Field label="Monthly Rent (₹) *" error={errors.rent}>
                        <input type="number" value={form.rent} onChange={e => set('rent', e.target.value)} className="input" placeholder="25000" />
                    </Field>
                    <Field label="Security Deposit (₹)">
                        <input type="number" value={form.security_deposit} onChange={e => set('security_deposit', e.target.value)} className="input" placeholder="50000" />
                    </Field>
                    <Field label="Available From">
                        <input type="date" value={form.available_from} onChange={e => set('available_from', e.target.value)} className="input" />
                    </Field>
                    <Field label="Bedrooms *" error={errors.bedrooms}>
                        <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className="input">
                            <option value="">Select BHK</option>
                            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                        </select>
                    </Field>
                    <Field label="Bathrooms *" error={errors.bathrooms}>
                        <select value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className="input">
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </Field>
                    <Field label="Area (sqft)">
                        <input type="number" value={form.area_sqft} onChange={e => set('area_sqft', e.target.value)} className="input" placeholder="900" />
                    </Field>
                    <Field label="Floor Number">
                        <input type="number" value={form.floor} onChange={e => set('floor', e.target.value)} className="input" placeholder="3" />
                    </Field>
                    <Field label="Total Floors">
                        <input type="number" value={form.total_floors} onChange={e => set('total_floors', e.target.value)} className="input" placeholder="10" />
                    </Field>
                    <Field label="Parking Spots">
                        <input type="number" value={form.parking} onChange={e => set('parking', e.target.value)} className="input" min="0" />
                    </Field>

                    {/* ── Special Features (NEW) ── */}
                    <div className="col-span-2 md:col-span-3">
                        <label className="label">Special Features</label>
                        <div className="flex flex-wrap gap-4 mt-1">
                            {[
                                { key: 'bachelor_friendly', label: '👨‍💼 Bachelor Friendly' },
                                { key: 'pet_friendly', label: '🐾 Pet Friendly' },
                                { key: 'near_metro', label: '🚇 Near Metro' },
                            ].map(f => (
                                <label key={f.key} className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form[f.key] ? 'bg-primary-600 border-primary-600' : 'border-gray-300 group-hover:border-primary-400'}`}>
                                        {form[f.key] ? <span className="text-white text-xs font-bold">✓</span> : null}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={!!form[f.key]}
                                        onChange={e => set(f.key, e.target.checked ? 1 : 0)}
                                        className="hidden" />
                                    <span className="text-sm font-medium text-gray-700">{f.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── Amenities ── */}
            <Section title="Amenities">
                <div className="flex flex-wrap gap-2 mb-4">
                    {AMENITIES_LIST.map(a => (
                        <button
                            key={a}
                            type="button"
                            onClick={() => setAmenities(prev =>
                                prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
                            )}
                            className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all font-medium ${amenities.includes(a)
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'}`}>
                            {amenities.includes(a) ? '✓ ' : ''}{a}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        value={customAmenity}
                        onChange={e => setCustomAmenity(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); } }}
                        className="input flex-1 text-sm"
                        placeholder="Add custom amenity (e.g. Rooftop)..." />
                    <button type="button" onClick={addCustomAmenity} className="btn-outline px-4">Add</button>
                </div>
                {amenities.filter(a => !AMENITIES_LIST.includes(a)).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {amenities.filter(a => !AMENITIES_LIST.includes(a)).map(a => (
                            <span key={a} className="badge bg-gray-100 text-gray-700 px-3 py-1.5 flex items-center gap-1.5">
                                {a}
                                <button type="button" onClick={() => setAmenities(prev => prev.filter(x => x !== a))} className="text-gray-400 hover:text-red-500">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </Section>

            {/* ── Rules & Regulations ── */}
            <Section title="Rules & Regulations">
                <div className="flex justify-end mb-3">
                    <button
                        type="button"
                        onClick={() => setRules(r => [...r, { text: '', type: 'general' }])}
                        className="btn-outline text-sm py-1.5">
                        <Plus size={14} /> Add Rule
                    </button>
                </div>
                <div className="space-y-3">
                    {rules.map((rule, i) => (
                        <div key={i} className="flex gap-2 items-start">
                            <select
                                value={rule.type}
                                onChange={e => setRules(r => r.map((x, j) => j === i ? { ...x, type: e.target.value } : x))}
                                className="input w-40 flex-shrink-0 text-sm">
                                <option value="allowed">✅ Allowed</option>
                                <option value="not_allowed">❌ Not Allowed</option>
                                <option value="general">ℹ️ General</option>
                            </select>
                            <input
                                value={rule.text}
                                onChange={e => setRules(r => r.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
                                className="input flex-1 text-sm"
                                placeholder={
                                    rule.type === 'allowed' ? 'e.g. Couples allowed' :
                                        rule.type === 'not_allowed' ? 'e.g. No smoking inside' :
                                            'e.g. Rent due on 5th of each month'
                                } />
                            {rules.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setRules(r => r.filter((_, j) => j !== i))}
                                    className="p-2.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Submit ── */}
            <div className="flex justify-end gap-3 pb-4">
                <button type="button" onClick={() => window.history.back()} className="btn-outline">
                    Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary px-8">
                    {submitting ? 'Saving...' : 'Save Property'}
                </button>
            </div>
        </form>
    );
}