
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_COMPANIES, MOCK_PLACEMENTS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import { db, collection, query, where, getDocs, doc, getDoc } from '../firebase';
import { PlacedStudentDisplay } from '../types';

interface MatchResult {
  matchScore: number;
  verdict: string;
  gaps: string[];
  tips: string[];
}

const CompanyDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = MOCK_COMPANIES.find(c => c.id === id);

  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  
  // Placement Data State
  const [placedStudents, setPlacedStudents] = useState<PlacedStudentDisplay[]>([]);
  const [loadingPlacements, setLoadingPlacements] = useState(true);

  useEffect(() => {
    const fetchPlacements = async () => {
      if (!id) return;
      setLoadingPlacements(true);
      try {
        // 1. Fetch from Firestore
        const pQuery = query(collection(db, 'placements'), where('companyId', '==', id), where('isVerified', '==', true));
        const pSnapshot = await getDocs(pQuery);
        
        const fetchedPlacements: PlacedStudentDisplay[] = [];
        for (const pDoc of pSnapshot.docs) {
          const pData = pDoc.data();
          const userDoc = await getDoc(doc(db, 'users', pData.userId));
          
          if (userDoc.exists()) {
            const uData = userDoc.data();
            fetchedPlacements.push({
              id: pDoc.id,
              userId: pData.userId,
              companyId: pData.companyId,
              roleOffered: pData.roleOffered,
              placementYear: pData.placementYear,
              isVerified: pData.isVerified,
              userName: uData.name,
              userBranch: uData.branch,
              userGradYear: uData.graduationYear || pData.placementYear,
              userProfilePic: uData.profilePic,
              userLinkedin: uData.linkedinUrl
            });
          }
        }

        // 2. Fallback/Merge with Mock Data for demonstration
        const mockRelevant = MOCK_PLACEMENTS.filter(p => p.companyId === id);
        const finalData = [...fetchedPlacements];
        
        // Ensure no duplicates if using same IDs
        mockRelevant.forEach(m => {
          if (!finalData.find(f => f.userId === m.userId)) {
            finalData.push(m);
          }
        });

        setPlacedStudents(finalData);
      } catch (err) {
        console.error("Error fetching placements:", err);
      } finally {
        setLoadingPlacements(false);
      }
    };

    fetchPlacements();
  }, [id]);

  if (!company) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold">Company not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold">Back</button>
      </div>
    );
  }

  const checkCompatibility = async () => {
    const userStr = localStorage.getItem('user_profile');
    if (!userStr) {
      alert("Please sign up or log in to check compatibility!");
      navigate('/signup');
      return;
    }

    const user = JSON.parse(userStr);
    setLoadingMatch(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Compare this student profile with the company requirements for ${company.name}. 
        User: ${user.branch} branch, ${user.cgpa} CGPA, Skills: ${user.skills}.
        Company Requirements: ${company.mustHaveSkills.join(', ')} skills, ${company.eligibility.cgpa} min CGPA.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.NUMBER, description: "Percentage match 0-100" },
              verdict: { type: Type.STRING, description: "Short summary of fit" },
              gaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Missing skills or criteria" },
              tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Steps to improve chances" }
            },
            required: ["matchScore", "verdict", "gaps", "tips"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setMatchResult(data);
    } catch (error) {
      console.error("AI Match failed:", error);
      alert("AI Analysis failed. Please try again.");
    } finally {
      setLoadingMatch(false);
    }
  };

  return (
    <div className="fade-in bg-gray-50 min-h-screen pb-20">
      {/* Company Snapshot */}
      <div className="bg-white border-b sticky top-[73px] z-40 px-8 py-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center space-x-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border">
            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
            <p className="text-gray-500 text-sm font-medium">{company.description}</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="ml-auto text-gray-400 hover:text-blue-600 font-bold flex items-center space-x-2 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span className="hidden sm:inline ml-2">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          
          {/* AI Compatibility Section */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center">
                    <span className="mr-2">✨</span> AI Match Analysis
                  </h3>
                  <p className="text-blue-700/70 text-sm">How well do you fit with {company.name}'s current criteria?</p>
                </div>
                {!matchResult && !loadingMatch && (
                  <button 
                    onClick={checkCompatibility}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    Analyze My Profile
                  </button>
                )}
              </div>

              {loadingMatch && (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-blue-600 font-bold animate-pulse">Gemini is comparing your profile...</p>
                </div>
              )}

              {matchResult && (
                <div className="fade-in space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8 bg-white/50 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-100" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * matchResult.matchScore) / 100} strokeLinecap="round" className="text-blue-600" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-gray-800">{matchResult.matchScore}%</span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Match</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2">Verdict: {matchResult.matchScore > 75 ? 'Strong Fit! 🎉' : 'Needs Preparation'}</h4>
                      <p className="text-gray-600 text-sm italic">"{matchResult.verdict}"</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100">
                      <h5 className="text-red-700 font-bold text-sm mb-3 flex items-center">
                        <span className="mr-2">🚩</span> Skill Gaps
                      </h5>
                      <ul className="space-y-1">
                        {matchResult.gaps.map((gap, i) => (
                          <li key={i} className="text-red-800 text-xs flex items-center"><span className="mr-2">•</span> {gap}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                      <h5 className="text-green-700 font-bold text-sm mb-3 flex items-center">
                        <span className="mr-2">🚀</span> Strategy Tips
                      </h5>
                      <ul className="space-y-1">
                        {matchResult.tips.map((tip, i) => (
                          <li key={i} className="text-green-800 text-xs flex items-center"><span className="mr-2">•</span> {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMatchResult(null)}
                    className="text-xs text-blue-400 font-bold hover:text-blue-600"
                  >
                    Reset Match Analysis
                  </button>
                </div>
              )}
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl"></div>
          </section>

          {/* VERIFIED PLACED STUDENTS SECTION */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="w-2 h-8 bg-emerald-500 rounded-full mr-4"></span>
                Students Placed at {company.name}
              </h3>
              <div className="bg-slate-50 px-4 py-1 rounded-full text-[10px] font-black uppercase text-slate-400 border border-slate-100">
                {placedStudents.length} Verified
              </div>
            </div>

            {loadingPlacements ? (
              <div className="py-10 text-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Resolving Profiles...</p>
              </div>
            ) : placedStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {placedStudents.map((student) => (
                  <div key={student.id} className="group bg-slate-50 hover:bg-white rounded-3xl p-6 border border-transparent hover:border-emerald-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <Link to={`/seniors/profile/${student.userId}`} className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-black text-slate-300 overflow-hidden border border-slate-100">
                        {student.userProfilePic ? (
                          <img src={student.userProfilePic} alt={student.userName} className="w-full h-full object-cover" />
                        ) : (
                          student.userName.charAt(0)
                        )}
                      </Link>
                      <div className="flex-grow min-w-0">
                        <Link to={`/seniors/profile/${student.userId}`} className="block font-black text-slate-900 hover:text-blue-600 transition-colors truncate">
                          {student.userName}
                        </Link>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          {student.userBranch} • Class of {student.userGradYear}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {student.roleOffered}
                          </span>
                          
                          {student.userLinkedin && (
                            <a 
                              href={student.userLinkedin} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-slate-300 hover:text-[#0077b5] transition-colors p-1"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-100">
                <p className="text-slate-400 font-bold italic text-sm">No verified placement records linked to this organization yet.</p>
              </div>
            )}
          </section>

          {/* Campus Placement History */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-blue-600 rounded-full mr-4"></span>
              Campus Placement History
            </h3>
            <div className="flex items-center space-x-12">
              <div className="text-center">
                <p className="text-5xl font-black text-blue-600">{company.placedCount}</p>
                <p className="text-gray-500 font-medium mt-2">Placed Last Year</p>
              </div>
              <div className="flex-grow bg-blue-50 h-4 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[70%]"></div>
              </div>
            </div>
          </section>

          {/* Eligibility Check */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded-full mr-4"></span>
              Eligibility Check
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-6 bg-gray-50 rounded-2xl">
                <p className="text-xs uppercase font-black text-gray-400 mb-2 tracking-widest">Academic Cutoff</p>
                <p className="text-2xl font-bold text-gray-800">{company.eligibility.cgpa} CGPA</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl">
                <p className="text-xs uppercase font-black text-gray-400 mb-2 tracking-widest">Target Branches</p>
                <div className="flex flex-wrap gap-2">
                  {company.branch.map(b => (
                    <span key={b} className="bg-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm border text-gray-600">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Interview Process */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
              <span className="w-2 h-8 bg-purple-600 rounded-full mr-4"></span>
              Selection Workflow
            </h3>
            <div className="relative pl-8 border-l-2 border-dashed border-gray-200 ml-4 space-y-12">
              {company.process.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[41px] top-0 w-5 h-5 bg-white border-4 border-blue-600 rounded-full"></div>
                  <h4 className="font-bold text-gray-800 text-lg">Round {idx + 1}: {step}</h4>
                  <p className="text-gray-500 mt-1 text-sm">Typical duration: 45-60 mins. Focuses on core competencies.</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Skills Matrix */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider text-center">Skills Matrix</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black text-red-500 uppercase mb-3">Must Have</p>
                <div className="flex flex-wrap gap-2">
                  {company.mustHaveSkills.map(s => (
                    <span key={s} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-green-600 uppercase mb-3">Good to Have</p>
                <div className="flex flex-wrap gap-2">
                  {company.goodToHaveSkills.map(s => (
                    <span key={s} className="bg-green-50 text-green-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-green-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Insider Tips */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider">Insider Tips</h3>
            <div className="space-y-4">
              {company.seniorInsights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                  <p className="text-gray-700 text-sm leading-relaxed italic">"{insight}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 shadow-xl text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="mr-2">⚡</span> Preparation Roadmap
            </h3>
            <div className="space-y-4">
              {company.preparationPriority.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <span className="font-black text-blue-300">0{idx + 1}</span>
                  <span className="text-sm font-semibold">{step}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/readiness')}
              className="w-full mt-8 bg-white text-blue-700 font-black py-4 rounded-2xl shadow-lg hover:bg-gray-100 transition-all"
            >
              GENERATE CUSTOM PLAN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
