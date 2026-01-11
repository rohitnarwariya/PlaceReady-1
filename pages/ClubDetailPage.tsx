
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  db, auth, doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy 
} from '../firebase';
import { Club, ClubRepresentative, ClubPost, ChatRequestReason } from '../types';

const ClubDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [representatives, setRepresentatives] = useState<ClubRepresentative[]>([]);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Modal State for Chat Request
  const [selectedRep, setSelectedRep] = useState<ClubRepresentative | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState<ChatRequestReason>('Placement');
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClubDetails = async () => {
      if (!id) return;
      try {
        // Fetch Club
        const clubDoc = await getDoc(doc(db, 'clubs', id));
        if (clubDoc.exists()) {
          setClub({ id: clubDoc.id, ...clubDoc.data() } as Club);
        } else {
          navigate('/clubs');
          return;
        }

        // Fetch Representatives
        const repsQuery = query(collection(db, 'club_representatives'), where('clubId', '==', id));
        const repsSnapshot = await getDocs(repsQuery);
        setRepresentatives(repsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClubRepresentative[]);

        // Fetch Posts
        const postsQuery = query(collection(db, 'club_posts'), where('clubId', '==', id), orderBy('createdAt', 'desc'));
        const postsSnapshot = await getDocs(postsQuery);
        setPosts(postsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'
          } as any;
        }));

        const profile = localStorage.getItem('user_profile');
        if (profile) setUserProfile(JSON.parse(profile));

      } catch (err) {
        console.error("Error fetching club details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [id, navigate]);

  const handleOpenChatRequest = (rep: ClubRepresentative) => {
    if (!auth.currentUser) return navigate('/login');
    setSelectedRep(rep);
    setIsModalOpen(true);
  };

  const handleRequestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedRep || !userProfile) return;

    setSubmitting(true);
    try {
      // Use unified schema properties: fromUserId, fromUserName, toUserId, toUserName, domain
      // This ensures requests are correctly captured by the ChatDashboard query.
      await addDoc(collection(db, 'chatRequests'), {
        fromUserId: auth.currentUser.uid,
        fromUserName: userProfile.name,
        toUserId: selectedRep.userId,
        toUserName: selectedRep.name,
        domain: selectedRep.branch || 'General',
        reason: requestReason,
        message: requestMessage,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      alert("Guidance request sent to " + selectedRep.name);
      setIsModalOpen(false);
      setRequestMessage('');
    } catch (err) {
      console.error("Chat Request Error:", err);
      alert("Failed to send request. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!club) return null;

  return (
    <div className="fade-in bg-[#f3f7fb] min-h-screen pb-32">
      {/* Dynamic Header */}
      <div className="h-[450px] bg-slate-900 relative overflow-hidden">
        {club.bannerUrl ? (
          <img src={club.bannerUrl} alt={club.name} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f3f7fb] via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative h-full flex flex-col justify-end pb-12">
          <button 
            onClick={() => navigate('/clubs')}
            className="absolute top-10 left-8 z-20 flex items-center gap-2 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10"
          >
            ← Back to Clubs
          </button>

          <div className="flex flex-col md:flex-row items-end gap-10">
            <div className="w-40 h-40 bg-white rounded-[40px] shadow-2xl p-6 border border-slate-100 flex items-center justify-center flex-shrink-0">
              {club.logoUrl ? (
                <img src={club.logoUrl} alt={club.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-5xl font-black text-slate-300">{club.name.charAt(0)}</span>
              )}
            </div>
            <div className="mb-4">
              <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                {club.domain} Organization
              </span>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 mt-6 tracking-tighter leading-none">
                {club.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          {/* About Section */}
          <section>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              Organization Charter
            </h2>
            <div className="bg-white rounded-[48px] p-12 shadow-sm border border-slate-100 leading-relaxed text-slate-600 text-lg">
              <p className="mb-8 font-medium">
                {club.fullDesc}
              </p>
              {club.recruitmentInfo && (
                <div className="mt-12 pt-12 border-t border-slate-50">
                  <h3 className="text-slate-900 font-black mb-4">Recruitment & Induction</h3>
                  <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-50 text-slate-700 italic">
                    {club.recruitmentInfo}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Posts Section */}
          <section>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
              Official Communications
            </h2>
            <div className="space-y-8">
              {posts.map(post => (
                <div key={post.id} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      post.category === 'Recruitment' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      post.category === 'Preparation' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {post.category}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{post.createdAt as any}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{post.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {post.content}
                  </p>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="py-20 text-center bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-100">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No updates logged yet</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Representatives */}
        <div className="lg:col-span-1 space-y-12">
          <section>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center">
              <span className="w-2 h-2 bg-slate-900 rounded-full mr-3"></span>
              Senior Representatives
            </h2>
            <div className="space-y-6">
              {representatives.map(rep => (
                <div key={rep.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <Link to={`/seniors/profile/${rep.userId}`} className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-300 border border-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden">
                      {rep.name.charAt(0)}
                    </Link>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight">{rep.name}</h4>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{rep.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-y border-slate-50 mb-8">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Branch</p>
                      <p className="text-sm font-black text-slate-700">{rep.branch}</p>
                    </div>
                    <div className="w-px h-6 bg-slate-100"></div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Year</p>
                      <p className="text-sm font-black text-slate-700">{rep.year}th Year</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      to={`/seniors/profile/${rep.userId}`}
                      className="bg-slate-50 text-slate-400 text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      View Profile
                    </Link>
                    <button 
                      onClick={() => handleOpenChatRequest(rep)}
                      className="bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 active:scale-95"
                    >
                      Consult Rep
                    </button>
                  </div>
                </div>
              ))}
              {representatives.length === 0 && (
                <p className="text-center py-10 text-slate-300 italic text-sm">No representatives listed.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Chat Request Modal (Reused) */}
      {isModalOpen && selectedRep && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[56px] p-12 md:p-16 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Club Guidance</h2>
            <p className="text-slate-400 font-medium mb-12">Ask {selectedRep.name} about {club.name} or general preparation.</p>
            
            <form onSubmit={handleRequestChat} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Topic</label>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Your Question</label>
                <textarea 
                  required
                  maxLength={300}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl p-8 font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all min-h-[160px] resize-none text-lg"
                  placeholder="Ask specifically about recruitment, domains, or learning paths..."
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
                  {submitting ? 'Transmitting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetailPage;
