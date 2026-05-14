import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom';
import {
  ref,
  push,
  onValue,
  remove,
  serverTimestamp
} from "firebase/database";
import { database } from "./firebase";
import {
  Send, Lock, Terminal,
  HelpCircle, Search, ArrowLeft,
  Trash2, Plus
} from 'lucide-react';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // URL params वरून room detect करा
  const searchParams = new URLSearchParams(location.search);
  const roomParam = searchParams.get('room'); // '1' or '2'

  const [showSecretAuth, setShowSecretAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastLoggedMessageCount = useRef(0);

  // Room config
  const roomConfig = roomParam === '2'
    ? { firebasePath: 'messages/room2', users: { 'Dora@123': 'Dora', 'Babdi@123': 'Babdi' }, label: 'CHANNEL_2', isRoom2: true }
    : { firebasePath: 'messages/room1', users: { 'kitcat@123': 'kitcat', 'pagal@123': 'pagal' }, label: 'CHANNEL_1', isRoom2: false };

  // Auto show auth जेव्हा room param असेल
  useEffect(() => {
    if (roomParam && !user) {
      setShowSecretAuth(true);
    }
  }, [roomParam]);

  // Chat listener
  useEffect(() => {
    if (!user) return;
    const messagesRef = ref(database, roomConfig.firebasePath);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, [user, roomConfig.firebasePath]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Unread count
  useEffect(() => {
    if (messages.length > lastLoggedMessageCount.current) {
      if (lastLoggedMessageCount.current > 0) {
        const added = messages.slice(lastLoggedMessageCount.current);
        const incoming = added.filter(m => m.senderId !== user).length;
        if (incoming > 0) setUnreadCount(prev => prev + incoming);
      }
    }
    lastLoggedMessageCount.current = messages.length;
  }, [messages, user]);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    const matchedUser = roomConfig.users[password];
    if (matchedUser) {
      setUser(matchedUser);
      setError("");
      setShowSecretAuth(false);
    } else {
      setError("Authorization denied. Invalid access key.");
    }
    setPassword("");
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;
    await push(ref(database, roomConfig.firebasePath), {
      text: inputText,
      senderId: user,
      timestamp: serverTimestamp()
    });
    setInputText("");
  };

  const clearAllMessages = async () => {
    if (window.confirm("Purge all data from this console? This cannot be undone.")) {
      await remove(ref(database, roomConfig.firebasePath));
      setUnreadCount(0);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  // ── AUTH MODAL ──────────────────────────────────────────────────
  if (showSecretAuth && !user) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 relative text-center">
          <button
            onClick={() => { setShowSecretAuth(false); setError(""); }}
            className="absolute top-8 right-8 text-slate-200 hover:text-slate-900 text-xl"
          >✕</button>
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase mb-2">Initialize Auth</h2>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em] mb-2">Verification Tunnel v2.4</p>
          <p className="text-[9px] font-bold mb-8 text-emerald-500">
            [{roomConfig.isRoom2 ? 'CHANNEL_2 // Dora & Babdi' : 'CHANNEL_1 // kitkat & Rohit'}]
          </p>
          {error && <p className="text-red-400 text-[10px] font-mono mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ACCESS_KEY"
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-6 py-4 outline-none focus:border-slate-900 transition-all text-center font-mono font-bold tracking-[0.3em]"
            />
            <button className="w-full bg-slate-900 text-white font-mono font-bold py-4 rounded-xl hover:bg-slate-800 transition-all text-xs uppercase tracking-widest">
              Connect
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── CHAT SCREEN ─────────────────────────────────────────────────
  if (user) {
    return (
      <div className="flex flex-col fixed inset-0 bg-white text-slate-900 antialiased overflow-hidden z-50 font-mono text-xs leading-relaxed">
        {/* Header */}
        <header className="bg-slate-50/50 backdrop-blur-md border-b border-slate-100 py-3 px-6 fixed top-0 w-full z-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => { setUser(null); setMessages([]); setUnreadCount(0); }} className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <span className="font-bold text-slate-800 tracking-tight uppercase">
              Live_Console_Session.sh <span className="text-slate-300 font-normal ml-2">[{user}]</span>
            </span>
            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-500">
              {roomConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={clearAllMessages} className="group flex items-center gap-2 text-slate-300 hover:text-red-400 transition-all" title="Purge Console Data">
              <Trash2 className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest hidden group-hover:inline opacity-0 group-hover:opacity-100 transition-all">Purge_Data</span>
            </button>
            {unreadCount > 0 && (
              <div onClick={() => setUnreadCount(0)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 cursor-pointer animate-bounce hover:bg-emerald-100 transition-all font-mono">
                <Plus className="w-3 h-3 font-bold" />
                <span className="text-[10px] font-black tracking-tighter">{unreadCount} MSG_INBOUND</span>
              </div>
            )}
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-slate-100 rounded-full" />
              <div className="w-2.5 h-2.5 bg-slate-100 rounded-full" />
              <div className="w-2.5 h-2.5 bg-emerald-400/50 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-hidden grid lg:grid-cols-[1fr_320px] pt-16 pb-24 bg-white">
          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-2 items-start selection:bg-slate-900 selection:text-white border-r border-slate-50/50">
            <div className="text-[10px] text-slate-200 mb-8 border-l border-slate-50 pl-4 font-bold uppercase italic tracking-[0.2em] opacity-[0.03] hover:opacity-100 transition-opacity duration-1000">
              [SYS] Kernel handshake success... <br />
              [SYS] Tunnel protocol established. <br />
              [SYS] Buffer encryption active.
            </div>
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col w-full py-0.5 group transition-all">
                <div className="flex items-baseline gap-4">
                  <span className="whitespace-nowrap text-[9px] font-bold select-none transition-all duration-500 text-slate-300 group-hover:text-slate-500">
                    [{formatTime(msg.timestamp)}]
                  </span>
                  <span className={`font-semibold uppercase text-[10px] tracking-tight select-none transition-all duration-500 opacity-[0.05] group-hover:opacity-100 ${msg.senderId === user ? 'text-slate-600' : 'text-slate-500'}`}>
                    [{msg.senderId}]:
                  </span>
                  <span className={`flex-1 break-words font-medium transition-all duration-700 opacity-[0.02] group-hover:opacity-100 text-slate-500 ${msg.senderId === user ? 'border-l border-slate-50 pl-2' : ''}`}>
                    {msg.text}
                  </span>
                </div>
              </div>
            ))}
            <div ref={scrollRef} className="h-8" />
          </div>

          {/* Side Panel */}
          <aside className="hidden lg:flex flex-col bg-slate-50/50 p-0 overflow-hidden border-l border-slate-100 font-mono shadow-sm">
            <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">SYMBOLS_STREAM.JS</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-[10px] leading-relaxed selection:bg-slate-200">
              <div className="space-y-1 opacity-60">
                <div className="text-slate-400 italic">// INITIALIZING_VAULT_SOURCE</div>
                <div><span className="text-pink-500 font-bold">const</span> <span className="text-slate-800">kernel</span> = <span className="text-emerald-600">"v2.04"</span>;</div>
                <div className="h-2" />
                <div><span className="text-blue-600 font-bold">&lt;!DOCTYPE html&gt;</span></div>
                <div><span className="text-blue-600 font-bold">&lt;html</span> <span className="text-emerald-600">lang</span>=<span className="text-pink-500">"en"</span><span className="text-blue-600 font-bold">&gt;</span></div>
                <div className="pl-4 text-blue-600">&lt;head&gt;</div>
                <div className="pl-8 text-blue-600">&lt;title&gt;<span className="text-slate-700 font-bold">StackProtocol_Vault</span>&lt;/title&gt;</div>
                <div className="pl-4 text-blue-600">&lt;/head&gt;</div>
                <div><span className="text-blue-600">&lt;/html&gt;</span></div>
              </div>
              <div className="mt-12 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black text-slate-300 tracking-[0.2em] uppercase">Security_Auth</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[9px] text-slate-400 font-bold tracking-tight italic">// HANDSHAKE_SUCCESSFUL</div>
                <div className="text-[9px] font-bold mt-1 text-emerald-500">[{roomConfig.label}] ACTIVE</div>
              </div>
            </div>
          </aside>
        </div>

        {/* Input */}
        <footer className="fixed bottom-0 w-full p-4 bg-white/80 backdrop-blur-lg border-t border-slate-50">
          <form onSubmit={sendMessage} className="max-w-6xl mx-auto flex items-center gap-3 bg-slate-50/50 border border-slate-100 p-1.5 rounded-xl pl-5 focus-within:border-slate-200 transition-all">
            <span className="text-slate-900 opacity-[0.02] font-medium tracking-tighter select-none">$</span>
            <input
              type="text"
              value={inputText}
              autoFocus
              onFocus={() => setUnreadCount(0)}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="INJECT_DATA..."
              className="flex-1 bg-transparent py-3 outline-none text-slate-400 opacity-[0.03] focus:opacity-100 hover:opacity-20 text-sm font-medium tracking-tight placeholder:text-slate-100 transition-all duration-500"
            />
            <button type="submit" disabled={!inputText.trim()} className="bg-slate-900/10 hover:bg-slate-900 text-slate-300 hover:text-white p-3 rounded-lg transition-all disabled:opacity-0 active:scale-95">
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-[9px] text-center mt-3 text-slate-200 font-bold uppercase tracking-[0.4em] opacity-30 select-none">StackProtocol // Kernel-v2.04</div>
        </footer>
      </div>
    );
  }

  // ── HOME PAGE ────────────────────────────────────────────────────
  const Branding = () => (
    <div className="flex items-center gap-2">
      <div
        className="bg-slate-900 p-1.5 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={() => window.open(`${window.location.origin}?room=1`, '_blank')}
        title="kitkat & Rohit — Channel 1"
      >
        <Terminal className="w-4 h-4 text-emerald-400" />
      </div>
      <Link to="/" className="font-mono font-bold text-lg tracking-tight text-slate-800 uppercase hover:opacity-80 transition-opacity">
        Stack<span className="text-slate-400 font-medium">Protocol</span>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-12 py-5 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <Branding />
        <div className="hidden lg:flex items-center gap-10 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
          <Link to="/environment" className="hover:text-slate-900 transition-all">_environment</Link>
          <Link to="/deployment" className="hover:text-slate-900 transition-all">_deployment</Link>
          <Link to="/security" className="hover:text-slate-900 transition-all">_security_api</Link>
          <Link to="/releases" className="hover:text-slate-900 transition-all">_release_log</Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-lg text-slate-300 w-48 font-mono text-[10px]">
            <Search className="w-3 h-3 mr-2" /> <span>FIND_SYMBOL...</span>
          </div>
          {/* Icon 2 → Room 2 (Dora & Babdi) */}
          <div
            onClick={() => window.open(`${window.location.origin}?room=2`, '_blank')}
            className="p-2.5 rounded-xl text-slate-300 hover:text-slate-900 cursor-pointer transition-all"
            title="Dora & Babdi — Channel 2"
          >
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-20 grid lg:grid-cols-[1fr_300px] gap-20">
        <section className="space-y-16">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 leading-[0.9] tracking-tight">
              DECENTRALIZED<br />ARCHITECTURE<br /><span className="text-slate-200">PROTOCOL.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl font-medium leading-relaxed">
              Low-latency networking layer for high-availability clusters and secure distributed systems. Engineered for minimum footprint and maximum integrity.
            </p>
            <div className="flex gap-4">
              <button className="bg-slate-900 text-white px-8 py-4 rounded-lg font-bold text-sm">GET_STARTED</button>
              <button className="border border-slate-200 text-slate-900 px-8 py-4 rounded-lg font-bold text-sm">VIEW_DOCS</button>
            </div>
          </div>
        </section>
        <aside className="hidden lg:block space-y-12">
          <div className="space-y-6">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-300">SYMBOLS_INDEX</h4>
            <ul className="space-y-3 text-[11px] font-bold text-slate-500 uppercase">
              <li className="text-slate-900 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> CORE_CONCEPTS</li>
              <li className="hover:text-slate-950 cursor-pointer transition-all pl-3.5">MEMORY_MANAGEMENT</li>
              <li className="hover:text-slate-950 cursor-pointer transition-all pl-3.5">SOCKET_PROTOCOL</li>
              <li className="hover:text-slate-950 cursor-pointer transition-all pl-3.5">NETWORK_SYNC</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/*" element={<AppContent />} />
    </Routes>
  </Router>
);

export default App;
