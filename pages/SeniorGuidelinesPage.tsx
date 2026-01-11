
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_GUIDELINES } from '../constants';
import { Guideline } from '../types';

const SeniorGuidelinesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'All' | 'DSA' | 'HR' | 'DBMS'>('All');
  const [guidelines, setGuidelines] = useState<Guideline[]>(MOCK_GUIDELINES);

  useEffect(() => {
    // Sync likes from local storage on mount
    const savedLikes = localStorage.getItem('guidelineLikes');
    if (savedLikes) {
      const parsedLikes = JSON.parse(savedLikes);
      setGuidelines(prev => prev.map(g => ({
        ...g,
        likes: parsedLikes[g.id] || g.likes
      })));
    }
  }, []);

  const filteredGuidelines = activeTab === 'All' 
    ? guidelines 
    : guidelines.filter(g => g.category === activeTab);

  const handleLike = (id: string) => {
    const updated = guidelines.map(g => 
      g.id === id ? { ...g, likes: g.likes + 1 } : g
    );
    setGuidelines(updated);
    
    // Save to local storage
    const likesMap: Record<string, number> = {};
    updated.forEach(g => likesMap[g.id] = g.likes);
    localStorage.setItem('guidelineLikes', JSON.stringify(likesMap));
  };

  return (
    <div className="fade-in bg-gray-50 min-h-screen">
      <header className="bg-white py-16 border-b relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-[#5540af] font-bold transition-colors group text-sm mb-6"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Senior Guidelines</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Verified answers and advice from the campus community to help you navigate placement season effectively.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/50 -skew-x-12 transform translate-x-20"></div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Tabs */}
        <div className="flex space-x-2 mb-10 overflow-x-auto pb-2">
          {['All', 'DSA', 'HR', 'DBMS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-full font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 border'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuidelines.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col"
            >
              <span className={`self-start px-4 py-1 rounded-full text-xs font-bold uppercase mb-4 ${
                item.category === 'DSA' ? 'bg-blue-100 text-blue-600' :
                item.category === 'HR' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {item.category}
              </span>
              <h3 className="text-xl font-bold text-gray-800 mb-4 leading-tight">
                {item.question}
              </h3>
              <p className="text-gray-600 mb-8 italic flex-grow">
                "{item.advice}"
              </p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                <div>
                  {item.authorId ? (
                    <Link 
                      to={`/seniors/profile/${item.authorId}`}
                      className="text-sm font-black text-blue-600 hover:underline flex items-center"
                    >
                      {item.author}
                      <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      </svg>
                    </Link>
                  ) : (
                    <p className="text-sm font-bold text-gray-800">{item.author}</p>
                  )}
                  <p className="text-xs text-gray-400">{item.authorRole}</p>
                </div>
                <button 
                  onClick={() => handleLike(item.id)}
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 px-4 py-2 rounded-xl transition-all font-medium"
                >
                  <span>Agree 👍</span>
                  <span className="font-bold">{item.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* ... rest of component same */}
      </div>
    </div>
  );
};

export default SeniorGuidelinesPage;
