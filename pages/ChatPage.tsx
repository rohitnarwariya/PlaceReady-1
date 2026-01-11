
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
  getDoc,
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

  useEffect(() => {
    if (!uid || !id) {
      navigate('/login');
      return;
    }

    const markAsRead = async (chatData: any) => {
      const currentSeenBy = chatData.seenBy || [];
      if (!currentSeenBy.includes(uid)) {
        try {
          await updateDoc(doc(db, 'chats', id), {
            seenBy: [...currentSeenBy, uid]
          });
        } catch (err) {
          console.error("Mark as read error:", err);
        }
      }
    };

    const fetchChatInfo = async () => {
      const chatDoc = await getDoc(doc(db, 'chats', id));
      if (chatDoc.exists()) {
        const data = chatDoc.data() as any;
        if (data.userAId !== uid && data.userBId !== uid) {
          navigate('/chats');
          return;
        }
        setChatInfo(data);
        markAsRead(data);
      } else {
        navigate('/chats');
      }
    };
    fetchChatInfo();

    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'
      })) as any[];
      
      msgs.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeA - timeB;
      });

      setMessages(msgs);
      setLoading(false);
      
      // Auto-mark as read when new messages arrive while user is in chat
      if (chatInfo) markAsRead(chatInfo);
      
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [id, uid, navigate, chatInfo?.updatedAt]); // Re-run if updatedAt changes to mark as read

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

      // When sending a message, seenBy only contains the sender
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-100">
      
      {/* High-Contrast Professional Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-[73px] z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/chats')} 
            className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all group"
          >
            <svg className="w-6 h-6 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-[18px] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-slate-200">
              {otherName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1">{otherName}</h2>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {chatInfo?.domain || 'Campus Rep'} Specialist
                 </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
           <div className="px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
             <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">Verified Secure Transmission</span>
           </div>
        </div>
      </div>

      {/* Conversation Thread - Professional Feed Style */}
      <div className="flex-grow p-6 md:p-12 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col space-y-6">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === uid;
          
          return (
            <div 
              key={msg.id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
            >
              <div 
                className={`max-w-[80%] group ${isMe ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`px-6 py-4 text-[15px] leading-relaxed font-medium shadow-sm transition-all duration-300 ${
                    isMe 
                    ? 'bg-slate-900 text-white rounded-[28px] rounded-br-none hover:bg-slate-800' 
                    : 'bg-white text-slate-700 rounded-[28px] rounded-bl-none border border-slate-100 hover:border-blue-200'
                  }`}
                >
                  {msg.text}
                </div>
                <div className={`mt-2 flex items-center gap-2 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {msg.timestamp}
                  </span>
                  {isMe && <span className="text-sm font-bold text-emerald-500">✓</span>}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-20">
            <div className="w-24 h-24 bg-white rounded-[48px] flex items-center justify-center mb-8 shadow-inner border border-slate-100">
               <span className="text-4xl grayscale">✉️</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-3">Begin Consultation</h3>
            <p className="text-slate-400 font-bold max-w-[280px]">Establish dialogue with {otherName} to receive campus recruitment intelligence.</p>
          </div>
        )}
        <div ref={scrollRef} className="h-24" />
      </div>

      {/* Professional Intel Input Field */}
      <div className="p-6 md:p-10 sticky bottom-0 z-40 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="flex-grow relative group">
            <div className="absolute inset-0 bg-blue-600/5 rounded-[32px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Draft your query or response..."
              className="relative w-full bg-white border-2 border-white rounded-[32px] px-8 py-5 text-[15px] text-slate-900 outline-none focus:border-slate-900 shadow-2xl shadow-slate-200 transition-all placeholder:text-slate-300 font-bold"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className={`absolute right-3 top-3 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                inputText.trim() 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-400 scale-100 hover:bg-blue-600' 
                : 'bg-slate-100 text-slate-300 scale-90 opacity-50'
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
