import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', address: user?.address || {} });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, address: form.address };
      if (form.password) payload.password = form.password;
      const { data } = await api.put('/users/profile', payload);
      login({ ...user, ...data });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className="text-xl font-bold text-gray-900">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-600 capitalize">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[['name','Full Name','text'],['email','Email','email']].map(([field,label,type]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <input type={type} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="••••••••" />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              {[['street','Street','col-span-2'],['city','City',''],['state','State',''],['zip','ZIP',''],['country','Country','']].map(([field,label,cls]) => (
                <div key={field} className={cls}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input value={form.address?.[field] || ''} onChange={e => setForm({...form, address: {...form.address, [field]: e.target.value}})} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
