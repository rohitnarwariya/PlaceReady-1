
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  auth, 
  db,
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  googleProvider,
  onAuthStateChanged,
  doc,
  setDoc,
  serverTimestamp
} from '../firebase';

const DOMAINS = ['DSA', 'Web Development', 'Core CS', 'Electronics', 'Mechanical', 'Civil', 'General'];
const YEAR_OPTIONS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' }
];

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: 'CSE',
    section: 'General',
    password: '',
    year: 0 // 0 is invalid state
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  const deriveRole = (year: number) => {
    return year === 1 ? 'junior' : 'senior';
  };

  const saveUserProfile = async (firebaseUser: any) => {
    if (formData.year === 0) throw new Error("Academic Year is required.");

    const role = deriveRole(formData.year);
    const yearLabel = YEAR_OPTIONS.find(y => y.value === formData.year)?.label || '';

    const profile = {
      uid: firebaseUser.uid,
      name: formData.name || firebaseUser.displayName || 'New Member',
      email: firebaseUser.email,
      branch: formData.branch,
      section: formData.section, // This is the user's Domain
      year: formData.year,
      yearLabel: yearLabel,
      role: role,
      createdAt: serverTimestamp(),
      lastSeenNotificationsAt: role === 'senior' ? new Date() : null
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), profile);
    localStorage.setItem('user_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.year === 0) {
      setError("Please select your academic year.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });
      await saveUserProfile(userCredential.user);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (formData.year === 0) {
      setError("Select Academic Year before signing up with Google.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserProfile(result.user);
      navigate('/');
    } catch (err: any) {
      setError('Google Sign-Up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex flex-col items-center py-12 px-6 fade-in">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-10 md:p-16 flex flex-col border border-slate-100">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Create Profile</h1>
          <p className="text-slate-400 text-lg font-bold">Your academic year controls who you can help and learn from.</p>
        </header>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-[11px] font-bold border border-red-100 text-center">
            {error}
          </div>
        )}

        <div className="mb-10 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-6">Step 1: Select Current Academic Year</p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {YEAR_OPTIONS.map((y) => (
                <button 
                  key={y.value}
                  type="button"
                  onClick={() => setFormData({...formData, year: y.value})}
                  className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                    formData.year === y.value 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                      : 'bg-white border-slate-200 text-slate-400 hover:border-blue-200'
                  }`}
                >
                  {y.label}
                </button>
              ))}
            </div>
            {formData.year > 0 && (
              <p className="mt-4 text-center text-xs font-black text-blue-600 uppercase tracking-widest">
                Derived Role: {deriveRole(formData.year)}
              </p>
            )}
        </div>

        <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Full Name</label>
            <input 
              type="text" required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Email</label>
            <input 
              type="email" required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Expert Domain</label>
            <select 
              value={formData.section}
              onChange={(e) => setFormData({...formData, section: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-500 cursor-pointer"
            >
              {DOMAINS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Create Password</label>
            <input 
              type="password" required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-500"
            />
          </div>

          <div className="md:col-span-2 mt-6">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl disabled:opacity-70 uppercase text-xs tracking-widest active:scale-95"
            >
              {loading ? 'Processing...' : 'Complete Signup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
