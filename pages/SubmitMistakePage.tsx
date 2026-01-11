
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeniorMistake } from '../types';

const ALLOWED_CATEGORIES = ['Interview', 'Exam', 'DSA', 'Resume', 'Skills', 'Internship', 'General'];

const SubmitMistakePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '', // Empty initially to force selection
    mistake: '',
    consequence: '',
    lesson: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user_profile');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      if (u.role !== 'senior') {
        alert("Only verified seniors can share mistakes.");
        navigate('/seniors/mistakes');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      alert("Please select a valid category.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const saved = localStorage.getItem('placeready_mistakes');
      const mistakes: SeniorMistake[] = saved ? JSON.parse(saved) : [];

      const newMistake: SeniorMistake = {
        id: Date.now().toString(),
        ...formData,
        category: formData.category as any,
        seniorId: user.id || 'current',
        seniorName: user.name,
        isApproved: false, // Needs admin approval
        createdAt: new Date().toISOString()
      };

      const updated = [newMistake, ...mistakes];
      localStorage.setItem('placeready_mistakes', JSON.stringify(updated));
      
      alert("Your experience has been submitted for admin approval! Thank you for helping the community.");
      navigate('/seniors/mistakes');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fade-in bg-[#f0f7ff] min-h-screen py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-blue-600 font-bold transition-colors group mb-8"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          Cancel Submission
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl p-10 md:p-16 border border-blue-50">
          <header className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Help Others Learn</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              Sharing your mistakes is the most powerful way to guide juniors. Describe your experience below.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Mistake Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Underestimating Behavioral Rounds"
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Category</label>
              <select 
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-600 font-medium appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a Category</option>
                {ALLOWED_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">What was the mistake?</label>
              <textarea 
                required
                value={formData.mistake}
                onChange={(e) => setFormData({...formData, mistake: e.target.value})}
                placeholder="Describe exactly what you did wrong..."
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-600 font-medium min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">What was the consequence?</label>
              <textarea 
                required
                value={formData.consequence}
                onChange={(e) => setFormData({...formData, consequence: e.target.value})}
                placeholder="What happened as a result?"
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-600 font-medium min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-3">The Lesson learned</label>
              <textarea 
                required
                value={formData.lesson}
                onChange={(e) => setFormData({...formData, lesson: e.target.value})}
                placeholder="Advice to juniors to avoid this..."
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-gray-600 font-medium min-h-[100px]"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 rounded-[24px] transition-all shadow-xl shadow-orange-100 active:scale-95 disabled:opacity-70"
            >
              {loading ? 'Submitting...' : 'Share Experience'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitMistakePage;
