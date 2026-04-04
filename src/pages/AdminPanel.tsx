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
    return <div className="min-h-screen bg-stone-900 flex items-center justify-center text-amber-400">Loading Admin Panel...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-900 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-serif text-white">Admin Panel</h1>
              <p className="text-white/60 font-light">Manage user access and payments</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-white/60 hover:text-amber-400 transition-colors text-sm font-medium">
            Go to Dashboard
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-medium text-white">Users</h2>
            <div className="relative">
              <Search className="w-5 h-5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 w-64"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10">
                  <th className="p-4 text-white/60 font-medium text-sm">Name</th>
                  <th className="p-4 text-white/60 font-medium text-sm">Email</th>
                  <th className="p-4 text-white/60 font-medium text-sm">WhatsApp</th>
                  <th className="p-4 text-white/60 font-medium text-sm">Status</th>
                  <th className="p-4 text-white/60 font-medium text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-medium">{u.name || 'N/A'}</td>
                    <td className="p-4 text-white/70 text-sm">{u.email}</td>
                    <td className="p-4 text-white/70 text-sm">{u.whatsapp || 'N/A'}</td>
                    <td className="p-4">
                      {u.paymentStatus === 'approved' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30"><Check className="w-3 h-3" /> Approved</span>}
                      {u.paymentStatus === 'declined' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30"><X className="w-3 h-3" /> Declined</span>}
                      {u.paymentStatus === 'initiated' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30"><Clock className="w-3 h-3" /> Initiated</span>}
                      {(!u.paymentStatus || u.paymentStatus === 'pending') && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium border border-white/10">Pending</span>}
                    </td>
                    <td className="p-4 text-right">
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
