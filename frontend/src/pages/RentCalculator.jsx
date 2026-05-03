import { useState } from 'react';
import { Calculator, Plus, Trash2, IndianRupee } from 'lucide-react';

export default function RentCalculator() {
    const [rent, setRent] = useState('');
    const [deposit, setDeposit] = useState('');
    const [people, setPeople] = useState(2);
    const [extras, setExtras] = useState([{ label: 'Electricity', amount: '' }, { label: 'Water', amount: '' }]);

    const addExtra = () => setExtras([...extras, { label: '', amount: '' }]);
    const removeExtra = (i) => setExtras(extras.filter((_, j) => j !== i));
    const updateExtra = (i, key, val) => setExtras(extras.map((e, j) => j === i ? { ...e, [key]: val } : e));

    const totalMonthly = (+rent || 0) + extras.reduce((s, e) => s + (+e.amount || 0), 0);
    const perPerson = people > 0 ? (totalMonthly / people).toFixed(0) : 0;
    const depositPerPerson = people > 0 ? ((+deposit || 0) / people).toFixed(0) : 0;
    const moveInCost = (+rent || 0) + (+deposit || 0) + extras.reduce((s, e) => s + (+e.amount || 0), 0);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <Calculator size={24} className="text-primary-600" />
                </div>
                <div>
                    <h1 className="font-display text-3xl font-bold">Rent Calculator</h1>
                    <p className="text-gray-500 text-sm">Split rent fairly between roommates</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Monthly Rent (₹)</label>
                        <div className="relative"><IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="number" value={rent} onChange={e => setRent(e.target.value)} className="input pl-8" placeholder="25000" /></div>
                    </div>
                    <div>
                        <label className="label">Security Deposit (₹)</label>
                        <div className="relative"><IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className="input pl-8" placeholder="50000" /></div>
                    </div>
                </div>

                <div>
                    <label className="label">Number of People</label>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setPeople(Math.max(1, people - 1))} className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center font-bold hover:border-primary-400 transition-colors text-lg">−</button>
                        <span className="font-bold text-2xl w-10 text-center">{people}</span>
                        <button onClick={() => setPeople(Math.min(10, people + 1))} className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center font-bold hover:border-primary-400 transition-colors text-lg">+</button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="label mb-0">Extra Expenses</label>
                        <button onClick={addExtra} className="btn-outline py-1.5 text-xs"><Plus size={12} />Add</button>
                    </div>
                    <div className="space-y-2">
                        {extras.map((e, i) => (
                            <div key={i} className="flex gap-2">
                                <input value={e.label} onChange={ev => updateExtra(i, 'label', ev.target.value)} className="input flex-1 text-sm" placeholder="e.g. Internet" />
                                <div className="relative w-32"><IndianRupee size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="number" value={e.amount} onChange={ev => updateExtra(i, 'amount', ev.target.value)} className="input pl-7 text-sm" placeholder="500" /></div>
                                <button onClick={() => removeExtra(i)} className="p-2.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="bg-dark text-white rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold mb-5 text-primary-400">Split Summary</h3>
                <div className="space-y-3">
                    {[
                        { label: 'Total Monthly Cost', value: `₹${totalMonthly.toLocaleString('en-IN')}`, highlight: false },
                        { label: `Per Person (${people} people)`, value: `₹${(+perPerson).toLocaleString('en-IN')}/mo`, highlight: true },
                        { label: 'Deposit Per Person', value: `₹${(+depositPerPerson).toLocaleString('en-IN')}`, highlight: false },
                        { label: 'Total Move-in Cost', value: `₹${moveInCost.toLocaleString('en-IN')}`, highlight: false },
                        { label: 'Move-in Per Person', value: `₹${((moveInCost / people) || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, highlight: true },
                    ].map(r => (
                        <div key={r.label} className={`flex justify-between items-center py-2.5 ${r.highlight ? 'bg-white/10 rounded-xl px-3' : 'border-b border-white/10'}`}>
                            <span className="text-sm text-gray-400">{r.label}</span>
                            <span className={`font-bold ${r.highlight ? 'text-primary-400 text-lg' : 'text-white'}`}>{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}