
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SeniorHubPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fade-in bg-slate-50 min-h-screen">
      <header className="bg-gradient-to-br from-indigo-700 to-blue-900 py-24 px-8 text-center text-white relative">
        <div className="absolute top-8 left-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-blue-100 hover:text-white font-bold transition-colors group text-sm"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Home
          </button>
        </div>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-black mb-6 tracking-tight">Senior Knowledge Hub</h1>
          <p className="text-blue-100 text-xl font-medium opacity-90 leading-relaxed">
            Direct access to verified placement wisdom. No clutter, just structure.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
      </header>

      <div className="max-w-7xl mx-auto py-20 px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Guidelines Card - REBRANDED TO LEARNINGS */}
        <div 
          onClick={() => navigate('/seniors/learnings')}
          className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer group flex flex-col items-center text-center overflow-hidden relative"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mb-10 group-hover:bg-blue-600 transition-all duration-500 transform group-hover:rotate-12">
            <svg className="w-12 h-12 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-[26px] font-black text-slate-900 mb-4 tracking-tight">Overall Guidelines</h3>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Verified interview post-mortems and structured preparation paths in a professional feed.
          </p>
          <div className="mt-auto w-full">
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-blue-600 transition-all shadow-xl shadow-slate-100">
              Read Experiences
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-150 transition-transform opacity-30"></div>
        </div>

        {/* Q&A Card */}
        <div 
          onClick={() => navigate('/seniors/qa')}
          className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer group flex flex-col items-center text-center overflow-hidden relative"
        >
          <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mb-10 group-hover:bg-emerald-500 transition-all duration-500 transform group-hover:-rotate-12">
            <svg className="w-12 h-12 text-emerald-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-[26px] font-black text-slate-900 mb-4 tracking-tight">Ask Seniors</h3>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Connect with campus veterans to resolve specific placement doubts in the discussion forum.
          </p>
          <div className="mt-auto w-full">
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-emerald-500 transition-all shadow-xl shadow-slate-100">
              Join Discussion
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-150 transition-transform opacity-30"></div>
        </div>

        {/* Mistakes Card */}
        <div 
          onClick={() => navigate('/seniors/mistakes')}
          className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer group flex flex-col items-center text-center overflow-hidden relative"
        >
          <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center mb-10 group-hover:bg-orange-500 transition-all duration-500 transform group-hover:scale-110">
            <svg className="w-12 h-12 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-[26px] font-black text-slate-900 mb-4 tracking-tight">Mistake Library</h3>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Learn from the real failures of your seniors. Don't repeat the same mistakes they made.
          </p>
          <div className="mt-auto w-full">
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-orange-500 transition-all shadow-xl shadow-slate-100">
              Explore Failures
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-150 transition-transform opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default SeniorHubPage;
