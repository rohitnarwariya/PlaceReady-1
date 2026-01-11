
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, db, onAuthStateChanged, signOut, doc, getDoc, collection, query, where, orderBy, onSnapshot, limit, updateDoc, serverTimestamp, Timestamp, or } from './firebase';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AdminLoginPage from './pages/AdminLoginPage';
import HomePage from './pages/HomePage';
import SeniorHubPage from './pages/SeniorHubPage';
import SeniorGuidelinesPage from './pages/SeniorGuidelinesPage';
import QAPage from './pages/QAPage';
import CompanyInsightsPage from './pages/CompanyInsightsPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import ReadinessPage from './pages/ReadinessPage';
import SeniorProfilePage from './pages/SeniorProfilePage';
import ProfilePage from './pages/ProfilePage';
import SeniorMistakesPage from './pages/SeniorMistakesPage';
import SubmitMistakePage from './pages/SubmitMistakePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SeniorLearningsPage from './pages/SeniorLearningsPage';
import SubmitLearningPage from './pages/SubmitLearningPage';
import ChatDashboardPage from './pages/ChatDashboardPage';
import ChatPage from './pages/ChatPage';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [totalBadgeCount, setTotalBadgeCount] = useState(0);
  const [lastSeenTime, setLastSeenTime] = useState<any>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const isAuthPage = ['/login', '/signup', '/admin-login'].includes(location.pathname);

  const formatTimeSafely = (dateValue: any) => {
    try {
      if (!dateValue) return 'Just now';
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
      if (isNaN(date.getTime())) return 'Just now';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Just now';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const cachedProfile = localStorage.getItem('user_profile');
        let profile;
        if (cachedProfile) {
          profile = JSON.parse(cachedProfile);
        } else {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            profile = docSnap.data();
          } else {
            profile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              role: 'junior',
              yearLabel: '1st Year'
            };
          }
        }
        setUser(profile);
        localStorage.setItem('user_profile', JSON.stringify(profile));
        
        if (profile.role === 'senior') {
          setLastSeenTime(profile.lastSeenNotificationsAt || null);
        }
      } else {
        setUser(null);
        setLastSeenTime(null);
        localStorage.removeItem('user_profile');
      }
    });

    const handleStorageChange = () => {
      const profileStr = localStorage.getItem('user_profile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        setUser(profile);
        if (profile.role === 'senior') {
          setLastSeenTime(profile.lastSeenNotificationsAt || null);
        }
      } else {
        setUser(null);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Universal Notification Listener
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setTotalBadgeCount(0);
      return;
    }

    const uid = user.uid || user.id;

    // Separate counts for stability
    let pendingReqsCount = 0;
    let unreadMessagesCount = 0;

    const updateBadgeTotal = () => {
      setTotalBadgeCount(pendingReqsCount + unreadMessagesCount);
    };

    // Chat Request Listener
    const chatReqQuery = query(
      collection(db, 'chatRequests'),
      where('toUserId', '==', uid),
      where('status', '==', 'pending')
    );

    const unsubscribeChatReqs = onSnapshot(chatReqQuery, (snapshot) => {
      pendingReqsCount = snapshot.size;
      updateBadgeTotal();
    });

    // Message/Chat Notification Listener
    const chatsQuery = query(
      collection(db, 'chats'),
      or(
        where('userAId', '==', uid),
        where('userBId', '==', uid)
      )
    );

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      unreadMessagesCount = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.seenBy ? !data.seenBy.includes(uid) : false;
      }).length;
      updateBadgeTotal();
    });

    // Question/Activity Notifications
    if (user.role === 'senior' && user.section) {
      const q = query(
        collection(db, 'questions'), 
        where('section', '==', user.section),
        limit(50)
      );

      const unsubscribeQs = onSnapshot(q, (snapshot) => {
        let filterDate: Date | null = null;
        if (lastSeenTime) {
          const parsed = lastSeenTime.toDate ? lastSeenTime.toDate() : new Date(lastSeenTime);
          if (!isNaN(parsed.getTime())) filterDate = parsed;
        }

        const notifs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(data => {
            const isUnresolved = data.isResolved === false;
            if (!filterDate) return isUnresolved;
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            return isUnresolved && createdAt > filterDate;
          })
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5)
          .map(data => ({
            id: data.id,
            title: data.title,
            domain: data.subCategory,
            time: formatTimeSafely(data.createdAt),
            type: 'question'
          }));

        setNotifications(notifs);
      });
      return () => {
        unsubscribeChatReqs();
        unsubscribeChats();
        unsubscribeQs();
      };
    } else if (user.role === 'junior') {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', uid),
        where('seen', '==', false),
        limit(20)
      );

      const unsubscribeNotifs = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            title: `Senior ${data.seniorName} answered your question in ${data.domain}`,
            domain: data.domain,
            time: formatTimeSafely(data.createdAt),
            questionId: data.questionId,
            type: 'reply'
          };
        })
        .sort((a: any, b: any) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 10);
        
        setNotifications(notifs);
      });
      return () => {
        unsubscribeChatReqs();
        unsubscribeChats();
        unsubscribeNotifs();
      };
    } else {
      return () => {
        unsubscribeChatReqs();
        unsubscribeChats();
      };
    }
  }, [user, lastSeenTime]);

  const handleJuniorNotifClick = async (notif: any) => {
    try {
      await updateDoc(doc(db, 'notifications', notif.id), {
        seen: true
      });
      setIsNotifOpen(false);
      navigate('/seniors/qa', { state: { questionId: notif.questionId } });
    } catch (err) {
      console.error("Error marking notif as seen:", err);
    }
  };

  const toggleNotif = async () => {
    const nextState = !isNotifOpen;
    setIsNotifOpen(nextState);

    if (nextState && user?.role === 'senior') {
      try {
        const now = new Date();
        await updateDoc(doc(db, 'users', user.uid || user.id), {
          lastSeenNotificationsAt: now
        });
        const updatedUser = { ...user, lastSeenNotificationsAt: now.toISOString() };
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
      } catch (err) {
        console.error("Error updating lastSeenTime:", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user_profile');
      setUser(null);
      setLastSeenTime(null);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isAuthPage) return null;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Eligibility', path: '/readiness' },
    { name: 'Companies', path: '/companies' },
    { name: 'Senior Hub', path: '/seniors' },
    { name: 'Messages', path: '/chats', hasBadge: totalBadgeCount > 0, badgeCount: totalBadgeCount },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 px-10 py-6 flex items-center justify-between">
      <Link to="/" className="text-3xl font-black text-black tracking-tighter flex items-center group transition-transform active:scale-95">
        <span className="text-blue-600 mr-2 transition-transform group-hover:scale-125 group-hover:rotate-12 inline-block">•</span> 
        PlaceReady
      </Link>
      
      <div className="hidden md:flex items-center space-x-10">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.path}
              to={link.path} 
              className={`relative group text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 py-1 flex items-center gap-2 ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              {link.name}
              {link.hasBadge && (
                <span className="flex-shrink-0 min-w-[22px] h-[22px] px-1.5 bg-rose-600 text-white text-[10px] font-black rounded-lg flex items-center justify-center animate-in zoom-in duration-300 shadow-lg shadow-rose-200 border-2 border-white">
                  {link.badgeCount}
                </span>
              )}
              <span className={`absolute bottom-0 left-0 h-[2.5px] bg-blue-600 transition-transform duration-300 origin-left ${
                isActive ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center space-x-6">
        {user ? (
          <div className="flex items-center space-x-6">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={toggleNotif}
                className={`p-2.5 rounded-xl transition-all duration-300 hover:bg-slate-100 active:scale-90 relative ${isNotifOpen ? 'text-blue-600' : 'text-slate-400'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {user.role === 'senior' ? `Intel: ${user.section}` : 'Activity Monitor'}
                    </span>
                    {notifications.length > 0 && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            if (notif.type === 'reply') {
                              handleJuniorNotifClick(notif);
                            } else {
                              navigate('/seniors/qa', { state: { questionId: notif.id } });
                              setIsNotifOpen(false);
                            }
                          }}
                          className="p-5 hover:bg-blue-50/50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group"
                        >
                          <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed">
                            {notif.type === 'reply' ? notif.title : `Consultation Required: ${notif.title}`}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-md">{notif.domain}</span>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{notif.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No active alerts</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-8">
              <Link to="/profile" className="text-right hidden sm:block hover:opacity-70 transition-all active:scale-95 group relative">
                <p className="text-[13px] font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{user.name}</p>
                <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mt-1.5 transition-all group-hover:shadow-md ${
                  user.role === 'junior' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {user.yearLabel}
                </span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="relative group text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600 transition-all hover:-translate-y-0.5 active:scale-95 py-1"
              >
                Logout
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-rose-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/signup" className="relative group text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-all hover:-translate-y-0.5 active:scale-95 py-1">
              Sign Up
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
            <Link to="/login" className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] px-8 py-4 rounded-2xl hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-200">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/readiness" element={<ReadinessPage />} />
            <Route path="/companies" element={<CompanyInsightsPage />} />
            <Route path="/companies/:id" element={<CompanyDetailPage />} />
            <Route path="/seniors" element={<SeniorHubPage />} />
            <Route path="/seniors/learnings" element={<SeniorLearningsPage />} />
            <Route path="/seniors/learnings/submit" element={<SubmitLearningPage />} />
            <Route path="/seniors/qa" element={<QAPage />} />
            <Route path="/seniors/mistakes" element={<SeniorMistakesPage />} />
            <Route path="/seniors/mistakes/submit" element={<SubmitMistakePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/seniors/profile/:id" element={<SeniorProfilePage />} />
            <Route path="/seniors/guidelines" element={<SeniorGuidelinesPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="/chats" element={<ChatDashboardPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
