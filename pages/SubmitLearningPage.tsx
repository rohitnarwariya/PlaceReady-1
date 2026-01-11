
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeniorLearningPost, LearningType } from '../types';

const SubmitLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Interview Learning' as LearningType,
    company: '',
    role: '',
    year: '2024',
    whatIDid: '',
    whatWentWrong: '',
    whatILearned: '',
    keyTakeaway: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user_profile');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      if (u.role !== 'senior' && u.role !== 'admin') {
        alert("Only verified seniors can share structured experiences.");
        navigate('/seniors/learnings');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const saved = localStorage.getItem('senior_learnings');
      const posts: SeniorLearningPost[] = saved ? JSON.parse(saved) : [];

      const newPost: SeniorLearningPost = {
        id: `post_${Date.now()}`,
        ...formData,
        seniorId: user.id || 'current',
        seniorName: user.name,
        seniorCompany: user.currentCompany || 'Placement Veteran',
        seniorCollege: user.college || 'Verified Campus',
        isApproved: false, // Must be approved by admin
        createdAt: new Date().toISOString()
      };

      const updated = [newPost, ...posts];
      localStorage.setItem('senior_learnings', JSON.stringify(updated));
      
      alert("Submitted! Your experience is now in the review queue. It will be live after admin verification.");
      navigate('/seniors/learnings');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fade-in bg-slate-50 min-h-screen py-16 px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-400 hover:text-slate-900 font-bold transition-colors group mb-8 text-sm"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          Cancel Submission
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-200">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Knowledge Sharing</h1>
            <p className="text-slate-500 font-medium mt-2">Your post-interview analysis can change a junior's career trajectory.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Metadata */}
            <div className="space-y-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Compelling Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Navigating the Amazon Bar Raiser Round"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Type</label>
                  <select 
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as LearningType})}
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                  >
                    <option value="Interview Learning">Interview Learning</option>
                    <option value="Preparation Tip">Preparation Tip</option>
                    <option value="Experience">Placement Experience</option>
                    <option value="Advice">General Advice</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Company</label>
                  <input 
                    type="text" 
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="e.g. Google"
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Role</label>
                  <input 
                    type="text" 
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    placeholder="e.g. SDE Intern"
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Year</label>
                  <input 
                    type="text" 
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="2024"
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Structured Content */}
            <div className="space-y-8 pt-6 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">What I Did (Process & Prep)</label>
                <textarea 
                  required
                  value={formData.whatIDid}
                  onChange={(e) => setFormData({...formData, whatIDid: e.target.value})}
                  placeholder="Describe your approach, specific resources used, or steps you took during the interview rounds..."
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-700 font-medium min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">What Went Wrong (The Pitfall)</label>
                <textarea 
                  required
                  value={formData.whatWentWrong}
                  onChange={(e) => setFormData({...formData, whatWentWrong: e.target.value})}
                  placeholder="Be honest about where you struggled or what mistake you made..."
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-700 font-medium min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">What I Learned (The Realization)</label>
                <textarea 
                  required
                  value={formData.whatILearned}
                  onChange={(e) => setFormData({...formData, whatILearned: e.target.value})}
                  placeholder="What was the 'Aha!' moment? How would you improve next time?"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-700 font-medium min-h-[100px]"
                />
              </div>

              <div className="space-y-2 bg-slate-900 p-6 rounded-2xl">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Key Takeaway (The Essence)</label>
                <textarea 
                  required
                  value={formData.keyTakeaway}
                  onChange={(e) => setFormData({...formData, keyTakeaway: e.target.value})}
                  placeholder="The one golden rule for juniors... (1-2 lines)"
                  className="w-full px-0 bg-transparent border-none outline-none focus:ring-0 text-white font-bold text-lg placeholder:text-slate-700 min-h-[60px] resize-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-70 text-base"
            >
              {loading ? 'Publishing structured wisdom...' : 'Publish Structured Learning'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitLearningPage;
