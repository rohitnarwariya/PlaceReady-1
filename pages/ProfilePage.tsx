
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc } from '../firebase';
import { DOMAINS } from '../constants';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    cgpa: '',
    linkedinUrl: '',
    branch: 'CSE',
    section: 'General',
    profilePic: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      await loadProfile(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadProfile = async (uid: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || ''),
          cgpa: data.cgpa?.toString() || '',
          linkedinUrl: data.linkedinUrl || '',
          branch: data.branch || 'CSE',
          section: data.section || 'General',
          profilePic: data.profilePic || ''
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit for base64 storage
        setError('Image is too large. Please select an image under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSaving(true);
    setError('');

    const updatedProfile = {
      ...profile,
      name: formData.name,
      bio: formData.bio,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
      cgpa: parseFloat(formData.cgpa) || 0,
      linkedinUrl: formData.linkedinUrl,
      branch: formData.branch,
      section: formData.section,
      profilePic: formData.profilePic
    };

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), updatedProfile, { merge: true });
      setProfile(updatedProfile);
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event('storage'));
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Syncing Digital Identity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 fade-in">
      {/* Premium Hero Header */}
      <div className="h-80 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      </div>

      <div className="max-w-5xl mx-auto px-8 -mt-40 relative z-10">
        <div className="bg-white rounded-[48px] shadow-2xl p-10 md:p-16 border border-slate-100">
          
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-16">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div 
                onClick={() => isEditing && fileInputRef.current?.click()}
                className={`w-44 h-44 bg-slate-50 rounded-[56px] flex items-center justify-center text-6xl font-black text-blue-600 border-8 border-white shadow-xl relative group overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
              >
                {formData.profilePic ? (
                  <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile?.name?.charAt(0)
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                  </div>
                )}
                {!isEditing && <div className="absolute inset-0 bg-blue-600 rounded-[56px] opacity-0 group-hover:opacity-10 transition-opacity"></div>}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />

              <div className="text-center md:text-left">
                <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">{profile?.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                    {profile?.yearLabel} {profile?.role}
                  </span>
                  <span className="bg-slate-100 text-slate-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                    {profile?.section} Domain
                  </span>
                  {profile?.isVerified && (
                    <span className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center">
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                isEditing 
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                : 'bg-slate-900 text-white hover:bg-blue-600 shadow-blue-100'
              }`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-black text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Display Name</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Academic CGPA</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all font-bold text-slate-700"
                      placeholder="e.g. 8.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Branch</label>
                    <select 
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all font-bold text-slate-700 cursor-pointer"
                    >
                      <option>CSE</option>
                      <option>IT</option>
                      <option>ECE</option>
                      <option>EEE</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Expertise Domain</label>
                    <select 
                      value={formData.section}
                      onChange={(e) => setFormData({...formData, section: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all font-bold text-slate-700 cursor-pointer"
                    >
                      {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">LinkedIn Profile URL</label>
                    <input 
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all font-bold text-slate-700"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Skills (Comma separated)</label>
                    <input 
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all font-bold text-slate-700"
                      placeholder="React, DSA, Node.js, SQL"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Short Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all font-bold text-slate-700 min-h-[120px] resize-none"
                  placeholder="Tell us about your placement journey or goals..."
                />
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-20 py-5 rounded-[24px] transition-all shadow-2xl shadow-blue-100 active:scale-95 disabled:opacity-70 uppercase text-sm tracking-[0.2em]"
                >
                  {saving ? 'Syncing...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Column: Core Data */}
              <div className="space-y-12">
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                    Professional Brief
                  </h3>
                  <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                    <p className="text-slate-600 leading-relaxed font-medium italic">
                      "{profile?.bio || 'No bio provided. Update your profile to share your journey.'}"
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                    Technical Arsenal
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill: string) => (
                        <span key={skill} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 shadow-sm hover:border-blue-300 transition-colors">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic">No skills listed yet.</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Stats & Context */}
              <div className="space-y-12">
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                    Academic Standing
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl shadow-slate-200">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current CGPA</p>
                      <p className="text-4xl font-black">{profile?.cgpa || '0.0'}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Branch</p>
                      <p className="text-2xl font-black text-slate-900">{profile?.branch}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></span>
                    Verification Context
                  </h3>
                  <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-50/50">
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                      As a <span className="text-blue-600 font-black">{profile?.yearLabel} {profile?.role}</span>, 
                      your interactions are governed by PlaceReady hierarchy rules. 
                      {profile?.role === 'senior' 
                        ? ` You have authorization to provide verified guidance to juniors in the ${profile?.section} domain.` 
                        : ` You can seek guidance and roadmap analysis from verified seniors.`}
                    </p>
                    {profile?.linkedinUrl && (
                      <a 
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 flex items-center justify-center space-x-3 bg-white hover:bg-blue-600 hover:text-white transition-all py-4 rounded-2xl border border-blue-100 shadow-sm group"
                      >
                        <svg className="w-5 h-5 text-[#0077b5] group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0-2.761 2.239-5 5-5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        <span className="text-xs font-black uppercase tracking-widest">Connect on LinkedIn</span>
                      </a>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.5em]">
          Profile ID: PR-{profile?.uid?.substring(0, 8).toUpperCase() || 'REF-GUEST'}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
