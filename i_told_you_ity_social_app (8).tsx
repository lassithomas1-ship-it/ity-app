import React, { useState, useEffect } from 'react';
import { 
  Trophy, Flame, TrendingUp, Compass, PlusCircle, Bell, User, CheckCircle2, 
  XCircle, Clock, ShieldCheck, Share2, Heart, MessageSquare, Filter, Search, 
  Sparkles, ExternalLink, Award, BarChart3, AlertCircle, Music, Tv, Gamepad2, 
  Cpu, Users, Globe, DollarSign, HelpCircle, ChevronRight, RefreshCw, Send, Check, LogOut
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc
} from 'firebase/firestore';

// --- INITIALIZE FIREBASE ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "demo-key",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "123456",
  appId: "1:123456:web:123456"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ity-social-app';

// PROFANITY & POLICY VALIDATION ENGINE (Multilingual filter)
const BAD_WORDS_REGEX = /\b(cazzo|merda|stronzo|stronza|bastardo|bastarda|puttana|troia|figa|vaffanculo|coglio|minchia|porco|porca|bitch|shit|fuck|asshole|dick|pussy|bastard)\b/i;

const validateProfanityPolicy = (text) => {
  if (!text) return true;
  return !BAD_WORDS_REGEX.test(text);
};

// AUTOMATIC CONTEXTUAL CATEGORIZATION ENGINE
const detectCategoryFromText = (text) => {
  const lower = (text || '').toLowerCase();
  if (lower.match(/(partita|champions|pallone d'oro|squadra|calcio|basket|nba|tennis|gol|giocatore|vincere|campionato|mondiale|kane)/)) return 'sport';
  if (lower.match(/(canzone|album|cantante|musica|spotify|ascoltatori|concerto|singolo|sanremo|rap|pop)/)) return 'musica';
  if (lower.match(/(film|cinema|oscar|serie|actor|attrice|regista|boxoffice|netflix|botteghino)/)) return 'cinema';
  if (lower.match(/(gta|gioco|gaming|console|ps5|playstation|xbox|nintendo|steam|goty|rinvio)/)) return 'gaming';
  if (lower.match(/(apple|ai|intelligenza artificiale|iphone|tech|software|hardware|chip|nvidia|google)/)) return 'tech';
  if (lower.match(/(influencer|creator|youtube|tiktok|instagram|follower|iscritti|mrbeast)/)) return 'influencer';
  if (lower.match(/(scienza|spazio|scoperta|nasa|salute|attualita|elezioni|governo|clima)/)) return 'attualita';
  if (lower.match(/(bitcoin|crypto|azioni|mercato|pil|inflazione|borsa|economia|dollar|euro|asset)/)) return 'economia';
  return 'altro';
};

// --- INITIAL DEMO DATA ---
const INITIAL_CATEGORIES = [
  { id: 'sport', name: 'Sport', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10', desc: 'Risultati, trofei e trasferimenti' },
  { id: 'musica', name: 'Musica', icon: Music, color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Album, concerti e stream Spotify' },
  { id: 'cinema', name: 'Cinema & Serie TV', icon: Tv, color: 'text-red-400', bg: 'bg-red-400/10', desc: 'Botteghino, premi Oscar e uscite' },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'text-indigo-400', bg: 'bg-indigo-400/10', desc: 'Rinvii giochi, GOTY e vendite' },
  { id: 'tech', name: 'Tecnologia', icon: Cpu, color: 'text-cyan-400', bg: 'bg-cyan-400/10', desc: 'Lanci prodotti, AI e rumor tech' },
  { id: 'influencer', name: 'Influencer & Creator', icon: Users, color: 'text-pink-400', bg: 'bg-pink-400/10', desc: 'Traguardi follower e format' },
  { id: 'attualita', name: 'Attualità', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'Eventi globali e scoperte' },
  { id: 'economia', name: 'Economia', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10', desc: 'Asset, stock, crypto e mercati' },
  { id: 'altro', name: 'Altro', icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-400/10', desc: 'Previsioni libere e curiosità' },
];

const INITIAL_PROPHETS = [
  { id: 'u1', username: 'Marco_Vettori', name: 'Marco Vettori', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Marco_Vettori', bio: 'Analista sportivo e appassionato di tech.', proofScore: 940, verifiedCount: 42, totalCount: 48, accuracy: 87.5, primaryCategory: 'sport' },
  { id: 'u2', username: 'Elena_MusicMind', name: 'Elena Rostova', avatar: 'https://api.dicebear.com/7.x/monsters/svg?seed=Elena_MusicMind', bio: 'Scout musicale. Trovo le star prima dei talent.', proofScore: 880, verifiedCount: 31, totalCount: 36, accuracy: 86.1, primaryCategory: 'musica' },
  { id: 'u3', username: 'TechNostradamus', name: 'Andrea Conti', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TechNostradamus', bio: 'Prevedo l evoluzione delle Big Tech dal 2018.', proofScore: 810, verifiedCount: 29, totalCount: 35, accuracy: 82.8, primaryCategory: 'tech' },
  { id: 'u4', username: 'GamerOracle', name: 'Luca Basso', avatar: 'https://api.dicebear.com/7.x/monsters/svg?seed=GamerOracle', bio: 'Insider amatoriale dell industria dei videogiochi.', proofScore: 760, verifiedCount: 22, totalCount: 28, accuracy: 78.5, primaryCategory: 'gaming' },
];

const INITIAL_PREDICTIONS = [
  {
    id: 'p1',
    authorId: 'u1',
    author: INITIAL_PROPHETS[0],
    category: 'sport',
    title: 'Vittoria Pallone d\'Oro Harry Kane',
    predictionText: 'Harry Kane vincerà il premio ufficiale del Pallone d\'Oro.',
    verificationType: 'LEVEL_1',
    status: 'VERIFIED_TRUE',
    targetInfo: { event: 'Ballon d\'Or', metric: 'Winner', targetValue: 'Harry Kane' },
    deadline: '2025-10-28',
    timestamp: '2025-01-12 14:32:00',
    hash: '0x8f4a2b919e...d4c1',
    likes: 342,
    likedBy: ['u2', 'u3'],
    commentsCount: 2,
    comments: [
      { id: 'c1', author: INITIAL_PROPHETS[1], text: 'Puntata azzeccatissima! Avevi ragione fin dal primo giorno.', timestamp: '2025-10-29 10:15:00' },
      { id: 'c2', author: INITIAL_PROPHETS[2], text: 'Grande intuizione! Pronostico impeccabile e verificato.', timestamp: '2025-10-29 11:30:00' }
    ],
    verificationDetails: {
      source: 'API-Football & France Football Data Feed',
      verifiedAt: '2025-10-28 23:45:00',
      evidenceValue: 'Vincitore Ufficiale Confermato'
    },
    communityVotes: { yes: 89, no: 11 }
  },
  {
    id: 'p2',
    authorId: 'u2',
    author: INITIAL_PROPHETS[1],
    category: 'musica',
    title: 'Ascoltatori Spotify Artista Emergente',
    predictionText: 'L artista indie "Kaelen" supererà i 500.000 ascoltatori mensili su Spotify.',
    verificationType: 'LEVEL_2',
    status: 'VERIFIED_TRUE',
    targetInfo: { entity: 'Kaelen (Artist)', metric: 'Spotify Monthly Listeners', startValue: '45,000', targetValue: '500,000' },
    deadline: '2026-11-30',
    timestamp: '2025-10-04 09:15:22',
    hash: '0x3c99021a8f...b902',
    likes: 512,
    likedBy: ['u1'],
    commentsCount: 1,
    comments: [
      { id: 'c3', author: INITIAL_PROPHETS[3], text: 'L ho scoperto grazie alla tua previsione, ora lo ascolto sempre!', timestamp: '2026-04-12 14:00:00' }
    ],
    verificationDetails: {
      source: 'Spotify API Stream Poller',
      verifiedAt: '2026-04-12 10:00:00',
      evidenceValue: 'Raggiunti 542.190 ascoltatori mensili'
    },
    communityVotes: { yes: 94, no: 6 }
  },
  {
    id: 'p3',
    authorId: 'u3',
    author: INITIAL_PROPHETS[2],
    category: 'tech',
    title: 'Lancio Headset AR Apple di 2a Generazione',
    predictionText: 'Apple annuncerà il Vision Pro 2 con un prezzo inferiore a 2000$ prima di fine 2026.',
    verificationType: 'LEVEL_1',
    status: 'PENDING',
    targetInfo: { entity: 'Apple Vision Pro 2', metric: 'Price Point & Release', targetValue: '< $2000' },
    deadline: '2026-12-31',
    timestamp: '2026-01-10 18:20:00',
    hash: '0x12a677efd3...e87a',
    likes: 189,
    likedBy: [],
    commentsCount: 0,
    comments: [],
    verificationDetails: null,
    communityVotes: { yes: 62, no: 38 }
  },
  {
    id: 'p4',
    authorId: 'u4',
    author: INITIAL_PROPHETS[3],
    category: 'gaming',
    title: 'Nuovo Rinvio GTA 6',
    predictionText: 'La data di uscita di GTA 6 verrà posticipata alla primavera del 2027.',
    verificationType: 'LEVEL_3',
    status: 'PENDING',
    targetInfo: { entity: 'GTA VI', metric: 'Release Window', targetValue: 'Q1/Q2 2027' },
    deadline: '2026-09-30',
    timestamp: '2026-02-15 11:05:40',
    hash: '0x99e1268bc4...a111',
    likes: 670,
    likedBy: [],
    commentsCount: 0,
    comments: [],
    verificationDetails: null,
    communityVotes: { yes: 74, no: 26 }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [predictions, setPredictions] = useState(INITIAL_PREDICTIONS);
  const [prophets, setProphets] = useState(INITIAL_PROPHETS);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [copiedPredId, setCopiedPredId] = useState(null);

  // AUTH STATE - DIRECT STABLE FLOW
  const [authUser, setAuthUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState('register');
  const [authForm, setAuthForm] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  });

  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Previsione Avverata! 🎉', body: 'La tua previsione è stata verificata automaticamente dal server ITY.', time: '2 ore fa', read: false },
    { id: 'n2', title: 'Nuovo Follower', body: 'Elena Rostova ha iniziato a seguirti.', time: '1 giorno fa', read: true },
  ]);

  const [currentUser, setCurrentUser] = useState({
    id: 'curr_user',
    username: 'Tu_IlNostradamus',
    name: 'Tu_IlNostradamus',
    avatar: 'https://api.dicebear.com/7.x/monsters/svg?seed=Tu_IlNostradamus',
    bio: 'Pioniere delle previsioni su ITY. Cerco sempre di avere ragione in anticipo.',
    proofScore: 450,
    verifiedCount: 8,
    totalCount: 10,
    accuracy: 80.0,
    primaryCategory: 'tech'
  });

  // EDIT PROFILE STATE
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    username: '',
    avatar: '',
    bio: ''
  });

  // Avatar di mostriciattoli e personaggi 100% SVG visibili e garantiti senza immagini spezzate
  const PRESET_AVATARS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=MonsterAlpha1',
    'https://api.dicebear.com/7.x/bottts/svg?seed=MonsterBeta2',
    'https://api.dicebear.com/7.x/bottts/svg?seed=MonsterGamma3',
    'https://api.dicebear.com/7.x/bottts/svg?seed=CyberHero',
    'https://api.dicebear.com/7.x/bottts/svg?seed=OracleBot',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=ProphetMaster',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=VisionaryHero'
  ];

  const handleOpenEditProfile = () => {
    setEditProfileForm({
      username: currentUser.username || '',
      avatar: currentUser.avatar || '',
      bio: currentUser.bio || ''
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const cleanUsername = editProfileForm.username.trim().replace(/\s+/g, '_') || currentUser.username;
    
    const updatedUser = {
      ...currentUser,
      username: cleanUsername,
      name: cleanUsername,
      avatar: editProfileForm.avatar.trim() || currentUser.avatar,
      bio: editProfileForm.bio.trim()
    };

    // Aggiornamento dello stato locale utente corrente
    setCurrentUser(updatedUser);

    // Se l'utente sta visualizzando il proprio profilo, aggiorna istantaneamente la vista attiva
    if (viewingProfile && (viewingProfile.id === currentUser.id || viewingProfile.username === currentUser.username)) {
      setViewingProfile(updatedUser);
    }

    // Aggiornamento lista profeti globale
    setProphets(prev => prev.map(p => p.id === currentUser.id || p.username === currentUser.username ? updatedUser : p));

    // Aggiorna autore in tutte le previsioni pubblicate
    setPredictions(prev => prev.map(p => {
      if (p.authorId === currentUser.id || p.author.username === currentUser.username) {
        return {
          ...p,
          author: { ...p.author, username: cleanUsername, name: cleanUsername, avatar: updatedUser.avatar }
        };
      }
      return p;
    }));

    setShowEditProfileModal(false);
  };

  // AUTH HANDLER CON VALIDAZIONE RIGOROSA EMAIL E CREDENZIALI FIREBASE
  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    const cleanEmail = (authForm.email || '').trim().toLowerCase();
    const cleanPassword = (authForm.password || '').trim();
    const cleanUsername = (authForm.username || cleanEmail.split('@')[0] || 'Profeta_ITY').trim().replace(/\s+/g, '_');

    // Validazione rigorosa indirizzo Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setAuthError('Inserisci un indirizzo email reale e valido (es. utente@dominio.it).');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setAuthError('La password deve essere di almeno 6 caratteri.');
      return;
    }

    try {
      let userCredential;
      if (authMode === 'register') {
        userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      }

      const uid = userCredential.user.uid;
      const newProfile = {
        id: uid,
        username: cleanUsername,
        name: authForm.name.trim() || cleanUsername,
        avatar: 'https://api.dicebear.com/7.x/monsters/svg?seed=' + cleanUsername,
        bio: 'Pioniere delle previsioni su ITY. Cerco sempre di avere ragione in anticipo.',
        proofScore: 100,
        verifiedCount: 0,
        totalCount: 0,
        accuracy: 0.0,
        primaryCategory: 'tech'
      };

      setCurrentUser(newProfile);
      setProphets(prev => [newProfile, ...prev.filter(p => p.id !== uid)]);
      setAuthUser({ uid: uid, email: cleanEmail });

    } catch (err) {
      // Gestione errori di Firebase Authentication
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('Questa email è già registrata. Passa alla schermata di Login.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setAuthError('Credenziali non valide: email o password errata.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Indirizzo email non valido.');
      } else {
        // Safe fallback per ambiente anteprima/demo
        const uid = 'user_' + Date.now();
        const newProfile = {
          id: uid,
          username: cleanUsername,
          name: authForm.name.trim() || cleanUsername,
          avatar: 'https://api.dicebear.com/7.x/monsters/svg?seed=' + cleanUsername,
          bio: 'Pioniere delle previsioni su ITY. Cerco sempre di avere ragione in anticipo.',
          proofScore: 100,
          verifiedCount: 0,
          totalCount: 0,
          accuracy: 0.0,
          primaryCategory: 'tech'
        };
        setCurrentUser(newProfile);
        setProphets(prev => [newProfile, ...prev]);
        setAuthUser({ uid: uid, email: cleanEmail });
      }
    }
  };

  const handleSignOut = () => {
    signOut(auth).catch(() => {});
    setAuthUser(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [policyError, setPolicyError] = useState('');
  const [detectedCategory, setDetectedCategory] = useState('tech');

  const [newPredData, setNewPredData] = useState({
    title: '',
    predictionText: '',
    verificationType: 'LEVEL_1',
    targetEntity: '',
    targetMetric: '',
    targetValue: '',
    deadline: todayStr
  });

  const handlePredictionTextChange = (e) => {
    const val = e.target.value;
    setNewPredData({ ...newPredData, predictionText: val });
    const cat = detectCategoryFromText(`${newPredData.title} ${val}`);
    setDetectedCategory(cat);
  };

  // --- COMMENTS SYSTEM ---
  const [openCommentsPredId, setOpenCommentsPredId] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  const handleAddComment = (predId) => {
    if (!commentInput.trim()) return;

    if (!validateProfanityPolicy(commentInput)) {
      alert("Violazione della Policy ITY: Il commento contiene linguaggio inappropriato o turpiloquio.");
      return;
    }

    const newComment = {
      id: 'c_' + Date.now(),
      author: currentUser,
      text: commentInput.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setPredictions(prev => prev.map(p => {
      if (p.id === predId) {
        const existingComments = p.comments || [];
        return {
          ...p,
          comments: [...existingComments, newComment],
          commentsCount: (p.commentsCount || 0) + 1
        };
      }
      return p;
    }));

    setCommentInput('');
  };

  const handleVote = (predId, option) => {
    setPredictions(prev => prev.map(p => {
      if (p.id === predId) {
        const votes = p.communityVotes || { yes: 50, no: 50 };
        return {
          ...p,
          communityVotes: {
            yes: option === 'yes' ? votes.yes + 1 : votes.yes,
            no: option === 'no' ? votes.no + 1 : votes.no
          }
        };
      }
      return p;
    }));
  };

  const handleLike = (predId) => {
    setPredictions(prev => prev.map(p => {
      if (p.id === predId) {
        const likedBy = p.likedBy || [];
        const isLiked = likedBy.includes(currentUser.id);
        if (isLiked) {
          return {
            ...p,
            likes: Math.max(0, p.likes - 1),
            likedBy: likedBy.filter(id => id !== currentUser.id)
          };
        } else {
          return {
            ...p,
            likes: p.likes + 1,
            likedBy: [...likedBy, currentUser.id]
          };
        }
      }
      return p;
    }));
  };

  const handleShare = (pred) => {
    const textToCopy = `Io l'avevo detto... "${pred.title}: ${pred.predictionText}" - Prova registrata su ITY!`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedPredId(pred.id);
      setTimeout(() => setCopiedPredId(null), 2500);
    }).catch(() => {});
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setPolicyError('');

    if (!newPredData.title || !newPredData.predictionText) return;

    const fullTextToValidate = `${newPredData.title} ${newPredData.predictionText} ${newPredData.targetEntity}`;
    if (!validateProfanityPolicy(fullTextToValidate)) {
      setPolicyError("Violazione della Policy di Condotta ITY: Il testo contiene parolacce o linguaggio improprio.");
      return;
    }

    if (newPredData.deadline && newPredData.deadline < todayStr) {
      alert("La data di scadenza deve essere oggi o una data futura.");
      return;
    }

    const finalAssignedCategory = detectCategoryFromText(`${newPredData.title} ${newPredData.predictionText}`);

    const newPred = {
      id: 'p_' + Date.now(),
      authorId: currentUser.id,
      author: currentUser,
      category: finalAssignedCategory,
      title: newPredData.title,
      predictionText: newPredData.predictionText,
      verificationType: newPredData.verificationType,
      status: 'PENDING',
      targetInfo: {
        entity: newPredData.targetEntity || 'Target',
        metric: 'Goal / Soglia',
        targetValue: newPredData.targetValue || 'Raggiungimento'
      },
      deadline: newPredData.deadline || todayStr,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      hash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6),
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      comments: [],
      verificationDetails: null,
      communityVotes: { yes: 50, no: 50 }
    };

    setPredictions([newPred, ...predictions]);
    setShowCreateModal(false);
    setNewPredData({
      title: '',
      predictionText: '',
      verificationType: 'LEVEL_1',
      targetEntity: '',
      targetMetric: '',
      targetValue: '',
      deadline: todayStr
    });
  };

  const filteredPredictions = predictions.filter(p => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (filterStatus === 'VERIFIED_TRUE' && p.status !== 'VERIFIED_TRUE') return false;
    if (filterStatus === 'PENDING' && p.status !== 'PENDING') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.predictionText.toLowerCase().includes(q) || p.author.username.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 font-sans flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* AUTH SCREEN MODAL (IF NOT LOGGED IN) */}
      {!authUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#12161F] border border-slate-800 w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -z-0"></div>
            
            <div className="text-center space-y-2 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 text-2xl tracking-wider mx-auto shadow-xl shadow-amber-500/20">
                ITY
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">I TOLD YOU</h1>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest">Social Network delle Previsioni</p>
              <p className="text-xs text-slate-400 pt-1">
                Accedi al tuo profilo da Profeta ed esibisci le tue previsioni avverate nel tempo.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs relative z-10">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      placeholder="Es. Mario Rossi"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Username Profeta (Unico)</label>
                    <input
                      type="text"
                      placeholder="Es. Marco_Vettori"
                      value={authForm.username}
                      onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                      className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Email Reale</label>
                <input
                  type="email"
                  placeholder="nome@dominio.it"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-[#0E1117] text-amber-500 focus:ring-0" />
                  <span>Rimani collegato</span>
                </label>
                {authMode === 'login' && (
                  <span className="text-amber-400 hover:underline cursor-pointer">Password dimenticata?</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all text-sm mt-2 flex items-center justify-center gap-2"
              >
                {authMode === 'register' ? 'Registra Account Reale' : 'Accedi al Profilo'}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400 relative z-10 flex justify-center gap-1">
              <span>{authMode === 'register' ? 'Hai già un account?' : 'Non hai un account?'}</span>
              <button
                type="button"
                onClick={() => { setAuthError(''); setAuthMode(authMode === 'register' ? 'login' : 'register'); }}
                className="text-amber-400 font-bold hover:underline"
              >
                {authMode === 'register' ? 'Accedi qui' : 'Crea un account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-[#0E1117] p-4 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 text-xl tracking-wider shadow-lg shadow-amber-500/20">
            ITY
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">I TOLD YOU</h1>
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest mt-1">Proof of Intuition</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button
            onClick={() => { setActiveTab('explore'); setSelectedCategory(null); setViewingProfile(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'explore' && !selectedCategory ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" /> Esplora Categorie
          </button>

          <button
            onClick={() => { setActiveTab('leaderboards'); setViewingProfile(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'leaderboards' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" /> Classifiche Status
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20 transition-all mt-4"
          >
            <PlusCircle className="w-4 h-4" /> Nuova Previsione
          </button>

          <button
            onClick={() => { setActiveTab('notifications'); setViewingProfile(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'notifications' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifiche
          </button>

          <button
            onClick={() => { setActiveTab('profile'); setViewingProfile(currentUser); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'profile' && !viewingProfile ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" /> Il Mio Profilo
          </button>
        </nav>

        {/* Current User Card Bottom */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-amber-400/40" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">@{currentUser.username}</p>
              <p className="text-[10px] text-amber-400 font-mono">Proof Score: {currentUser.proofScore}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut} 
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
            title="Esci dall'account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#0E1117] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 text-sm">
            ITY
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">I TOLD YOU</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 font-semibold text-xs flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" /> Nuova
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 text-slate-400 hover:text-red-400"
            title="Esci"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 space-y-6">

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cerca previsioni, intuizioni o profeti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12161F] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#12161F] border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tutti gli stati</option>
              <option value="VERIFIED_TRUE">Solo Avverati (TRUE)</option>
              <option value="PENDING">In Attesa di Verifica</option>
            </select>
          </div>
        </div>

        {/* --- VIEW: EXPLORE & FEED --- */}
        {activeTab === 'explore' && !viewingProfile && (
          <div className="space-y-6">
            
            {/* Category Cards Horizontal/Grid */}
            {!selectedCategory && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Categorie Principali</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                  {INITIAL_CATEGORIES.map(cat => {
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="flex flex-col text-left p-3.5 bg-[#12161F] hover:bg-[#181D29] border border-slate-800/80 rounded-2xl transition-all group relative overflow-hidden"
                      >
                        <div className={`w-8 h-8 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center mb-2`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">{cat.name}</h3>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cat.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Category Header */}
            {selectedCategory && (
              <div className="flex items-center justify-between bg-[#12161F] border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    ←
                  </button>
                  <div>
                    <h2 className="text-base font-bold text-white capitalize">{selectedCategory} Feed</h2>
                    <p className="text-xs text-slate-400">Intuizioni registrate in questa categoria</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-amber-400 font-semibold hover:underline"
                >
                  Mostra Tutte
                </button>
              </div>
            )}

            {/* FEED OF PREDICTIONS */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Feed Intuizioni Immutabili</h3>

              {filteredPredictions.length === 0 ? (
                <div className="text-center py-12 bg-[#12161F] border border-slate-800 rounded-2xl p-6">
                  <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">Nessuna previsione trovata con questi filtri.</p>
                </div>
              ) : (
                filteredPredictions.map(pred => {
                  const isUserLiked = (pred.likedBy || []).includes(currentUser.id);

                  return (
                    <div key={pred.id} className="bg-[#12161F] border border-slate-800/80 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg relative">
                      
                      {/* Header Card */}
                      <div className="flex items-center justify-between gap-3">
                        <div 
                          onClick={() => setViewingProfile(pred.author)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img src={pred.author.avatar} alt={pred.author.username} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs group-hover:underline">@{pred.author.username}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono">
                                {pred.author.proofScore} pts
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{pred.timestamp}</span>
                          </div>
                        </div>

                        {/* AUTOMATIC SERVER MONITORING BADGE */}
                        <div className="flex items-center gap-2">
                          {pred.status === 'VERIFIED_TRUE' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> AVVERATA (TRUE)
                            </span>
                          )}

                          {pred.status === 'VERIFIED_FALSE' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                              <XCircle className="w-3.5 h-3.5" /> NON AVVERATA (FALSE)
                            </span>
                          )}

                          {pred.status === 'PENDING' && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                              <span>MONITORAGGIO AUTOMATICO</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prediction Content */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="inline-block px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-wider">
                            "IO L'AVEVO DETTO..."
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                            Categoria: {pred.category}
                          </span>
                        </div>
                        <h4 className="text-white font-extrabold text-base">{pred.title}</h4>
                        <p className="text-slate-300 text-xs leading-relaxed bg-[#0A0C10] p-3 rounded-xl border border-slate-800 font-medium">
                          "{pred.predictionText}"
                        </p>
                      </div>

                      {/* Technical Proof Details */}
                      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">Livello Verifica: <strong className="text-white">{pred.verificationType}</strong></span>
                          <span className="text-slate-400">Scadenza Target: <strong className="text-slate-200">{pred.deadline}</strong></span>
                        </div>
                        {pred.verificationDetails ? (
                          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-mono flex items-center justify-between">
                            <span>Fonte Server: {pred.verificationDetails.source}</span>
                            <span>{pred.verificationDetails.evidenceValue}</span>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-amber-400" /> Engine ITY attivo: Polling continuo delle fonti e delle metriche in background.
                          </div>
                        )}
                      </div>

                      {/* Social Actions (Like, Comments, Share) */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        {/* Vote Bar */}
                        <div className="w-full sm:w-auto flex-1 flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[11px]">Consenso Community:</span>
                          <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-emerald-500 h-full transition-all" 
                              style={{ width: `${pred.communityVotes ? (pred.communityVotes.yes / (pred.communityVotes.yes + pred.communityVotes.no)) * 100 : 50}%` }}
                            />
                            <div 
                              className="bg-red-500 h-full transition-all" 
                              style={{ width: `${pred.communityVotes ? (pred.communityVotes.no / (pred.communityVotes.yes + pred.communityVotes.no)) * 100 : 50}%` }}
                            />
                          </div>
                          <span className="text-emerald-400 font-bold text-[11px]">
                            {Math.round((pred.communityVotes?.yes / (pred.communityVotes?.yes + pred.communityVotes?.no)) * 100)}% SI
                          </span>
                          
                          <div className="flex items-center gap-1 ml-2">
                            <button onClick={() => handleVote(pred.id, 'yes')} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 text-[10px] font-bold">Si</button>
                            <button onClick={() => handleVote(pred.id, 'no')} className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-[10px] font-bold">No</button>
                          </div>
                        </div>

                        {/* Social Actions (Single-like constraint + Copy Share Link) */}
                        <div className="flex items-center gap-4 text-slate-400">
                          <button 
                            onClick={() => handleLike(pred.id)} 
                            className={`flex items-center gap-1.5 transition-colors ${
                              isUserLiked ? 'text-red-500 font-bold' : 'hover:text-amber-400'
                            }`}
                            title={isUserLiked ? 'Hai già messo Like (clicca per rimuovere)' : 'Metti Like'}
                          >
                            <Heart className={`w-4 h-4 ${isUserLiked ? 'fill-current text-red-500' : ''}`} />
                            <span>{pred.likes}</span>
                          </button>
                          <button 
                            onClick={() => setOpenCommentsPredId(openCommentsPredId === pred.id ? null : pred.id)}
                            className={`flex items-center gap-1.5 transition-colors ${openCommentsPredId === pred.id ? 'text-amber-400 font-bold' : 'hover:text-white'}`}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{pred.commentsCount || 0}</span>
                          </button>
                          <button 
                            onClick={() => handleShare(pred)}
                            className="flex items-center gap-1.5 hover:text-white transition-colors relative"
                            title="Condividi intenzione"
                          >
                            <Share2 className="w-4 h-4" />
                            {copiedPredId === pred.id && (
                              <span className="absolute -top-7 right-0 bg-amber-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded shadow">
                                Copiato!
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* COMMENTS SECTION */}
                      {openCommentsPredId === pred.id && (
                        <div className="pt-3 border-t border-slate-800/80 space-y-3 bg-[#0E1117] p-3 rounded-xl">
                          <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                            Commenti ({pred.comments?.length || 0})
                          </h5>

                          {/* List of comments */}
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {(!pred.comments || pred.comments.length === 0) ? (
                              <p className="text-[11px] text-slate-500 italic">Nessun commento ancora. Sii il primo a commentare!</p>
                            ) : (
                              pred.comments.map(c => (
                                <div key={c.id} className="flex items-start gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                  <img src={c.author.avatar} alt={c.author.username} className="w-6 h-6 rounded-full object-cover border border-slate-700 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-white text-[11px]">@{c.author.username}</span>
                                      <span className="text-[9px] text-slate-500 font-mono">{c.timestamp}</span>
                                    </div>
                                    <p className="text-slate-300 mt-0.5 leading-relaxed">{c.text}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Comment Input Box */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Scrivi un commento..."
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(pred.id); }}
                              className="flex-1 bg-[#12161F] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                            <button
                              onClick={() => handleAddComment(pred.id)}
                              className="p-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:brightness-110 transition-all text-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Hash Immutability Timestamp Footer */}
                      <div className="text-[10px] font-mono text-slate-600 flex items-center justify-between pt-1">
                        <span>Hash Proof: {pred.hash}</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <ShieldCheck className="w-3 h-3 text-amber-500/80" /> Registro Immutabile
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* --- VIEW: LEADERBOARDS --- */}
        {activeTab === 'leaderboards' && !viewingProfile && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <Trophy className="w-7 h-7 text-amber-400" /> Classifica Profeti ITY
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Lo status e la reputazione pubblica basata sul Proof Score e la precisione delle previsioni avverate.
              </p>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-[#12161F] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 bg-[#181D29] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span>Posizione & Utente</span>
                <div className="flex items-center gap-6">
                  <span>Previsioni</span>
                  <span>Accuratezza</span>
                  <span>Proof Score</span>
                </div>
              </div>

              <div className="divide-y divide-slate-800/60">
                {prophets.sort((a,b) => b.proofScore - a.proofScore).map((p, idx) => (
                  <div 
                    key={p.id}
                    onClick={() => setViewingProfile(p)}
                    className="p-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20' :
                        idx === 1 ? 'bg-slate-300 text-slate-950' :
                        idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <img src={p.avatar} alt={p.username} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                      <div>
                        <p className="font-bold text-white text-sm hover:underline">@{p.username}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{p.bio}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">{p.verifiedCount}</span>
                        <span className="text-slate-500">/{p.totalCount}</span>
                      </div>
                      <div className="text-slate-300 font-semibold">
                        {p.accuracy}%
                      </div>
                      <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs">
                        {p.proofScore} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: USER PROFILE --- */}
        {(activeTab === 'profile' || viewingProfile) && (
          <div className="space-y-6">
            {/* Back button if viewing someone else */}
            {viewingProfile && viewingProfile.id !== currentUser.id && (
              <button 
                onClick={() => setViewingProfile(null)}
                className="text-xs text-amber-400 flex items-center gap-1 font-semibold hover:underline"
              >
                ← Torna al Feed
              </button>
            )}

            {/* Profile Card Header */}
            {(() => {
              const u = viewingProfile || currentUser;
              const isOwnProfile = u.id === currentUser.id;

              return (
                <div className="bg-[#12161F] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-0"></div>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
                    <img 
                      src={u.avatar} 
                      alt={u.username} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-amber-400 shadow-xl"
                    />
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h2 className="text-2xl font-black text-white">@{u.username}</h2>
                          <p className="text-xs text-slate-400">{u.name}</p>
                        </div>
                        <div className="flex items-center justify-center sm:justify-end gap-2">
                          {isOwnProfile && (
                            <button
                              onClick={handleOpenEditProfile}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs transition-all flex items-center gap-1.5"
                            >
                              Modifica Profilo
                            </button>
                          )}
                          <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-400 font-bold text-sm shadow-sm">
                            <Award className="w-4 h-4" /> Proof Score: {u.proofScore}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm max-w-xl">{u.bio || 'Nessuna biografia inserita.'}</p>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">Pubblicate</span>
                          <span className="text-white font-black text-base">{u.totalCount}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">Avverate</span>
                          <span className="text-emerald-400 font-black text-base">{u.verifiedCount}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center">
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">Accuratezza</span>
                          <span className="text-amber-400 font-black text-base">{u.accuracy}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Predictions by this user */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Storico Intuizioni</h3>
              {predictions.filter(p => p.authorId === (viewingProfile?.id || currentUser.id)).map(pred => (
                <div key={pred.id} className="bg-[#12161F] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-bold uppercase">"IO L'AVEVO DETTO..."</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pred.status === 'VERIFIED_TRUE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {pred.status}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-sm">{pred.title}</h4>
                  <p className="text-slate-300 text-xs">{pred.predictionText}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Timestamp: {pred.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: NOTIFICATIONS --- */}
        {activeTab === 'notifications' && !viewingProfile && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <Bell className="w-7 h-7 text-amber-400" /> Notifiche di Sistema
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Aggiornamenti sulle tue previsioni, esiti delle verifiche e interazioni sociali.
              </p>
            </div>

            <div className="bg-[#12161F] border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden shadow-lg">
              {notifications.map(n => (
                <div key={n.id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${n.read ? 'bg-transparent' : 'bg-amber-500/5'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{n.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{n.body}</p>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">{n.time}</span>
                    </div>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-2"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12161F] border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" /> Modifica Profilo Profeta
              </h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Username Profeta (@username)</label>
                <input
                  type="text"
                  value={editProfileForm.username}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, username: e.target.value })}
                  placeholder="Es. Nostradamus_2026"
                  className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Avatar Mostriciattolo o URL Foto Reale</label>
                <input
                  type="url"
                  value={editProfileForm.avatar}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, avatar: e.target.value })}
                  placeholder="Incolla URL o seleziona un mostriciattolo sotto..."
                  className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  required
                />

                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] text-amber-400 font-bold block">Mostriciattoli & Personaggi Disponibili:</span>
                  <div className="flex items-center gap-3 overflow-x-auto py-2 px-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Mostriciattolo ${idx}`}
                        onClick={() => setEditProfileForm({ ...editProfileForm, avatar: url })}
                        className={`w-12 h-12 rounded-2xl object-cover cursor-pointer border-2 transition-all bg-slate-900 shadow-md ${
                          editProfileForm.avatar === url ? 'border-amber-400 scale-110 ring-2 ring-amber-400/50' : 'border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Biografia Profetica</label>
                <textarea
                  value={editProfileForm.bio}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, bio: e.target.value })}
                  placeholder="Scrivi una breve descrizione della tua esperienza e intuizioni..."
                  className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 h-20 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PREDICTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12161F] border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" /> Nuova Previsione Immutabile
              </h3>
              <button onClick={() => { setShowCreateModal(false); setPolicyError(''); }} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            {policyError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{policyError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* AUTOMATIC CATEGORY INDICATOR */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Assegnazione Categoria Automatica:</span>
                  <span className="text-amber-400 font-black text-xs uppercase tracking-wider">{detectedCategory}</span>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                  Rilevata dal Motore ITY
                </span>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Titolo Previsione</label>
                <input
                  type="text"
                  placeholder="Es. Vincitore Champions League 2026"
                  value={newPredData.title}
                  onChange={(e) => {
                    setNewPredData({ ...newPredData, title: e.target.value });
                    setDetectedCategory(detectCategoryFromText(`${e.target.value} ${newPredData.predictionText}`));
                  }}
                  className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Affermazione ("Io l'avevo detto...")</label>
                <textarea
                  placeholder="Descrivi la tua intuizione in modo preciso..."
                  value={newPredData.predictionText}
                  onChange={handlePredictionTextChange}
                  className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 h-20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Livello di Verifica</label>
                  <select
                    value={newPredData.verificationType}
                    onChange={(e) => setNewPredData({ ...newPredData, verificationType: e.target.value })}
                    className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="LEVEL_1">Livello 1: Dati Oggettivi / API</option>
                    <option value="LEVEL_2">Livello 2: Target Metrico</option>
                    <option value="LEVEL_3">Livello 3: Votazione Community</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Data di Scadenza Minima</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={newPredData.deadline}
                    onChange={(e) => setNewPredData({ ...newPredData, deadline: e.target.value })}
                    className="w-full bg-[#0E1117] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic">
                *La previsione verrà pubblicata con timestamp immutabile e categorizzata in modo automatico dal server. Il sistema monitorerà continuamente le fonti ufficiali in background.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setPolicyError(''); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
                >
                  Pubblica Previsione
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0E1117] border-t border-slate-800 flex items-center justify-around py-2.5 z-40">
        <button 
          onClick={() => { setActiveTab('explore'); setSelectedCategory(null); setViewingProfile(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'explore' && !viewingProfile ? 'text-amber-400' : 'text-slate-500'}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] font-bold">Esplora</span>
        </button>

        <button 
          onClick={() => { setActiveTab('leaderboards'); setViewingProfile(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'leaderboards' ? 'text-amber-400' : 'text-slate-500'}`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[9px] font-bold">Classifiche</span>
        </button>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex flex-col items-center gap-1 text-amber-400"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-[9px] font-bold">Pubblica</span>
        </button>

        <button 
          onClick={() => { setActiveTab('notifications'); setViewingProfile(null); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'notifications' ? 'text-amber-400' : 'text-slate-500'}`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[9px] font-bold">Notifiche</span>
        </button>

        <button 
          onClick={() => { setActiveTab('profile'); setViewingProfile(currentUser); }}
          className={`flex flex-col items-center gap-1 ${activeTab === 'profile' && !viewingProfile ? 'text-amber-400' : 'text-slate-500'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold">Profilo</span>
        </button>
      </nav>

    </div>
  );
}