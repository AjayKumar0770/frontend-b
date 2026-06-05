import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Wifi, WifiOff, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';

interface Message {
  text: string;
  sender: 'A' | 'B';
  timestamp: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Quick preset templates for rapid testing
  const presets = [
    "Hello from Frontend B! 👋",
    "Receiver ready and listening! 🎧",
    "Ping received, sending reply... 🔄",
    "All clear on this end! 📡"
  ];

  useEffect(() => {
    console.log(`Connecting to Socket.io backend at: ${BACKEND_URL}`);
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket.io connected successfully!');
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Socket.io disconnected:', reason);
    });

    newSocket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !socket || !isConnected) return;

    const payload: Message = {
      text: text.trim(),
      sender: 'B',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Emit the message
    socket.emit('send_message', payload);
    setInputText('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/10 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="relative border-b border-slate-900 bg-slate-950/80 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="font-extrabold text-lg text-black">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 to-slate-200 bg-clip-text text-transparent">
                Frontend B <span className="text-xs text-amber-400 font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 ml-2">RECEIVER</span>
              </h1>
              <p className="text-xs text-slate-400">Independent React Client Application</p>
            </div>
          </div>

          {/* Connection Status Indicator */}
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 ${
            isConnected 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/5' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" /> Connected
                </span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5" /> Disconnected
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 relative z-10 overflow-hidden">
        {/* Left Control Panel / Info Column */}
        <div className="w-full md:w-80 flex flex-col gap-5 shrink-0">
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-5 backdrop-blur-sm">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Endpoint Diagnostics</h3>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-500">Target Host:</span>
                <div className="text-slate-300 break-all select-all mt-1 bg-slate-950 p-2 rounded border border-slate-900/60">
                  {BACKEND_URL}
                </div>
              </div>
              <div>
                <span className="text-slate-500">CORS Client Origin:</span>
                <div className="text-amber-400 break-all mt-0.5">
                  {window.location.origin}
                </div>
              </div>
              <div>
                <span className="text-slate-500">WS Protocol:</span>
                <div className="text-emerald-400 mt-0.5">Socket.io WebSocket</div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-5 backdrop-blur-sm">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Presets</h3>
            <div className="flex flex-col gap-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(preset)}
                  disabled={!isConnected}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 hover:bg-amber-950/40 border border-slate-900 hover:border-amber-800/40 text-slate-300 hover:text-amber-200 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-between group"
                >
                  <span className="truncate">{preset}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chat Panel Column */}
        <div className="flex-1 flex flex-col bg-slate-900/20 border border-slate-900/80 rounded-3xl backdrop-blur-sm overflow-hidden h-[600px] shadow-2xl">
          {/* Channel Info Bar */}
          <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold tracking-wide text-slate-200">Real-Time Event Logs</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">{messages.length} messages</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-900">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center mb-3 text-slate-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-400">No events logged yet</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  Send a message below or trigger one from Frontend A to witness instantaneous two-way socket transmission.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender === 'B';
                return (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[75%] transition-all duration-300 ${
                      isMe ? 'ml-auto items-end animate-fade-in-right' : 'mr-auto items-start animate-fade-in-left'
                    }`}
                  >
                    {/* Sender Tag */}
                    <div className="flex items-center gap-1 mb-1.5 px-1">
                      <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                        isMe ? 'text-amber-400' : 'text-indigo-400'
                      }`}>
                        {isMe ? 'Client B (You)' : 'Client A (Sender)'}
                      </span>
                    </div>

                    {/* Bubble Content */}
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                      isMe 
                        ? 'bg-amber-600 text-black rounded-tr-none' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 px-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {msg.timestamp}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleFormSubmit} className="p-4 bg-slate-950/80 border-t border-slate-900 flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isConnected ? "Type a real-time message..." : "Waiting for backend connection..."}
              disabled={!isConnected}
              className="flex-1 px-4 py-3.5 bg-slate-900 border border-slate-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/35 rounded-xl text-sm placeholder:text-slate-600 text-slate-100 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !isConnected}
              className="px-5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-900 text-black disabled:text-slate-700 rounded-xl transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-amber-500/20 disabled:shadow-none outline-none focus:ring-2 focus:ring-amber-500/50 disabled:cursor-not-allowed group"
            >
              <span className="text-sm mr-2 hidden sm:inline">Send</span>
              <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
