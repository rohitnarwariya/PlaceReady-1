
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_COMPANIES } from '../constants';

const CompanyInsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const branches = ['All', 'CSE', 'IT', 'ECE', 'EEE'];

  const filteredCompanies = filter === 'All'
    ? MOCK_COMPANIES
    : MOCK_COMPANIES.filter(c => c.branch.includes(filter));

  return (
    <div className="fade-in bg-slate-50 min-h-screen">
      <header className="bg-white py-20 border-b px-8 shadow-sm relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-blue-600 font-bold transition-all group text-sm mb-8"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter">Company Insights</h1>
              <p className="text-slate-500 text-xl font-medium max-w-xl">
                Get insider knowledge on selection rounds, eligibility cutoffs, and verified placement statistics.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {branches.map(b => (
                <button 
                  key={b}
                  onClick={() => setFilter(b)}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    filter === b 
                      ? 'bg-white text-blue-600 shadow-md border border-slate-200' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-48 -mt-48"></div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredCompanies.map(company => (
            <div 
              key={company.id}
              onClick={() => navigate(`/companies/${company.id}`)}
              className="group bg-white rounded-[48px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(66,133,244,0.12)] transition-all duration-500 border border-slate-100 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-4 overflow-hidden"
            >
              {/* Realistic Company Banner */}
              <div className="w-full h-48 relative overflow-hidden">
                <img 
                  src={company.bannerImage} 
                  alt={`${company.name} office`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
              </div>

              {/* Logo (Shifted up slightly over the banner) */}
              <div className="relative -mt-16 mb-6">
                <div className="w-28 h-28 bg-white rounded-[32px] shadow-2xl flex items-center justify-center p-4 border border-slate-100 z-10 overflow-hidden">
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </div>

              <div className="flex-grow px-8 pb-8">
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                  {company.name}
                </h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed font-medium line-clamp-2">
                  {company.description}
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {company.branch.slice(0, 3).map(b => (
                    <span key={b} className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-100">
                      {b}
                    </span>
                  ))}
                  {company.branch.length > 3 && (
                    <span className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-100">
                      +{company.branch.length - 3} More
                    </span>
                  )}
                </div>

                {/* Verified Placement Stats Strip */}
                <div className="w-full bg-slate-50/50 rounded-3xl p-6 border border-slate-50 flex items-center justify-around mb-8">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Placed</p>
                    <p className="text-2xl font-black text-blue-600">{company.placedCount}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Min CGPA</p>
                    <p className="text-2xl font-black text-slate-900">{company.eligibility.cgpa}</p>
                  </div>
                </div>

                <button 
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl group-hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 text-xs uppercase tracking-widest flex items-center justify-center space-x-2"
                >
                  <span>Full Insight Report</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[64px] border border-dashed border-slate-200">
            <div className="text-6xl mb-8 grayscale opacity-20">🏢</div>
            <h3 className="text-2xl font-black text-slate-400">No companies found for this filter</h3>
            <p className="text-slate-300 font-bold mt-4">Try selecting another branch to view active campus insights.</p>
            <button 
              onClick={() => setFilter('All')}
              className="mt-10 bg-blue-50 text-blue-600 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-100 transition-all"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInsightsPage;
