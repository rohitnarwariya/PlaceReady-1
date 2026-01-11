
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  auth, 
  db, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc
} from '../firebase';
import { ChatMessage } from '../types';

const ChatPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user_profile') || '{}');
  const uid = auth.currentUser?.uid;

  // Auto-scroll function
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!uid || !id) {
      navigate('/login');
      return;
    }

    // Real-time listener for the chat document to handle "Mark as Read" and info updates
    const unsubscribeChat = onSnapshot(doc(db, 'chats', id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.userAId !== uid && data.userBId !== uid) {
          navigate('/chats');
          return;
        }
        setChatInfo({ id: snapshot.id, ...data });

        // Mark as Read logic
        const currentSeenBy = data.seenBy || [];
        if (!currentSeenBy.includes(uid)) {
          updateDoc(doc(db, 'chats', id), {
            seenBy: [...currentSeenBy, uid]
          }).catch(err => console.error("Mark as read error:", err));
        }
      } else {
        navigate('/chats');
      }
    });

    // Real-time listener for messages
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', id)
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'
      })) as any[];
      
      // Sort messages, handling null timestamps (pending server sync) by putting them at the bottom
      msgs.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : Date.now();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : Date.now();
        return timeA - timeB;
      });

      setMessages(msgs);
      setLoading(false);
      
      // Execute scroll after state update
      setTimeout(scrollToBottom, 150);
    });

    return () => {
      unsubscribeChat();
      unsubscribeMessages();
    };
  }, [id, uid, navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !uid || !id) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'messages'), {
        chatId: id,
        senderId: uid,
        text: text,
        createdAt: serverTimestamp()
      });

      // Reset seenBy to only contain the sender, notifying the other participant
      await updateDoc(doc(db, 'chats', id), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
        seenBy: [uid] 
      });
    } catch (err) {
      console.error("Message Send Error:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-t-2 border-slate-900 rounded-full animate-spin"></div>
    </div>
  );

  const isUserA = chatInfo?.userAId === uid;
  const otherName = isUserA ? (chatInfo?.userBName || "Mentor") : (chatInfo?.userAName || "Student");

  return (
    <div className="h-[calc(100vh-73px)] bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-100 overflow-hidden">
      
      {/* High-Contrast Professional Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/chats')} 
            className="w-11 h-11 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl flex items-center justify-center transition-all group"
          >
            <svg className="w-6 h-6 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-[18px] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-slate-200">
              {otherName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1.5">{otherName}</h2>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {chatInfo?.domain || 'Campus Rep'} Intel Access
                 </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
           <div className="px-5 py-2 bg-blue-50 border border-blue-100 rounded-xl">
             <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">Operational Frequency Locked</span>
           </div>
        </div>
      </div>

      {/* Conversation Thread - Professional Feed Style */}
      <div className="flex-grow p-6 md:px-20 md:py-10 overflow-y-auto max-w-5xl mx-auto w-full custom-scrollbar">
        <div className="flex flex-col space-y-6 pb-40"> {/* Increased padding bottom to prevent input overlap */}
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === uid;
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
              >
                <div 
                  className={`max-w-[75%] group ${isMe ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`px-7 py-5 text-[15px] leading-relaxed font-medium shadow-sm transition-all duration-300 ${
                      isMe 
                      ? 'bg-slate-900 text-white rounded-[32px] rounded-br-none hover:bg-slate-800 shadow-slate-300/20' 
                      : 'bg-white text-slate-700 rounded-[32px] rounded-bl-none border border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className={`mt-2 flex items-center gap-3 px-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.timestamp}
                    </span>
                    {isMe && <span className="text-blue-500 text-[10px] font-black tracking-widest">TRANSMITTED ✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-32">
              <div className="w-28 h-28 bg-white rounded-[56px] flex items-center justify-center mb-10 shadow-inner border border-slate-100">
                 <span className="text-4xl grayscale opacity-30">🛡️</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">Initialize Data Stream</h3>
              <p className="text-slate-400 font-bold max-w-[320px] text-sm leading-relaxed">This consultation is now active. Dispatch your first inquiry to receive intelligence.</p>
            </div>
          )}
          <div ref={scrollRef} className="h-4 w-full" />
        </div>
      </div>

      {/* Professional Intel Input Field */}
      <div className="p-6 md:px-12 md:pb-12 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent relative z-10">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-5">
          <div className="flex-grow relative group">
            <div className="absolute inset-0 bg-blue-600/5 rounded-[40px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dispatch strategic response..."
              className="relative w-full bg-white border-2 border-white rounded-[40px] px-10 py-6 text-[15px] text-slate-900 outline-none focus:border-slate-900 shadow-2xl shadow-slate-200 transition-all placeholder:text-slate-300 font-bold"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className={`absolute right-4 top-4 w-12 h-12 rounded-[22px] flex items-center justify-center transition-all duration-500 ${
                inputText.trim() 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-400 scale-100 hover:bg-blue-600 hover:rotate-12' 
                : 'bg-slate-50 text-slate-200 scale-90 opacity-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
