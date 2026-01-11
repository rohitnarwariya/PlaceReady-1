
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  auth, 
  onAuthStateChanged, 
  db, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc
} from '../firebase';
import { Question, Answer } from '../types';

const CATEGORY_MAP = {
  'Tech': ['DSA', 'Web Development', 'App Development', 'Core Subjects', 'Internships', 'System Design'],
  'Non-Tech': ['Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'ECE', 'Placement Process', 'CGPA / Academics', 'HR / Behavioral']
};

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'def_q1',
    title: 'How deep do Google interviews go into DP?',
    description: 'I am comfortable with basic Knapsack and LCS. Should I focus more on Bitmask DP and Digit DP for intern roles?',
    category: 'Tech',
    subCategory: 'DSA',
    section: 'DSA',
    authorId: 'u1',
    authorName: 'Sunil V.',
    authorRole: 'Junior',
    askedByYear: 1,
    timestamp: '2 hours ago',
    isResolved: true
  },
  {
    id: 'def_q2',
    title: 'Strategies for the "Why this company?" question in HR rounds?',
    description: 'I have an interview with Morgan Stanley next week. How do I answer this without sounding like I just read their Wikipedia page?',
    category: 'Non-Tech',
    subCategory: 'HR / Behavioral',
    section: 'HR / Behavioral',
    authorId: 'u2',
    authorName: 'Ananya K.',
    authorRole: 'Junior',
    askedByYear: 3,
    timestamp: '5 hours ago',
    isResolved: true
  },
  {
    id: 'def_q3',
    title: 'Preparation required for NVIDIA System Software roles?',
    description: 'I have a strong grasp of C and OS. Do I need to know specific driver architecture or just kernel fundamentals?',
    category: 'Tech',
    subCategory: 'Core Subjects',
    section: 'Core Subjects',
    authorId: 'u3',
    authorName: 'Rohan D.',
    authorRole: 'Junior',
    askedByYear: 4,
    timestamp: '1 day ago',
    isResolved: true
  }
];

const DEFAULT_ANSWERS: Answer[] = [
  {
    id: 'def_a1',
    questionId: 'def_q1',
    text: 'For intern roles, standard DP is enough. Google focuses more on your ability to optimize recursion and identifying the state. Digit DP is rarely asked for interns unless you are targeting very high-end roles.',
    authorId: 's1',
    authorName: 'Ishita Roy',
    authorRole: 'Senior Mentor',
    authorYear: 4,
    authorSection: 'DSA',
    timestamp: '1 hour ago',
    isVerified: true
  },
  {
    id: 'def_a2',
    questionId: 'def_q2',
    text: 'Go to their "Technology" or "Engineering" blog. Mention a specific initiative like their use of "Matrix" for trading systems or their open-source contributions. It shows you actually care about their engineering culture, not just the brand.',
    authorId: 's2',
    authorName: 'Rahul Sharma',
    authorRole: 'Senior Mentor',
    authorYear: 4,
    authorSection: 'HR / Behavioral',
    timestamp: '3 hours ago',
    isVerified: true
  },
  {
    id: 'def_a3',
    questionId: 'def_q3',
    text: 'Focus heavily on Interrupt Handling, Virtual Memory, and Concurrency (Mutex vs Semaphores). NVIDIA grills you on how the OS interacts with hardware registers. Knowledge of Linux Kernel modules is a huge plus.',
    authorId: 's3',
    authorName: 'Siddharth M.',
    authorRole: 'Senior Mentor',
    authorYear: 4,
    authorSection: 'Core Subjects',
    timestamp: '20 hours ago',
    isVerified: true
  }
];

const QAPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [answers, setAnswers] = useState<Answer[]>(DEFAULT_ANSWERS);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  // Selection State
  const [mainCategory, setMainCategory] = useState<'Tech' | 'Non-Tech' | ''>('');
  const [subCategory, setSubCategory] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});

  // Safe Date Formatting
  const formatDateSafely = (dateValue: any) => {
    try {
      if (!dateValue) return 'Just now';
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
      if (isNaN(date.getTime())) return 'Just now';
      return date.toLocaleString();
    } catch (e) {
      return 'Just now';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Real-time Questions Listener
    const qQuery = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const unsubscribeQs = onSnapshot(qQuery, (snapshot) => {
      const qs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: formatDateSafely(data.createdAt)
        } as Question;
      });
      setQuestions([...qs, ...DEFAULT_QUESTIONS.filter(dq => !qs.some(q => q.title === dq.title))]);
    }, (error) => {
      console.error("Error fetching questions:", error);
    });

    // Real-time Answers Listener
    const aQuery = query(collection(db, 'answers'), orderBy('createdAt', 'asc'));
    const unsubscribeAs = onSnapshot(aQuery, (snapshot) => {
      const as = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: formatDateSafely(data.createdAt)
        } as Answer;
      });
      setAnswers([...as, ...DEFAULT_ANSWERS.filter(da => !as.some(a => a.text === da.text))]);
    }, (error) => {
      console.error("Error fetching answers:", error);
    });

    return () => {
      unsubscribeQs();
      unsubscribeAs();
    };
  }, []);

  useEffect(() => {
    const targetId = location.state?.questionId;
    if (targetId && questions.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`question-${targetId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedId(targetId);
          setTimeout(() => setHighlightedId(null), 3000);
          window.history.replaceState({}, document.title);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state, questions]);

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !mainCategory || !subCategory || !userProfile) return;

    try {
      await addDoc(collection(db, 'questions'), {
        title: newTitle,
        description: newDesc,
        category: mainCategory,
        subCategory: subCategory,
        section: subCategory, 
        authorId: userProfile.uid || userProfile.id,
        authorName: userProfile.name,
        authorRole: 'Junior',
        askedByYear: userProfile.year || 1,
        isResolved: false,
        createdAt: serverTimestamp()
      });

      setNewTitle('');
      setNewDesc('');
      setMainCategory('');
      setSubCategory('');
    } catch (err) {
      console.error("Failed to post question:", err);
      alert("Failed to post question. Please try again.");
    }
  };

  const handleAnswer = async (qId: string) => {
    const text = answerText[qId];
    if (!text?.trim() || !userProfile) return;

    // Check if the current senior has already answered this question
    const qAnswers = answers.filter(a => a.questionId === qId);
    const hasAlreadyAnswered = qAnswers.some(ans => ans.authorId === (userProfile.uid || userProfile.id));
    
    if (hasAlreadyAnswered) {
      alert("You already answered this question.");
      setActiveReplyId(null);
      return;
    }

    try {
      // 1. Post the answer
      await addDoc(collection(db, 'answers'), {
        questionId: qId,
        text: text,
        authorId: userProfile.uid || userProfile.id,
        authorName: userProfile.name,
        authorRole: 'Senior Mentor',
        authorYear: userProfile.year,
        authorSection: userProfile.section,
        isVerified: true,
        createdAt: serverTimestamp()
      });

      // 2. Trigger notification for question author
      const targetQuestion = questions.find(q => q.id === qId);
      if (targetQuestion && targetQuestion.authorId !== (userProfile.uid || userProfile.id)) {
        await addDoc(collection(db, 'notifications'), {
          userId: targetQuestion.authorId,
          type: 'answer',
          questionId: qId,
          questionTitle: targetQuestion.title,
          seniorName: userProfile.name,
          domain: userProfile.section,
          seen: false,
          createdAt: serverTimestamp()
        });
      }

      // 3. Update question status to resolved
      if (!qId.startsWith('def_')) {
        await updateDoc(doc(db, 'questions', qId), {
          isResolved: true
        });
      }

      setAnswerText(prev => ({ ...prev, [qId]: '' }));
      setActiveReplyId(null);
    } catch (err) {
      console.error("Failed to post answer:", err);
      alert("Failed to post answer. Please try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-[#f3f7fb] min-h-screen pb-24">
      <div className="bg-white border-b border-slate-200 py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Guideline Inquiries</h1>
          <p className="text-slate-500 font-medium mb-12 italic">Direct academic consultation for campus recruitment.</p>
          
          <div className="bg-slate-50 rounded-[32px] border border-slate-200 p-10">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Consult an Expert Senior
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => { setMainCategory('Tech'); setSubCategory(''); }}
                className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${mainCategory === 'Tech' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-100'}`}
              >
                Technical / IT
              </button>
              <button 
                onClick={() => { setMainCategory('Non-Tech'); setSubCategory(''); }}
                className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${mainCategory === 'Non-Tech' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-amber-100'}`}
              >
                Non-Tech / Core
              </button>
            </div>

            {mainCategory && (
              <div className="fade-in space-y-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  {CATEGORY_MAP[mainCategory].map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setSubCategory(sub)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${subCategory === sub ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    maxLength={100}
                    placeholder="Brief headline of your doubt..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-100 font-bold text-slate-700"
                  />
                  <textarea 
                    placeholder="Describe specific details, context or current roadblock (optional)"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-100 font-medium text-slate-600 h-24 resize-none"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handlePostQuestion}
                      disabled={!subCategory || !newTitle.trim()}
                      className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl disabled:opacity-30 active:scale-95"
                    >
                      Submit for Consultation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="space-y-10">
          {questions.map(q => {
            const qAnswers = answers.filter(a => a.questionId === q.id);
            const isSenior = userProfile?.role === 'senior';
            const isHighlighted = highlightedId === q.id;
            
            // Check if this senior has already contributed an answer
            const hasAlreadyAnswered = qAnswers.some(ans => ans.authorId === (userProfile?.uid || userProfile?.id));

            return (
              <div 
                key={q.id} 
                id={`question-${q.id}`}
                className={`bg-white rounded-[40px] border p-10 shadow-sm transition-all duration-1000 ${
                  isHighlighted ? 'border-blue-500 ring-4 ring-blue-500/10 bg-blue-50/20 scale-[1.01]' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-200 uppercase">
                      {q.authorName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-none mb-1">{q.authorName}</h4>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{q.authorRole} • {q.timestamp}</p>
                    </div>
                  </div>
                  <div className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    {q.subCategory}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-800 leading-tight tracking-tight mb-4">
                  {q.title}
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  {q.description}
                </p>

                {/* Answers List */}
                {qAnswers.length > 0 && (
                  <div className="mt-8 space-y-6 pt-8 border-t border-slate-50">
                    {qAnswers.map(ans => (
                      <div key={ans.id} className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 flex items-start gap-6">
                        <Link to={`/seniors/profile/${ans.authorId}`} className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 hover:bg-emerald-600 transition-colors shadow-sm">
                          {ans.authorName?.charAt(0) || '?'}
                        </Link>
                        <div className="flex-grow">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                             Senior Mentor – 
                             <Link to={`/seniors/profile/${ans.authorId}`} className="hover:underline hover:text-emerald-700 mx-1">
                               {ans.authorName || 'Anonymous Senior'}
                             </Link>
                             <span className="text-slate-300 mx-1">—</span>
                             <span className="text-slate-400 font-bold uppercase">{ans.authorSection} — Year {ans.authorYear}</span>
                          </p>
                          <p className="text-slate-600 font-medium text-sm leading-relaxed mb-2">
                            {ans.text}
                          </p>
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{ans.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form (For Seniors) - Allow many seniors to answer, but each only once */}
                {isSenior && !hasAlreadyAnswered && (
                  <div className="mt-8 pt-8 border-t border-slate-50">
                    {activeReplyId === q.id ? (
                      <div className="space-y-4">
                        <textarea 
                          placeholder="Provide verified guidance..."
                          value={answerText[q.id] || ''}
                          onChange={(e) => setAnswerText({ ...answerText, [q.id]: e.target.value })}
                          className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-100 font-medium text-slate-600 h-24 resize-none"
                        />
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => setActiveReplyId(null)}
                            className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleAnswer(q.id)}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
                          >
                            Post Answer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveReplyId(q.id)}
                        className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-all"
                      >
                        Provide Verification
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {isSenior && hasAlreadyAnswered && (
                  <div className="mt-6 pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center">
                      <svg className="w-3 h-3 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      Response Logged
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QAPage;
