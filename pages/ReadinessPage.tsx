
import React, { useState } from 'react';
import { MOCK_COMPANIES } from '../constants';

interface EligibilityResult {
  companyId: string;
  companyName: string;
  cgpaPassed: boolean;
  branchPassed: boolean;
  skillResults: { skill: string; passed: boolean }[];
  isEligible: boolean;
  isNearlyEligible: boolean;
}

const ReadinessPage: React.FC = () => {
  const [cgpa, setCgpa] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [skills, setSkills] = useState('');
  const [results, setResults] = useState<EligibilityResult[] | null>(null);
  const [showResults, setShowResults] = useState(false);

  const checkEligibility = () => {
    const cgpaVal = parseFloat(cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      alert("Please enter a valid CGPA between 0 and 10.");
      return;
    }

    const userSkills = skills.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== '');
    
    const calculatedResults = MOCK_COMPANIES.map(company => {
      const cgpaPassed = cgpaVal >= company.eligibility.cgpa;
      const branchPassed = company.branch.includes(branch);
      
      // We'll check against mustHaveSkills
      const skillResults = company.mustHaveSkills.map(skill => ({
        skill,
        passed: userSkills.includes(skill.toLowerCase())
      }));

      const allSkillsPassed = skillResults.every(r => r.passed);
      
      const isEligible = cgpaPassed && branchPassed && allSkillsPassed;
      const isNearlyEligible = !isEligible && cgpaPassed && branchPassed && !allSkillsPassed;

      return {
        companyId: company.id,
        companyName: company.name,
        cgpaPassed,
        branchPassed,
        skillResults,
        isEligible,
        isNearlyEligible
      };
    });

    setResults(calculatedResults);
    setShowResults(true);
  };

  const getPreparedCount = () => results ? results.filter(r => r.isEligible).length : 0;
  const getTotalCount = () => MOCK_COMPANIES.length;
  const getPreparedPercentage = () => results ? (getPreparedCount() / getTotalCount()) * 100 : 0;

  const getStatusBadge = () => {
    const pct = getPreparedPercentage();
    if (pct === 100) return { label: 'Ready', color: 'bg-green-100 text-green-700' };
    if (pct >= 50) return { label: 'Almost There', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-700' };
  };

  const getSkillGapAnalysis = () => {
    if (!results) return { has: [], missing: [] };
    const userSkills = skills.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== '');
    
    const allRequired = Array.from(new Set(MOCK_COMPANIES.flatMap(c => c.mustHaveSkills)));
    const has = allRequired.filter(s => userSkills.includes(s.toLowerCase()));
    const missing = allRequired.filter(s => !userSkills.includes(s.toLowerCase()));
    
    return { has, missing };
  };

  const getSuggestedNextStep = () => {
    if (!results) return '';
    const cgpaVal = parseFloat(cgpa);
    const avgCutoff = 8.0;
    
    if (cgpaVal < avgCutoff) return "Focus on improving your CGPA to at least 8.0 to unlock more companies.";
    
    const { missing } = getSkillGapAnalysis();
    if (missing.length > 0) {
      return `Prioritize learning ${missing.slice(0, 3).join(', ')} to increase your eligibility across top firms.`;
    }
    
    return "You are in a great position! Start focusing on mock interviews and company-specific leadership principles.";
  };

  const status = getStatusBadge();
  const { has, missing } = getSkillGapAnalysis();

  return (
    <div className="fade-in min-h-screen bg-[#eaf3fb] pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#f0f7ff] to-[#eaf3fb] py-20 px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-[56px] font-bold text-[#1a1c2e] leading-tight mb-4">Eligibility Results</h1>
            <p className="text-gray-500 text-xl font-medium">Based on your profile, you are eligible for the following companies.</p>
          </div>
          <div className="hidden md:block w-96 h-64 overflow-hidden rounded-2xl relative">
             <img 
               src="https://img.freepik.com/free-vector/modern-university-campus-building-exterior-illustration_1262-16629.jpg" 
               alt="Campus" 
               className="w-full h-full object-cover opacity-60 mix-blend-multiply"
             />
          </div>
        </div>
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-10 relative z-20">
        {/* Input Profile Card */}
        <div className="bg-white rounded-[24px] p-10 shadow-xl shadow-blue-900/5 mb-12">
          <h2 className="text-xl font-bold text-[#1a1c2e] mb-8">Enter Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">CGPA</label>
              <input 
                type="text" 
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="e.g., 7.5"
                className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-[#f8faff] outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Branch</label>
              <select 
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-[#f8faff] outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-600 font-medium appearance-none cursor-pointer"
              >
                <option>CSE</option>
                <option>IT</option>
                <option>ECE</option>
                <option>EEE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Skills (comma separated)</label>
              <input 
                type="text" 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="DSA, OOP, DBMS"
                className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-[#f8faff] outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-600 font-medium"
              />
            </div>
          </div>
          <button 
            onClick={checkEligibility}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold px-10 py-4 rounded-xl shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-95"
          >
            Check Eligibility
          </button>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="fade-in space-y-12">
            
            {/* Summary Strip */}
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1a1c2e]">
                You are prepared for <span className="text-blue-600">{getPreparedCount()} out of {getTotalCount()}</span> target companies
              </h3>
              <span className={`${status.color} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest`}>
                {status.label}
              </span>
            </div>

            {/* Breakdown & Step */}
            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-50">
              <h2 className="text-xl font-bold text-[#1a1c2e] mb-6">Overall Eligibility Breakdown</h2>
              <div className="bg-[#f0f7ff] p-5 rounded-xl flex items-center mb-4">
                 <span className="font-bold text-[#1a1c2e] mr-6">Suggested Next Step</span>
                 <p className="text-gray-600 text-sm font-medium">{getSuggestedNextStep()}</p>
              </div>
            </div>

            {/* Skill Gap Analysis */}
            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#1a1c2e] mb-8">Skill Gap Analysis</h2>
              <div className="flex flex-wrap gap-4">
                {has.map(s => (
                  <div key={s} className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                    <span className="text-green-500">✔</span>
                    <span>{s}</span>
                  </div>
                ))}
                {missing.map(s => (
                  <div key={s} className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-full font-bold text-sm">
                    <span className="text-red-500">✖</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results?.map(res => (
                <div key={res.companyId} className="bg-white rounded-[24px] p-10 shadow-sm border border-gray-50 flex flex-col items-start transition-all hover:shadow-xl">
                  <h3 className="text-[32px] font-bold text-[#1a1c2e] mb-6 tracking-tight">{res.companyName}</h3>
                  
                  <div className="space-y-3 mb-10 w-full">
                    <div className="flex items-center space-x-3 text-sm font-semibold">
                      {res.cgpaPassed ? <span className="text-green-500">✔</span> : <span className="text-red-500">✖</span>}
                      <span className={res.cgpaPassed ? 'text-gray-500' : 'text-red-400 font-medium'}>CGPA Requirement</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-semibold">
                      {res.branchPassed ? <span className="text-green-500">✔</span> : <span className="text-red-500">✖</span>}
                      <span className={res.branchPassed ? 'text-gray-500' : 'text-red-400 font-medium'}>Branch Allowed</span>
                    </div>
                    {res.skillResults.map(sr => (
                      <div key={sr.skill} className="flex items-center space-x-3 text-sm font-semibold">
                        {sr.passed ? <span className="text-green-500">✔</span> : <span className="text-red-500">✖</span>}
                        <span className={sr.passed ? 'text-gray-500' : 'text-red-400 font-medium'}>{sr.skill}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-50 w-full">
                    {res.isEligible ? (
                       <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider">Eligible</span>
                    ) : res.isNearlyEligible ? (
                       <span className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider">Nearly Eligible</span>
                    ) : (
                       <span className="bg-red-50 text-red-500 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider">Not Eligible</span>
                    )}
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

export default ReadinessPage;
