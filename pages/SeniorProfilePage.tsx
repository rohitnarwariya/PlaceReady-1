
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp
} from '../firebase';
import { User, ChatRequestReason, Answer } from '../types';

const SeniorProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [senior, setSenior] = useState<any>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Chat Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState<ChatRequestReason>('Internship');
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSeniorProfile = async (targetId: string | undefined) => {
      setLoading(true);
      if (!targetId) {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) await loadProfile(user.uid);
          else { setError('Sign in to view profile.'); setLoading(false); }
        });
        return () => unsubscribe();
      } else await loadProfile(targetId);
    };

    const loadProfile = async (targetId: string) => {
      try {
        const docRef = doc(db, 'users', targetId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSenior(data);
          
          // Fetch answers by this senior
          const q = query(
            collection(db, 'answers'), 
            where('authorId', '==', targetId)
          );
          
          const querySnapshot = await getDocs(q);
          const seniorAnswers = querySnapshot.docs.map(doc => {
            const aData = doc.data();
            return {
              ...aData,
              id: doc.id,
              timestamp: aData.createdAt ? new Date(aData.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'
            } as any;
          });

          // Sort client-side to avoid index requirement
          seniorAnswers.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
            const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
            return timeB - timeA;
          });
          
          setAnswers(seniorAnswers as Answer[]);
        } else {
          setError('Profile not found.');
        }
      } catch (err) {
        console.error("Error loading senior profile:", err);
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSeniorProfile(id);
  }, [id, navigate]);

  const handleRequestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('user_profile') || '{}');
    if (!auth.currentUser) return navigate('/login');

    setSubmitting(true);
    try {
      // Logic updated to match specified collections structure
      await addDoc(collection(db, 'chatRequests'), {
        fromUserId: auth.currentUser.uid,
        fromUserName: currentUser.name,
        toUserId: senior.uid,
        toUserName: senior.name,
        domain: senior.section || 'General',
        reason: requestReason,
        message: requestMessage,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      alert("Intel request sent successfully!");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Firestore Request Error:", err);
      alert("Consultation system error. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return <div className="p-20 text-center font-black text-rose-500 tracking-tight text-2xl">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f3f7fb] pb-32 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Premium UI Cover Section */}
      <div className="h-96 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-slate-900 to-indigo-900"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#f3f7fb] to-transparent"></div>
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-10 left-10 z-20 flex items-center gap-2 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-8 -mt-48 relative z-10">
        <div className="bg-white rounded-[64px] shadow-[0_40px_100px_rgba(15,23,42,0.1)] overflow-hidden border border-slate-100">
          <div className="p-12 md:p-20">
            {/* Header Content */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-48 h-48 bg-white rounded-[56px] p-2 shadow-2xl mb-10 relative">
                <div className="w-full h-full bg-slate-100 rounded-[48px] flex items-center justify-center text-6xl font-black text-slate-300 overflow-hidden border border-slate-50">
                  {senior.profilePic ? (
                    <img src={senior.profilePic} className="w-full h-full object-cover" />
                  ) : (
                    senior.name?.charAt(0)
                  )}
                </div>
                {senior.isVerified !== false && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl border-4 border-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  </div>
                )}
              </div>

              <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-none">{senior.name}</h1>
              
              <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                <span className="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {senior.college || 'Elite Campus'}
                </span>
                <span className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  {senior.branch || 'CSE'} Specialist
                </span>
                <span className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  Batch {senior.year || '4'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                {auth.currentUser?.uid !== id && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 bg-slate-900 text-white font-black py-5 rounded-[24px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 uppercase text-xs tracking-[0.2em] active:scale-95"
                  >
                    Consultation Request
                  </button>
                )}
                {senior.linkedinUrl && (
                  <a 
                    href={senior.linkedinUrl}
                    target="_blank"
                    className="flex-1 bg-white text-slate-900 border-2 border-slate-100 font-black py-5 rounded-[24px] hover:border-blue-600 hover:text-blue-600 transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {/* Left Column: Stats & Bio */}
              <div className="lg:col-span-1 space-y-12">
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                    Mentor Brief
                  </h3>
                  <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 relative">
                    <div className="absolute top-6 left-6 text-slate-200 text-4xl font-serif">“</div>
                    <p className="text-slate-600 font-bold leading-relaxed italic relative z-10 text-lg">
                      {senior.bio || 'Providing structured technical guidance and verified placement strategies for the next generation of campus talent.'}
                    </p>
                  </div>
                </section>

                <section>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3"></span>
                    Stats
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Verified Contributions</span>
                      <span className="text-2xl font-black text-slate-900">{answers.length}</span>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Reputation Score</span>
                      <span className="text-2xl font-black text-blue-600">{(answers.length * 12 + 100)}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Answers Feed */}
              <div className="lg:col-span-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                  Verified Knowledge Record
                </h3>

                <div className="space-y-8 relative">
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100"></div>
                  
                  {answers.map((ans, idx) => (
                    <div key={ans.id} className="relative pl-16 group">
                      <div className="absolute left-[21px] top-4 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-600 transition-colors border-4 border-white ring-4 ring-slate-50"></div>
                      <div className="bg-white p-10 rounded-[40px] border border-slate-100 hover:border-blue-100 hover:shadow-[0_20px_50px_rgba(15,23,42,0.05)] transition-all">
                        <p className="text-slate-800 font-black text-xl leading-relaxed mb-6">
                          {ans.text}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{ans.timestamp}</span>
                          </div>
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                             Intel Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {answers.length === 0 && (
                    <div className="py-24 text-center bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-100">
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No public records yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[56px] p-12 md:p-16 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Consultation Goal</h2>
            <p className="text-slate-400 font-medium mb-12">Draft your specific requirement for {senior.name}.</p>
            
            <form onSubmit={handleRequestChat} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Topic of Discussion</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Internship', 'Skills', 'CGPA', 'Placement'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRequestReason(r as ChatRequestReason)}
                      className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${requestReason === r ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-transparent text-slate-400 hover:border-blue-200'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Detailed Query</label>
                <textarea 
                  required
                  maxLength={300}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl p-8 font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all min-h-[160px] resize-none text-lg"
                  placeholder="Explain exactly what you need guidance on..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-[24px] uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white font-black py-5 rounded-[24px] uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                >
                  {submitting ? 'Transmitting...' : 'Send Intel Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeniorProfilePage;
