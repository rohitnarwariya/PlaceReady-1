
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
  
  const user = JSON.parse(localStorage.getItem('user_profile') || '{}');
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
          userBName: user.name,
          domain: requestData.domain || 'General',
          lastMessage: "Consultation started. How can I help?",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          seenBy: [uid] // Mark as read for the accepter immediately
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-[420px] bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-73px)] sticky top-[73px]">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Intel Inbox</h1>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center mb-6">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'chats' ? 'bg-white shadow-xl shadow-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Dialogs
              {unreadChatsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md animate-pulse">
                  {unreadChatsCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'requests' ? 'bg-white shadow-xl shadow-slate-200 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Intel Requests
              {requests.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md animate-pulse">
                  {requests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto px-4 pb-8 space-y-2">
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
                  className={`p-5 flex items-center gap-5 cursor-pointer bg-white border rounded-3xl transition-all group active:scale-[0.98] ${
                    isUnread ? 'border-blue-600 bg-blue-50/20 shadow-lg shadow-blue-500/5' : 'border-transparent hover:border-blue-100 hover:bg-blue-50/30'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 transition-all shadow-lg ${
                    isUnread ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-900 text-white group-hover:bg-blue-600 shadow-slate-200'
                  }`}>
                    {otherName.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-lg font-black truncate tracking-tight transition-colors ${
                        isUnread ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'
                      }`}>
                        {otherName}
                      </h3>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        isUnread ? 'text-blue-600' : 'text-slate-300'
                      }`}>
                        {formatTime(chat.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate leading-tight transition-colors ${
                        isUnread ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'
                      }`}>
                        {chat.lastMessage || 'Open dialogue...'}
                      </p>
                      {isUnread && (
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-4 pt-4">
              {requests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl">
                      {req.fromUserName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{req.fromUserName}</h3>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{req.reason || 'Intel'}</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-6 font-medium italic">"{req.message}"</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRequestAction(req.id, 'accepted', req)}
                      className="flex-1 bg-slate-900 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                    >
                      Authorize
                    </button>
                    <button 
                      onClick={() => handleRequestAction(req.id, 'rejected', req)}
                      className="flex-1 bg-slate-50 text-slate-400 font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:text-rose-500 transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {((activeTab === 'chats' && chats.length === 0) || (activeTab === 'requests' && requests.length === 0)) && (
            <div className="py-20 text-center px-10">
              <div className="w-20 h-20 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl opacity-30 grayscale">📡</span>
              </div>
              <p className="text-slate-400 text-sm font-bold tracking-tight">Listening for active transmissions...</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail View / Placeholder */}
      <div className="hidden md:flex flex-grow bg-[#F3F7FB] items-center justify-center p-20 relative">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="text-center max-w-sm relative z-10">
          <div className="w-24 h-24 bg-white rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-900/10">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">Strategic Dialogue</h2>
          <p className="text-slate-400 font-bold leading-relaxed">
            Select an operational frequency from the sidebar to begin your campus intelligence consultation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatDashboardPage;
