import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, X, Clock, Search } from 'lucide-react';

interface UserData {
  uid: string;
  name: string;
  email: string;
  whatsapp?: string;
  paymentStatus?: 'pending' | 'initiated' | 'approved' | 'declined';
  createdAt?: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.email !== 'dubeyjiinmirzapur@gmail.com') {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData: UserData[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push(doc.data() as UserData);
        });
        // Sort by created date, newest first
        usersData.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  const handleStatusUpdate = async (uid: string, status: 'approved' | 'declined') => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        paymentStatus: status
      });
      setUsers(users.map(u => u.uid === uid ? { ...u, paymentStatus: status } : u));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.whatsapp?.includes(searchTerm)
  );

  if (loading) {
    return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-neutral-500 font-sans tracking-[0.2em] uppercase text-xs">Loading Admin Panel...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-[#333]">
              <Shield className="w-6 h-6 text-neutral-400" />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-white">Admin Panel</h1>
              <p className="text-neutral-500 font-light tracking-wide">Manage user access and payments</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-neutral-500 hover:text-white transition-colors text-xs font-semibold tracking-widest uppercase">
            Go to Dashboard
          </button>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#0f0f0f]/50">
            <h2 className="text-xl font-medium text-white">Users</h2>
            <div className="relative">
              <Search className="w-5 h-5 text-neutral-600 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0f0f0f] border border-[#333] rounded-full pl-12 pr-6 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors w-72"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f0f0f] border-b border-[#333]">
                  <th className="p-5 text-neutral-500 font-semibold text-[10px] tracking-widest uppercase">Name</th>
                  <th className="p-5 text-neutral-500 font-semibold text-[10px] tracking-widest uppercase">Email</th>
                  <th className="p-5 text-neutral-500 font-semibold text-[10px] tracking-widest uppercase">WhatsApp</th>
                  <th className="p-5 text-neutral-500 font-semibold text-[10px] tracking-widest uppercase">Status</th>
                  <th className="p-5 text-neutral-500 font-semibold text-[10px] tracking-widest uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-[#1a1a1a]/20 transition-colors">
                    <td className="p-5 text-white font-medium">{u.name || 'N/A'}</td>
                    <td className="p-5 text-neutral-400 text-sm">{u.email}</td>
                    <td className="p-5 text-neutral-400 text-sm">{u.whatsapp || 'N/A'}</td>
                    <td className="p-5">
                      {u.paymentStatus === 'approved' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20"><Check className="w-3.5 h-3.5" /> Approved</span>}
                      {u.paymentStatus === 'declined' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20"><X className="w-3.5 h-3.5" /> Declined</span>}
                      {u.paymentStatus === 'initiated' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium border border-white/20"><Clock className="w-3.5 h-3.5" /> Initiated</span>}
                      {(!u.paymentStatus || u.paymentStatus === 'pending') && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a]/50 text-neutral-400 text-xs font-medium border border-[#333]">Pending</span>}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(u.uid, 'approved')}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/30"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(u.uid, 'declined')}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
                          title="Decline"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/40">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
