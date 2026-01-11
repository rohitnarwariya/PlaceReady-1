
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_LEARNINGS } from '../constants';
import { SeniorLearningPost, LearningType } from '../types';

const FILTER_TYPES: (LearningType | 'All')[] = ['All', 'Interview Learning', 'Preparation Tip', 'Experience', 'Advice'];

const SeniorLearningsPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<SeniorLearningPost[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<LearningType | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [validations, setValidations] = useState<Record<string, number>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const userStr = localStorage.getItem('user_profile');
    if (userStr) setUser(JSON.parse(userStr));

    const fetchPosts = () => {
      const saved = localStorage.getItem('senior_learnings');
      const initialPosts = saved ? JSON.parse(saved) : MOCK_LEARNINGS;
      setPosts(initialPosts.filter((p: SeniorLearningPost) => p.isApproved));
      
      const initialValidations: Record<string, number> = {};
      initialPosts.forEach((p: any) => initialValidations[p.id] = Math.floor(Math.random() * 100) + 50);
      setValidations(initialValidations);
      
      setLoading(false);
    };

    setTimeout(fetchPosts, 400);
  }, []);

  const filteredPosts = activeFilter === 'All' 
    ? posts 
    : posts.filter(p => p.type === activeFilter);

  const handleValidate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setValidations(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Permanent deletion of this strategic report?")) return;
    const saved = localStorage.getItem('senior_learnings');
    const allPosts: SeniorLearningPost[] = saved ? JSON.parse(saved) : MOCK_LEARNINGS;
    const updated = allPosts.filter(p => p.id !== id);
    localStorage.setItem('senior_learnings', JSON.stringify(updated));
    setPosts(updated.filter(p => p.isApproved));
  };

  return (
    <div className="fade-in bg-[#f8fafc] min-h-screen pb-32 font-sans selection:bg-blue-100">
      {/* Immersive Relatable Hero Header */}
      <header className="bg-slate-900 py-32 px-12 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto relative z-10">
          <button 
            onClick={() => navigate('/seniors')}
            className="text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] mb-16 block transition-all group"
          >
            <span className="mr-3 group-hover:-translate-x-2 inline-block transition-transform">←</span> Back to Knowledge Hub
          </button>
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Operational Intel</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Repository</span>
              </div>
              <h1 className="text-7xl md:text-8xl xl:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-10">
                The Placement <br/> <span className="text-blue-500 italic font-serif">Survival</span> Guide
              </h1>
              <p className="text-slate-400 font-medium text-2xl leading-relaxed max-w-2xl opacity-90">
                The field manual for campus recruitment. Real stories from seniors who've been in the hot seat—unfiltered and ready to use.
              </p>
            </div>
            {user?.role === 'senior' && (
              <button 
                onClick={() => navigate('/seniors/learnings/submit')}
                className="bg-white hover:bg-blue-600 text-slate-900 hover:text-white font-black px-16 py-6 rounded-[24px] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 uppercase text-xs tracking-[0.3em]"
              >
                Log New Intel
              </button>
            )}
          </div>
        </div>
        {/* Cinematic Background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] -mr-96 -mt-96"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
      </header>

      {/* Full-Width Analytical Filter Strip */}
      <div className="sticky top-[73px] z-30 bg-white/90 backdrop-blur-3xl border-b border-slate-200 py-8">
        <div className="max-w-[1440px] mx-auto px-12">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mr-8 whitespace-nowrap">Catalog Filter:</span>
            {FILTER_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] transition-all whitespace-nowrap border-2 ${
                  activeFilter === type 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-200' 
                    : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Immersive Wide Feed */}
      <div className="max-w-[1440px] mx-auto px-12 mt-20 space-y-8">
        {loading ? (
          <div className="py-64 text-center space-y-8">
            <div className="w-20 h-20 border-[8px] border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-[11px]">Deciphering Archive Data...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => {
            const isExpanded = expandedIds.has(post.id);
            return (
              <article 
                key={post.id} 
                onClick={() => toggleExpand(post.id)}
                className={`group bg-white transition-all duration-700 cursor-pointer overflow-hidden border ${
                  isExpanded 
                    ? 'rounded-[80px] shadow-[0_80px_160px_rgba(15,23,42,0.15)] mb-24 border-slate-200' 
                    : 'rounded-[32px] shadow-sm hover:shadow-2xl hover:border-blue-300 py-6 px-16 border-slate-100'
                }`}
              >
                {/* Collapsed View (Clean Headline) */}
                {!isExpanded && (
                  <div className="flex items-center justify-between gap-12 py-6">
                    <div className="flex items-center gap-12 flex-grow overflow-hidden">
                      <div className="flex-shrink-0 w-32 px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest text-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        {post.company}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 truncate tracking-tight group-hover:text-blue-600 transition-colors duration-500">
                        {post.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-12 flex-shrink-0">
                      <div className="hidden lg:block">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Dossier ID</p>
                        <p className="text-xs font-black text-slate-900 tracking-widest">#{post.id.split('_').pop()?.toUpperCase()}</p>
                      </div>
                      <div className="flex items-center gap-4 text-blue-500 group-hover:translate-x-3 transition-all duration-500">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Deploy Intelligence</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Width Expanded Dossier */}
                {isExpanded && (
                  <div className="animate-in fade-in slide-in-from-top-8 duration-700">
                    {/* Dossier Header */}
                    <div className="p-16 pb-0 flex items-center justify-between">
                      <div className="flex items-center gap-10">
                        <div className="flex items-center gap-4">
                           <div className="w-3 h-10 bg-blue-600 rounded-full"></div>
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Confidential Report: {post.id.toUpperCase()}</h4>
                        </div>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="px-8 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
                          {post.type}
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                         {(user?.role === 'admin' || (user?.role === 'senior' && user?.id === post.seniorId)) && (
                          <button 
                            onClick={(e) => handleDelete(e, post.id)}
                            className="text-[11px] text-rose-400 hover:text-rose-600 font-black uppercase tracking-widest transition-colors mr-4"
                          >
                            Archive Post-Mortem
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleExpand(post.id); }}
                          className="bg-slate-50 hover:bg-slate-900 text-slate-400 hover:text-white p-5 rounded-full transition-all duration-500"
                        >
                          <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Massive Title Block */}
                    <div className="p-16 pt-12">
                      <h2 className="text-6xl xl:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-12 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-4 bg-slate-50 px-8 py-5 rounded-[24px] border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</span>
                          <span className="text-lg font-black text-slate-900">{post.company}</span>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 px-8 py-5 rounded-[24px] border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Role</span>
                          <span className="text-lg font-black text-slate-900">{post.role}</span>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 px-8 py-5 rounded-[24px] border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Year</span>
                          <span className="text-lg font-black text-slate-900">{post.year}</span>
                        </div>
                      </div>
                    </div>

                    {/* Full-Width Visual Asset */}
                    <div className="px-16">
                      <div className="h-[650px] w-full relative overflow-hidden rounded-[64px] bg-slate-100 shadow-2xl">
                        <img 
                          src={post.imageUrl || `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000`} 
                          alt={post.title} 
                          className="w-full h-full object-cover opacity-90 transition-transform duration-[6s] hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                        <div className="absolute bottom-16 left-16">
                          <div className="bg-blue-600 px-6 py-2 rounded-full inline-block mb-6">
                            <span className="text-white text-[10px] font-black uppercase tracking-[0.4em]">Strategic Briefing</span>
                          </div>
                          <p className="text-white text-5xl font-black tracking-tight max-w-2xl leading-none">
                            "Success in this round required more than just coding—it required presence."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* The Playbook: Comprehensive Analysis */}
                    <div className="p-16 space-y-20">
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-20">
                        <div className="space-y-6">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-blue-200">01</div>
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Execution Protocol</h4>
                          </div>
                          <p className="text-slate-700 text-lg leading-relaxed font-medium">
                            {post.whatIDid}
                          </p>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-rose-200">02</div>
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Failures</h4>
                          </div>
                          <div className="relative pl-10 border-l-4 border-rose-100">
                             <p className="text-slate-600 text-lg leading-relaxed font-medium italic">
                              "{post.whatWentWrong}"
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-emerald-200">03</div>
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Critical Realizations</h4>
                          </div>
                          <p className="text-slate-700 text-lg leading-relaxed font-medium">
                            {post.whatILearned}
                          </p>
                        </div>
                      </div>

                      {/* High-Impact Core Takeaway */}
                      <div className="bg-slate-900 rounded-[64px] p-24 relative overflow-hidden shadow-2xl group/takeaway">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-16">
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-5xl shadow-2xl shadow-blue-500/40 group-hover/takeaway:rotate-12 transition-transform duration-500">
                              🎯
                            </div>
                          </div>
                          <div>
                            <h4 className="text-blue-400 font-black text-[11px] uppercase tracking-[0.5em] mb-6 opacity-60">The Survival Imperative</h4>
                            <p className="text-white font-black text-4xl xl:text-5xl leading-[1.1] tracking-tighter">
                              {post.keyTakeaway}
                            </p>
                          </div>
                        </div>
                        {/* Background flare */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                      </div>

                      {/* Dossier Footer: Attribution */}
                      <div className="pt-16 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                        <div className="flex items-center gap-8">
                          <Link 
                            to={`/seniors/profile/${post.seniorId}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="group/author flex items-center gap-6 bg-slate-50 pr-10 pl-2 py-2 rounded-full border border-slate-100 hover:bg-white hover:border-blue-200 transition-all"
                          >
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-2xl group-hover/author:bg-blue-600 transition-colors">
                              {post.seniorName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dossier Contributor</p>
                              <p className="text-lg font-black text-slate-900">{post.seniorName} <span className="text-slate-300 mx-2">•</span> <span className="text-blue-600 uppercase text-[10px] tracking-widest">{post.seniorCompany}</span></p>
                            </div>
                          </Link>
                        </div>

                        <div className="flex items-center gap-6">
                          <button 
                            onClick={(e) => handleValidate(e, post.id)}
                            className="flex items-center gap-5 bg-slate-50 hover:bg-emerald-600 text-slate-500 hover:text-white px-12 py-5 rounded-[24px] transition-all font-black text-[11px] uppercase tracking-widest active:scale-95 group/val border border-slate-100 shadow-sm"
                          >
                            <span className="text-2xl group-hover/val:scale-125 transition-transform">✓</span>
                            <span>Acknowledge Strategy</span>
                            <span className="bg-slate-200 group-hover:bg-emerald-500 px-3 py-1 rounded-lg text-[10px] ml-2 text-slate-900 group-hover:text-white">{validations[post.id] || 0}</span>
                          </button>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleExpand(post.id); }}
                            className="flex items-center gap-5 bg-slate-900 text-white px-12 py-5 rounded-[24px] transition-all font-black text-[11px] uppercase tracking-widest active:scale-95 border border-slate-900 shadow-2xl"
                          >
                            <span>Close Dossier</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="text-center py-80 bg-white rounded-[100px] border-4 border-dashed border-slate-100 shadow-sm">
            <div className="text-[120px] mb-12 grayscale opacity-10">🛡️</div>
            <h3 className="text-5xl font-black text-slate-300">Vault Empty</h3>
            <p className="text-slate-400 font-bold mt-8 text-2xl max-w-xl mx-auto opacity-70">No intelligence reports matching this taxonomy have been cleared for release.</p>
            <button 
              onClick={() => setActiveFilter('All')}
              className="mt-16 bg-slate-900 text-white px-16 py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.4em] hover:bg-blue-600 transition-all active:scale-95 shadow-2xl"
            >
              Reboot Repository
            </button>
          </div>
        )}
      </div>

      {/* Global Knowledge Contribution Callout */}
      <div className="max-w-[1440px] mx-auto px-12 mt-48">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[80px] p-24 text-center shadow-[0_100px_200px_rgba(0,0,0,0.2)] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-6xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-none">Strengthen the Network</h2>
            <p className="text-slate-400 text-2xl font-medium mb-16 max-w-3xl mx-auto opacity-80 leading-relaxed">
              Your data point is someone else's breakthrough. Draft your intelligence report today and ensure the next generation of students survives the placement season.
            </p>
            <button 
              onClick={() => navigate('/seniors/learnings/submit')}
              className="bg-blue-600 text-white px-20 py-7 rounded-[24px] font-black text-sm uppercase tracking-[0.4em] hover:bg-blue-500 transition-all shadow-[0_20px_60px_rgba(37,99,235,0.3)] active:scale-95"
            >
              Draft Survival Report
            </button>
          </div>
          {/* Subtle decor */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] -mr-32 -mt-32"></div>
        </div>
      </div>
    </div>
  );
};

export default SeniorLearningsPage;
