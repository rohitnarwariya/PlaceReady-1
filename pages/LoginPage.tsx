
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  auth, 
  db,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc
} from '../firebase';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  const syncUserProfile = async (firebaseUser: any) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    let profile;

    if (userDocSnap.exists()) {
      profile = userDocSnap.data();
      // Ensure seniors have a lastSeenNotificationsAt field
      if (profile.role === 'senior' && !profile.lastSeenNotificationsAt) {
        const now = new Date();
        await updateDoc(userDocRef, {
          lastSeenNotificationsAt: now
        });
        profile.lastSeenNotificationsAt = now;
      }
    } else {
      const usersStr = localStorage.getItem('placeready_users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      let localUser = users.find((u: any) => u.email?.toLowerCase() === firebaseUser.email?.toLowerCase());

      if (localUser) {
        profile = { 
          ...localUser, 
          uid: firebaseUser.uid,
          lastSeenNotificationsAt: localUser.role === 'senior' ? new Date() : null
        };
      } else {
        profile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          role: 'junior',
          branch: 'CSE',
          section: 'General',
          createdAt: serverTimestamp(),
          lastSeenNotificationsAt: null
        };
      }
      await setDoc(userDocRef, profile);
    }
    
    localStorage.setItem('user_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('storage'));
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncUserProfile(userCredential.user);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user);
      navigate('/');
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain Unauthorized: Please add "${window.location.hostname}" to your Firebase Console > Authentication > Settings > Authorized Domains.`);
      } else {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex flex-col items-center justify-center p-6 fade-in">
      <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100">
        <div className="w-full md:w-1/2 bg-slate-900 p-16 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="text-2xl font-black tracking-tighter mb-12 block flex items-center">
              <span className="text-blue-500 mr-2">•</span> PlaceReady
            </Link>
            <h2 className="text-5xl font-black leading-none mb-6 tracking-tighter">Campus <br/>Auth</h2>
            <p className="text-slate-400 text-lg font-medium max-w-xs">One identity for all your placement resources.</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        </div>

        <div className="w-full md:w-1/2 p-16 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Sign In</h1>
            <p className="text-slate-400 mb-8 font-bold">Access your placement dashboard.</p>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-bold mb-8 border border-red-100 text-center leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleLocalLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-500"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-xl disabled:opacity-70 active:scale-95 uppercase text-[10px] tracking-widest"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-slate-100 flex-grow"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or</span>
              <div className="h-px bg-slate-100 flex-grow"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-100 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 text-[10px] uppercase tracking-widest shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Sign in with Google
            </button>

            <p className="mt-8 text-center text-xs text-slate-400 font-bold">
              New here? <Link to="/signup" className="text-blue-600 font-black hover:underline">Register Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
