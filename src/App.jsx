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
  Send, Lock, MessageSquare, CheckCheck, Clock, 
  BookOpen, Code, Terminal, Layers, Globe, ShieldCheck, 
  HelpCircle, ChevronRight, Settings, Search, ArrowLeft,
  FileText, Cpu, Database, Layout, Command, Share2, User, Trash2
} from 'lucide-react';

const AppContent = () => {
  const [showSecretAuth, setShowSecretAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // लॉगिन सिस्टम
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Babdi@123") {
      setUser("Babdi");
      setError("");
      setShowSecretAuth(false);
    } else if (password === "Dora@123") {
      setUser("Dora");
      setError("");
      setShowSecretAuth(false);
    } else {
      setError("Authorization denied. Invalid access key.");
    }
    setPassword("");
  };

  // चॅट लिसनर
  useEffect(() => {
    if (!user) return;
    const messagesRef = ref(database, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputText.trim() === "") return;
    await push(ref(database, 'messages'), {
      text: inputText,
      senderId: user,
      timestamp: serverTimestamp()
    });
    setInputText("");
  };

  const clearAllMessages = async () => {
    if (window.confirm("Purge all data from this console? This cannot be undone.")) {
      await remove(ref(database, 'messages'));
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  };

  // Branding Component
  const Branding = () => (
    <div className="flex items-center gap-2">
      <div className="bg-slate-900 p-1.5 rounded-lg"><Terminal className="w-4 h-4 text-emerald-400" /></div>
      <span className="font-mono font-black text-lg tracking-tighter text-slate-800 uppercase">
        Stack<span className="text-slate-400">Protocol</span>
      </span>
    </div>
  );

  // Header Component
  const Header = () => (
    <header className="bg-white border-b border-slate-200 px-4 md:px-12 py-5 sticky top-0 z-40 flex items-center justify-between shadow-sm">
      <Link to="/"><Branding /></Link>
      <div className="hidden lg:flex items-center gap-10 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
        <Link to="/environment" className={`hover:text-slate-900 transition-all ${location.pathname === '/environment' ? 'text-slate-900 underline' : ''}`}>_environment</Link>
        <Link to="/deployment" className={`hover:text-slate-900 transition-all ${location.pathname === '/deployment' ? 'text-slate-900 underline' : ''}`}>_deployment</Link>
        <Link to="/security" className={`hover:text-slate-900 transition-all ${location.pathname === '/security' ? 'text-slate-900 underline' : ''}`}>_security_api</Link>
        <Link to="/releases" className={`hover:text-slate-900 transition-all ${location.pathname === '/releases' ? 'text-slate-900 underline' : ''}`}>_release_log</Link>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-lg text-slate-300 w-48 font-mono text-[10px]">
          <Search className="w-3 h-3 mr-2" /> <span>FIND_SYMBOL...</span>
        </div>
        <div onClick={() => setShowSecretAuth(true)} className="p-2.5 rounded-xl text-slate-300 hover:text-slate-900 cursor-pointer transition-all">
          <HelpCircle className="w-5 h-5" />
        </div>
      </div>
    </header>
  );

  const Home = () => (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-20 grid lg:grid-cols-[1fr_300px] gap-20">
        <section className="space-y-16">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              DECENTRALIZED<br/>ARCHITECTURE<br/><span className="text-slate-200">PROTOCOL.</span>
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
        <Sidebar lgOnly />
      </main>
    </div>
  );

  const DocPage = ({ title, subtitle, content }) => (
    <div className="min-h-screen bg-slate-50 flex flex-col font-mono">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-12 grid lg:grid-cols-[1fr_300px] gap-16">
        <article className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm space-y-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{title}</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">// {subtitle}</p>
          </div>
          <div className="h-px bg-slate-100 w-full" />
          <div className="space-y-6">
            <p className="text-slate-600 leading-relaxed">{content}</p>
            <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px] text-slate-400 whitespace-pre">
{`$ stack-protocol init --env=${title.toLowerCase()}
> Fetching security manifests...
> Verified handshake: [OK]
> System standing by.`}
            </div>
          </div>
        </article>
        <Sidebar />
      </main>
    </div>
  );

  const Sidebar = ({ lgOnly = false }) => (
    <aside className={`${lgOnly ? 'hidden lg:block' : ''} space-y-12`}>
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
  );

  if (showSecretAuth && !user) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 relative text-center">
          <button onClick={() => setShowSecretAuth(false)} className="absolute top-8 right-8 text-slate-200 hover:text-slate-900 text-xl">✕</button>
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
             <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Initialize Auth</h2>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em] mb-10">Verification Tunnel v2.4</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} placeholder="ACCESS_KEY" className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-6 py-4 outline-none focus:border-slate-900 transition-all text-center font-mono font-bold tracking-[0.3em]" />
            <button className="w-full bg-slate-900 text-white font-mono font-black py-4 rounded-xl hover:bg-slate-800 transition-all text-xs uppercase tracking-widest">Connect</button>
          </form>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col fixed inset-0 bg-white text-slate-900 antialiased overflow-hidden z-50 font-mono text-xs leading-relaxed">
        <header className="bg-slate-50 border-b border-slate-100 py-3 px-6 fixed top-0 w-full z-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setUser(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 transition-all"><ArrowLeft className="w-4 h-4" /></button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <span className="font-black text-slate-800 tracking-tighter uppercase transition-opacity hover:opacity-50 cursor-default">
              Live_Console_Session.sh <span className="text-slate-300 font-normal ml-2">[{user}]</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={clearAllMessages}
              className="group flex items-center gap-2 text-slate-300 hover:text-red-500 transition-all"
              title="Purge Console Data"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest hidden group-hover:inline opacity-0 group-hover:opacity-100 transition-all">Purge_Data</span>
            </button>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
              <div className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pt-24 pb-28 flex flex-col gap-1.5 items-start bg-white selection:bg-slate-900 selection:text-white">
          <div className="text-[10px] text-slate-200 mb-12 border-l border-slate-100 pl-4 font-bold uppercase italic tracking-widest opacity-30">
            [SYS] Kernel handshake success... <br />
            [SYS] Tunnel protocol established. <br />
            [SYS] Buffer encryption active.
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col w-full py-0.5 group transition-all">
              <div className="flex items-baseline gap-4">
                <span className={`whitespace-nowrap text-[9px] font-bold select-none ${msg.senderId === 'Babdi' ? 'text-slate-700' : 'text-slate-400'}`}>
                  [{formatTime(msg.timestamp)}]
                </span>
                <span className={`font-black uppercase text-[10px] tracking-tight select-none ${msg.senderId === 'Babdi' ? 'text-slate-700' : 'text-slate-400'}`}>
                  [{msg.senderId}]:
                </span>
                <span className={`flex-1 break-words font-medium transition-all duration-300 
                  ${msg.senderId === 'Babdi' ? 'text-slate-900' : 'text-slate-500'} 
                  hover:text-black active:text-black 
                  ${msg.senderId === user ? 'border-l-2 border-slate-100 pl-2' : ''}`}>
                  {msg.text}
                </span>
              </div>
            </div>
          ))}
          <div ref={scrollRef} className="h-8" />
        </div>

        <footer className="absolute bottom-0 w-full p-4 bg-white border-t border-slate-50">
          <form onSubmit={sendMessage} className="max-w-6xl mx-auto flex items-center gap-3 bg-slate-50 border border-slate-100 p-1.5 rounded-xl pl-5 focus-within:border-slate-300 transition-all">
            <span className="text-slate-200 font-black tracking-tighter">$</span>
            <input type="text" value={inputText} autoFocus onChange={(e) => setInputText(e.target.value)} placeholder="INJECT_DATA..." className="flex-1 bg-transparent py-3 outline-none text-slate-800 text-sm font-bold tracking-tight placeholder:text-slate-200" />
            <button type="submit" disabled={!inputText.trim()} className="bg-slate-900 text-white p-3 rounded-lg transition-all disabled:opacity-10 active:scale-90"><Send className="w-5 h-5" /></button>
          </form>
          <div className="text-[9px] text-center mt-3 text-slate-200 font-bold uppercase tracking-[0.4em] opacity-50">StackProtocol // Kernel-v2.04</div>
        </footer>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/environment" element={<DocPage title="Environment" subtitle="Infras_Setup" content="Multi-cloud node optimization for distributed packets." />} />
      <Route path="/deployment" element={<DocPage title="Deployment" subtitle="CI_Pipeline" content="Blue-green deployment logic for zero-downtime execution." />} />
      <Route path="/security" element={<DocPage title="Security API" subtitle="Enc_Protocols" content="Hardware-level AES encryption with rotational key schemas." />} />
      <Route path="/releases" element={<DocPage title="Release Notes" subtitle="Build_v2.0.4" content="Performance patch for long-running socket buffers." />} />
    </Routes>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
