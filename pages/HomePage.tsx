
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fade-in relative overflow-hidden bg-slate-50 min-h-screen">
      {/* Top Feature Cards Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Card 1: Eligibility Check */}
          <div 
            onClick={() => navigate('/readiness')}
            className="group bg-white rounded-[32px] p-10 min-h-[380px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col items-start cursor-pointer hover:-translate-y-3 hover:shadow-[0_25px_60px_rgba(52,168,83,0.15)] hover:border-emerald-200 transition-all duration-500 ease-out"
          >
            <div className="w-20 h-20 mb-10 bg-emerald-50 rounded-3xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:rotate-12 transition-all duration-500">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-emerald-600 group-hover:text-white transition-colors duration-500">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="opacity-20" />
                <path d="M30 50 L45 65 L70 35" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="text-[26px] font-black text-slate-900 mb-3 tracking-tight group-hover:text-emerald-700 transition-colors">Eligibility Check</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed mb-6 font-medium">
                No more guessing. Instantly find out which top-tier companies you are eligible for based on your current CGPA and branch.
              </p>
            </div>
            <div className="flex items-center text-emerald-600 font-black text-sm uppercase tracking-widest group-hover:translate-x-3 transition-transform">
              <span>Try it now</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Card 2: Company Insights */}
          <div 
            onClick={() => navigate('/companies')}
            className="group bg-white rounded-[32px] p-10 min-h-[380px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col items-start cursor-pointer hover:-translate-y-3 hover:shadow-[0_25px_60px_rgba(66,133,244,0.15)] hover:border-blue-200 transition-all duration-500 ease-out"
          >
            <div className="w-20 h-20 mb-10 bg-blue-50 rounded-3xl flex items-center justify-center overflow-hidden group-hover:bg-blue-600 group-hover:-rotate-12 transition-all duration-500">
               <img src="https://img.freepik.com/free-vector/city-skyline-concept-illustration_114360-8025.jpg" alt="Skyline" className="w-14 h-14 object-contain group-hover:invert group-hover:brightness-200 transition-all" />
            </div>
            <div className="flex-grow">
              <h3 className="text-[26px] font-black text-slate-900 mb-3 tracking-tight group-hover:text-blue-700 transition-colors">Company Insights</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed mb-6 font-medium">
                Deep dive into selection rounds, real interview questions, and placement stats. Powered by real data from campus.
              </p>
            </div>
            <div className="flex items-center text-blue-600 font-black text-sm uppercase tracking-widest group-hover:translate-x-3 transition-transform">
              <span>View Data</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Card 3: Senior Guidelines */}
          <div 
            onClick={() => navigate('/seniors')}
            className="group bg-white rounded-[32px] p-10 min-h-[380px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col items-start cursor-pointer hover:-translate-y-3 hover:shadow-[0_25px_60px_rgba(85,64,175,0.15)] hover:border-indigo-200 transition-all duration-500 ease-out"
          >
            <div className="w-20 h-20 mb-10 bg-indigo-50 rounded-3xl flex items-center justify-center overflow-hidden group-hover:bg-indigo-600 transition-all duration-500">
               <img src="https://cdn-icons-png.flaticon.com/512/3429/3429141.png" alt="Graduate" className="w-12 h-12 object-contain group-hover:brightness-0 group-hover:invert transition-all" />
            </div>
            <div className="flex-grow">
              <h3 className="text-[26px] font-black text-slate-900 mb-3 tracking-tight group-hover:text-indigo-700 transition-colors">
                Senior Mentorship
              </h3>
              <p className="text-slate-600 text-[15px] leading-relaxed mb-6 font-medium">
                Get verified guidelines, avoid common pitfalls, and ask doubts. No WhatsApp clutter, just pure placement wisdom.
              </p>
            </div>
            <div className="flex items-center text-indigo-700 font-black text-sm uppercase tracking-widest group-hover:translate-x-3 transition-transform">
              <span>Ask Seniors</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* Hero Content Section */}
      <section className="relative z-10 pt-24 pb-48 text-center px-6">
        <div className="inline-block bg-indigo-50 text-indigo-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100 animate-bounce">
          The All-in-One Placement Tool
        </div>
        <h1 className="text-[48px] md:text-[72px] font-black text-slate-900 mb-8 tracking-tighter leading-[1.05]">
          Turn Senior Experience into <br className="hidden md:block" /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Placement Success</span>
        </h1>
        <p className="text-slate-700 text-[18px] md:text-[22px] max-w-3xl mx-auto mb-12 leading-relaxed font-semibold opacity-90">
          Connect directly with the campus wisdom. Check eligibility, explore company roadmaps, and skip the common mistakes that cost placements.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => navigate('/readiness')}
            className="w-full sm:w-auto bg-blue-600 text-white px-12 py-5 rounded-[24px] font-black text-[18px] hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300 transition-all active:scale-95 transform"
          >
            Check Eligibility
          </button>
          <button 
            onClick={() => navigate('/companies')}
            className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-800 px-12 py-5 rounded-[24px] font-black text-[18px] hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 transform"
          >
            Explore Companies
          </button>
        </div>
      </section>

      {/* Background Illustration Container */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0">
        <div className="relative w-full h-[700px]">
          {/* Enhanced background depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 via-white to-white opacity-60"></div>
          
          <div className="absolute bottom-0 w-full h-[600px] overflow-hidden">
            <svg viewBox="0 0 1440 600" className="w-full h-full preserve-3d" preserveAspectRatio="xMidYMax slice">
              {/* Sharper, more visible hills */}
              <path d="M-100 600 Q200 450 500 550 T1100 480 T1600 600 Z" fill="#cbd5e1" opacity="0.3" />
              <path d="M-100 600 Q300 520 700 580 T1300 530 T1600 600 Z" fill="#94a3b8" opacity="0.2" />
              
              {/* Visual anchors - Blobs with higher contrast */}
              <circle cx="200" cy="560" r="100" fill="#60a5fa" opacity="0.15" />
              <circle cx="1200" cy="560" r="120" fill="#818cf8" opacity="0.1" />
              <circle cx="700" cy="580" r="150" fill="#3b82f6" opacity="0.05" />
              
              {/* Abstract Campus Building Shapes */}
              <rect x="550" y="420" width="340" height="180" rx="20" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
              <rect x="620" y="340" width="200" height="100" rx="15" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="720" cy="340" r="30" fill="white" stroke="#3b82f6" strokeWidth="3" opacity="0.3" />
              <rect x="718" y="325" width="4" height="15" fill="#3b82f6" transform="rotate(30, 720, 340)" />
              
              {/* Floating micro-elements for interactivity feel */}
              <circle cx="100" cy="500" r="10" fill="#60a5fa" opacity="0.4" className="animate-pulse" />
              <circle cx="1340" cy="510" r="15" fill="#818cf8" opacity="0.3" className="animate-bounce" style={{animationDuration: '3s'}} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
