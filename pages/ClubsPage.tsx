
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, getDocs, query, orderBy } from '../firebase';
import { Club } from '../types';

const CLUB_DOMAINS = ['All', 'Technical', 'Cultural', 'Sports', 'Robotics', 'Entrepreneurship', 'Social'];

const ClubsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState('All');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const q = query(collection(db, 'clubs'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const clubsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Club[];
        setClubs(clubsData);
      } catch (err) {
        console.error("Error fetching clubs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const filteredClubs = activeDomain === 'All' 
    ? clubs 
    : clubs.filter(c => c.domain === activeDomain);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="fade-in bg-slate-50 min-h-screen pb-32">
      {/* High-Impact Hero */}
      <header className="bg-slate-900 py-24 px-8 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-block bg-blue-600/20 text-blue-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 border border-blue-600/30">
            Official Campus Organizations
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            Campus <span className="text-blue-500">Clubs</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Connect with technical and cultural organizations. Get recruitment guidance directly from senior representatives.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
      </header>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-8 -mt-10 relative z-20">
        <div className="bg-white p-4 rounded-[32px] shadow-xl border border-slate-100 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
          {CLUB_DOMAINS.map(domain => (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                activeDomain === domain 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                  : 'bg-slate-50 border-transparent text-slate-400 hover:border-blue-200 hover:text-blue-600 hover:bg-white'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredClubs.map(club => (
            <div 
              key={club.id}
              onClick={() => navigate(`/clubs/${club.id}`)}
              className="group bg-white rounded-[48px] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 cursor-pointer overflow-hidden relative"
            >
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center p-4 border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                  {club.logoUrl ? (
                    <img src={club.logoUrl} alt={club.name} className="w-full h-full object-contain group-hover:brightness-0 group-hover:invert transition-all" />
                  ) : (
                    <span className="text-3xl font-black text-slate-300 group-hover:text-white">{club.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {club.domain}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight group-hover:text-blue-600 transition-colors">
                    {club.name}
                  </h3>
                </div>
              </div>

              <p className="text-slate-500 font-medium leading-relaxed mb-8 line-clamp-3">
                {club.shortDesc}
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  View Organization
                </span>
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-150 transition-transform opacity-30"></div>
            </div>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[64px] border border-dashed border-slate-200">
            <div className="text-7xl mb-10 grayscale opacity-20">🔍</div>
            <h3 className="text-3xl font-black text-slate-300">No clubs found in this domain</h3>
            <p className="text-slate-400 font-bold mt-4 text-xl">Try exploring another category to connect with organizations.</p>
            <button 
              onClick={() => setActiveDomain('All')}
              className="mt-12 bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all"
            >
              Show All Clubs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubsPage;
