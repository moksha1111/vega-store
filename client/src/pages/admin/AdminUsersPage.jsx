import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { TrashIcon, ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: me } = useAuth();

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  }, []);

  const toggleRole = async (u) => {
    const action = u.role === 'admin' ? 'remove admin rights from' : 'make admin';
    if (!confirm(`Are you sure you want to ${action} ${u.name}?`)) return;
    try {
      const { data } = await api.put(`/users/${u._id}/role`);
      setUsers(users.map(x => x._id === u._id ? { ...x, role: data.role } : x));
      toast.success(`${u.name} is now ${data.role}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Role update failed'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); setUsers(users.filter(u => u._id !== id)); toast.success('User removed'); }
    catch { toast.error('Delete failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users ({users.length})</h1>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['User','Email','Role','Joined','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">{u.name?.[0]?.toUpperCase()}</div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {u._id !== me._id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleRole(u)}
                        title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                        className={`p-1.5 rounded-lg transition-colors ${u.role === 'admin' ? 'text-indigo-500 hover:bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                        {u.role === 'admin' ? <ShieldCheckIcon className="w-4 h-4" /> : <ShieldExclamationIcon className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteUser(u._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
