
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_MISTAKES } from '../constants';
import { SeniorMistake } from '../types';

const CATEGORIES = ['All', 'Interview', 'Exam', 'DSA', 'Resume', 'Skills', 'Internship', 'General'];

const SeniorMistakesPage: React.FC = () => {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState<SeniorMistake[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user_profile');
    if (userStr) setUser(JSON.parse(userStr));

    fetchMistakes();
  }, [selectedCategory]);

  const fetchMistakes = () => {
    setLoading(true);
    setTimeout(() => {
      const saved = localStorage.getItem('placeready_mistakes');
      let data: SeniorMistake[] = saved ? JSON.parse(saved) : MOCK_MISTAKES;
      
      let approved = data.filter(m => m.isApproved);
      
      if (selectedCategory !== 'All') {
        approved = approved.filter(m => m.category === selectedCategory);
      }

      setMistakes(approved);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fade-in bg-slate-100 min-h-screen pb-32">
      {/* High Contrast Header */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 py-24 px-8 text-white relative shadow-2xl">
        <div className="absolute top-8 left-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-300 hover:text-white font-black transition-all group text-sm bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/10"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Hub
          </button>
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-orange-500/20 text-orange-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-orange-500/30">
            Lessons from the Frontlines
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
            Mistake <span className="text-orange-500">Library</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Real failures from real seniors. Because sometimes knowing what <span className="text-white italic">not</span> to do is more important.
          </p>
          
          {user?.role === 'senior' && (
            <div className="mt-12">
              <Link 
                to="/seniors/mistakes/submit"
                className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-950/20 active:scale-95 inline-flex items-center space-x-2"
              >
                <span>Share Your Pitfall</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-100 to-transparent"></div>
      </header>

      {/* Category Filter Bar - Interactive Pills */}
      <div className="max-w-6xl mx-auto px-8 -mt-10 relative z-20 mb-16">
        <div className="bg-white p-4 rounded-[32px] shadow-xl border border-slate-200 flex items-center justify-center space-x-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                selectedCategory === cat
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                  : 'bg-slate-50 border-transparent text-slate-400 hover:border-orange-200 hover:text-orange-600 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {loading ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 border-8 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Gathering Community Lessons...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {mistakes.map((item) => (
              <div 
                key={item.id}
                className="group bg-white rounded-[48px] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col transition-all duration-500 hover:shadow-[0_40px_80px_rgba(249,115,22,0.12)] hover:-translate-y-4 hover:border-orange-100"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-8 leading-tight group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>

                <div className="space-y-8 flex-grow">
                  <div className="relative pl-6 border-l-4 border-rose-100">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">The Pitfall</p>
                    <p className="text-slate-600 text-[15px] leading-relaxed font-medium italic">"{item.mistake}"</p>
                  </div>
                  
                  <div className="relative pl-6 border-l-4 border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Impact</p>
                    <p className="text-slate-500 text-[14px] leading-relaxed font-medium">{item.consequence}</p>
                  </div>

                  <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-50 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">The Pro Lesson</p>
                    </div>
                    <p className="text-emerald-900 text-[15px] font-bold leading-snug">{item.lesson}</p>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <Link 
                    to={`/seniors/profile/${item.seniorId}`}
                    className="flex items-center space-x-3 group/link"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-sm font-black text-slate-400 uppercase group-hover/link:bg-orange-600 group-hover/link:text-white transition-all">
                      {item.seniorName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 group-hover/link:text-orange-600 transition-colors">{item.seniorName}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Verified Senior</p>
                    </div>
                  </Link>
                  <button className="text-slate-300 hover:text-orange-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {mistakes.length === 0 && (
              <div className="lg:col-span-3 text-center py-48 bg-white rounded-[64px] shadow-sm border border-dashed border-slate-200">
                <div className="text-8xl mb-10 grayscale opacity-10">🚫</div>
                <h3 className="text-3xl font-black text-slate-300">No pitfalls documented here yet</h3>
                <p className="text-slate-400 font-bold mt-6 text-xl max-w-md mx-auto">Be the pioneer and help others by sharing your own experience in this category.</p>
                <button 
                  onClick={() => setSelectedCategory('All')}
                  className="mt-12 bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer Call to Action */}
      <div className="max-w-4xl mx-auto px-8 mt-32 text-center">
        <div className="bg-slate-900 rounded-[40px] p-16 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-6">Found a new mistake?</h2>
            <p className="text-slate-400 font-medium text-lg mb-10">Help your juniors avoid the same roadblocks. Your honesty saves careers.</p>
            <button 
              onClick={() => navigate('/seniors/mistakes/submit')}
              className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-xl"
            >
              Submit to Library
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        </div>
      </div>
    </div>
  );
};

export default SeniorMistakesPage;
