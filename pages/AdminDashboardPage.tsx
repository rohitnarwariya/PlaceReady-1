
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SeniorMistake, SeniorLearningPost } from '../types';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState<SeniorMistake[]>([]);
  const [learnings, setLearnings] = useState<SeniorLearningPost[]>([]);
  const [activeTab, setActiveTab] = useState<'mistakes' | 'learnings' | 'seniors'>('learnings');

  useEffect(() => {
    const userStr = localStorage.getItem('user_profile');
    if (!userStr || JSON.parse(userStr).role !== 'admin') {
      navigate('/admin-login');
      return;
    }

    const savedMistakes = localStorage.getItem('placeready_mistakes');
    if (savedMistakes) setMistakes(JSON.parse(savedMistakes));

    const savedLearnings = localStorage.getItem('senior_learnings');
    if (savedLearnings) setLearnings(JSON.parse(savedLearnings));
  }, [navigate]);

  const handleApproveLearning = (id: string) => {
    const updated = learnings.map(l => l.id === id ? { ...l, isApproved: true } : l);
    setLearnings(updated);
    localStorage.setItem('senior_learnings', JSON.stringify(updated));
  };

  const handleRejectLearning = (id: string) => {
    const updated = learnings.filter(l => l.id !== id);
    setLearnings(updated);
    localStorage.setItem('senior_learnings', JSON.stringify(updated));
  };

  const pendingMistakes = mistakes.filter(m => !m.isApproved);
  const pendingLearnings = learnings.filter(l => !l.isApproved);

  return (
    <div className="fade-in bg-slate-50 min-h-screen pb-20 font-sans">
      <header className="bg-white border-b px-8 py-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Console</h1>
            <p className="text-slate-500 font-medium">Verified Community Governance</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
             <button 
              onClick={() => setActiveTab('learnings')}
              className={`px-6 py-2 rounded-xl font-bold transition-all text-sm ${activeTab === 'learnings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              Learnings ({pendingLearnings.length})
            </button>
            <button 
              onClick={() => setActiveTab('mistakes')}
              className={`px-6 py-2 rounded-xl font-bold transition-all text-sm ${activeTab === 'mistakes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              Mistakes ({pendingMistakes.length})
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 mt-12">
        {activeTab === 'learnings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              Pending Learnings
              <span className="ml-3 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black">{pendingLearnings.length}</span>
            </h2>

            <div className="grid grid-cols-1 gap-8">
              {pendingLearnings.map(l => (
                <div key={l.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-10 items-start">
                  <div className="flex-grow space-y-6">
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest border border-blue-100">
                        {l.type}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900">{l.title}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Process</p>
                          <p className="text-sm text-slate-600">{l.whatIDid.substring(0, 150)}...</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Pitfall</p>
                          <p className="text-sm text-rose-600 italic">"{l.whatWentWrong.substring(0, 100)}..."</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Takeaway</p>
                        <p className="text-sm text-slate-900 font-bold leading-snug">{l.keyTakeaway}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-400 font-bold">
                      Submitted by {' '}
                      <Link to={`/seniors/profile/${l.seniorId}`} className="text-blue-600 hover:underline">
                        {l.seniorName}
                      </Link>
                      {' '} from {l.seniorCompany}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                    <button 
                      onClick={() => handleApproveLearning(l.id)}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectLearning(l.id)}
                      className="flex-1 md:flex-none bg-white text-red-500 hover:bg-red-50 font-black px-8 py-4 rounded-2xl transition-all border border-red-100 active:scale-95"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}

              {pendingLearnings.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200">
                  <div className="text-5xl mb-6 grayscale opacity-30">🏆</div>
                  <h3 className="text-xl font-bold text-slate-900">Review Queue Empty</h3>
                  <p className="text-slate-400 font-medium">All student contributions have been processed.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Previous tabs logic... */}
        {activeTab === 'mistakes' && (
           <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              Pending Mistakes
              <span className="ml-3 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">{pendingMistakes.length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {pendingMistakes.map(m => (
                <div key={m.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-grow space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">{m.title}</h3>
                    <p className="text-sm text-gray-600 italic">"{m.mistake}"</p>
                  </div>
                  <div className="flex md:flex-col gap-3">
                     <button className="bg-green-600 text-white font-bold px-6 py-3 rounded-xl">Approve</button>
                     <button className="bg-red-50 text-red-600 font-bold px-6 py-3 rounded-xl">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
