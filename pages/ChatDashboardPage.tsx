
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  auth, 
  db, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  updateDoc, 
  doc, 
  addDoc, 
  serverTimestamp,
  or
} from '../firebase';
import { Chat, ChatRequest } from '../types';

const ChatDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  const [chats, setChats] = useState<Chat[]>([]);
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      navigate('/login');
      return;
    }

    const chatsQuery = query(
      collection(db, 'chats'),
      or(
        where('userAId', '==', uid),
        where('userBId', '==', uid)
      )
    );

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      chatList.sort((a, b) => {
        const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
        const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
        return timeB - timeA;
      });

      setChats(chatList);
      setLoading(false);
    }, (err) => {
      console.error("Chat Listener Error:", err);
      setLoading(false);
    });

    const requestsQuery = query(
      collection(db, 'chatRequests'),
      where('toUserId', '==', uid),
      where('status', '==', 'pending')
    );

    const unsubscribeReqs = onSnapshot(requestsQuery, (snapshot) => {
      const reqList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      reqList.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });

      setRequests(reqList);
    });

    return () => {
      unsubscribeChats();
      unsubscribeReqs();
    };
  }, [uid, navigate]);

  const unreadChatsCount = chats.filter(chat => {
    const data = chat as any;
    return data.seenBy ? !data.seenBy.includes(uid) : false;
  }).length;

  const formatTime = (val: any) => {
    if (!val) return '';
    try {
      const date = val.toDate ? val.toDate() : new Date(val);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected', requestData: any) => {
    try {
      await updateDoc(doc(db, 'chatRequests', requestId), {
        status: status
      });

      if (status === 'accepted') {
        await addDoc(collection(db, 'chats'), {
          userAId: requestData.fromUserId,
          userBId: requestData.toUserId,
          userAName: requestData.fromUserName,
          userBName: userProfile.name,
          domain: requestData.domain || 'General',
          lastMessage: "Consultation started. How can I help?",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          seenBy: [uid]
        });
      }
    } catch (err) {
      console.error("Request Action Error:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-t-2 border-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-73px)] bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-[450px] bg-white border-r border-slate-200 flex flex-col h-full relative z-20 shadow-xl shadow-slate-900/5">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Intel Inbox</h1>
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="bg-slate-100 p-1.5 rounded-[22px] flex items-center mb-6 border border-slate-200/50">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'chats' ? 'bg-white shadow-xl shadow-slate-300 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Dialogs
              {unreadChatsCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-[9px] font-black rounded-lg flex items-center justify-center animate-pulse shadow-lg shadow-blue-200">
                  {unreadChatsCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-white shadow-xl shadow-slate-300 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Requests
              {requests.length > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 bg-rose-600 text-white text-[9px] font-black rounded-lg flex items-center justify-center animate-pulse shadow-lg shadow-rose-200">
                  {requests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto px-5 pb-8 space-y-3 custom-scrollbar">
          {activeTab === 'chats' ? (
            chats.map(chat => {
              const chatData = chat as any;
              const isUserA = chat.userAId === uid;
              const otherName = isUserA ? (chat.userBName || "Senior") : (chat.userAName || "Junior");
              const isUnread = chatData.seenBy ? !chatData.seenBy.includes(uid) : false;
              
              return (
                <div 
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className={`p-5 flex items-center gap-5 cursor-pointer bg-white border rounded-[32px] transition-all group active:scale-[0.98] relative overflow-hidden ${
                    isUnread ? 'border-blue-600 bg-blue-50/30 shadow-lg shadow-blue-500/5' : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  {/* Vertical Alert Bar for Unread */}
                  {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-r-full"></div>}
                  
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 transition-all shadow-lg ${
                    isUnread ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white group-hover:bg-blue-600'
                  }`}>
                    {otherName.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-[17px] font-black truncate tracking-tight transition-colors ${
                        isUnread ? 'text-slate-900' : 'text-slate-700'
                      }`}>
                        {otherName}
                      </h3>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        isUnread ? 'text-blue-600' : 'text-slate-300'
                      }`}>
                        {formatTime(chat.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-[13px] truncate leading-tight transition-colors ${
                        isUnread ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'
                      }`}>
                        {chat.lastMessage || 'Establishing frequency...'}
                      </p>
                      {isUnread && (
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 shadow-sm animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-4 pt-2">
              {requests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                  </div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-slate-200">
                      {req.fromUserName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">{req.fromUserName}</h3>
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">{req.reason || 'Intelligence'}</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-6 font-medium italic border-l-2 border-slate-100 pl-4">
                    "{req.message}"
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRequestAction(req.id, 'accepted', req)}
                      className="flex-1 bg-slate-900 text-white font-black py-4 rounded-[20px] text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-lg"
                    >
                      Authorize
                    </button>
                    <button 
                      onClick={() => handleRequestAction(req.id, 'rejected', req)}
                      className="flex-1 bg-slate-50 text-slate-400 font-black py-4 rounded-[20px] text-[10px] uppercase tracking-[0.2em] hover:text-rose-500 transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {((activeTab === 'chats' && chats.length === 0) || (activeTab === 'requests' && requests.length === 0)) && (
            <div className="py-24 text-center px-10">
              <div className="w-24 h-24 bg-slate-50 rounded-[48px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <span className="text-4xl grayscale opacity-30">📡</span>
              </div>
              <h3 className="text-slate-900 font-black text-lg mb-2">Passive Scan Active</h3>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-relaxed">
                Listening for incoming transmissions on encrypted channels.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail View / Placeholder */}
      <div className="hidden md:flex flex-grow bg-[#F3F7FB] items-center justify-center p-20 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(0deg, #000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="text-center max-w-sm relative z-10">
          <div className="w-28 h-28 bg-white rounded-[56px] flex items-center justify-center mx-auto mb-10 shadow-[0_30px_60px_rgba(15,23,42,0.1)] border border-white">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
            </svg>
          </div>
          <h2 className="text-[28px] font-black text-slate-900 mb-4 tracking-tighter leading-tight">Strategic Intel Network</h2>
          <p className="text-slate-400 font-bold leading-relaxed mb-10">
            Select an active dialogue to access localized campus knowledge and placement insights.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/40">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Encrypted Channel Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDashboardPage;
