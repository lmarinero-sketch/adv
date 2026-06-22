import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, ChevronRight } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';

interface GallitoMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

// Tips proactivos que aparecen periódicamente junto al botón
const GALLITO_TIPS = [
  { text: "🐓 ¡Preguntame cuántos productos hay en stock!", delay: 45000 },
  { text: "📦 Puedo decirte qué marcas tenés cargadas", delay: 90000 },
  { text: "🤖 ¿Sabías que puedo decirte si el bot de WhatsApp está activo?", delay: 150000 },
  { text: "🔍 Consultame por los últimos clientes que escribieron", delay: 210000 },
  { text: "📊 Preguntame sobre el estado del negocio", delay: 270000 },
  { text: "🚗 Puedo buscar eventos por medida o participante", delay: 340000 },
];

export default function GallitoWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GallitoMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [activeTip, setActiveTip] = useState<string | null>(null);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tipTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasNewMessage(false);
      setActiveTip(null); // Ocultar tip cuando se abre
    }
  }, [isOpen]);

  // Sistema de tips proactivos (solo cuando el chat está cerrado)
  useEffect(() => {
    if (isOpen) {
      // Limpiar timers cuando está abierto
      tipTimersRef.current.forEach(t => clearTimeout(t));
      tipTimersRef.current = [];
      return;
    }

    // Programar tips
    const timers = GALLITO_TIPS.map((tip, i) => 
      setTimeout(() => {
        if (!isOpen) {
          setActiveTip(tip.text);
          // Auto-ocultar después de 6s
          setTimeout(() => setActiveTip(prev => prev === tip.text ? null : prev), 6000);
        }
      }, tip.delay)
    );
    tipTimersRef.current = timers;

    return () => timers.forEach(t => clearTimeout(t));
  }, [isOpen]);

  // Welcome message + greeting animation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (!hasOpenedBefore) {
        setShowGreeting(true);
        setHasOpenedBefore(true);
        // Mostrar saludo animado 3s, luego el mensaje
        setTimeout(() => {
          setShowGreeting(false);
          setMessages([{
            role: 'assistant',
            content: '¡Hola! Soy Gallito 🐓, tu asistente del CRM. Puedo ayudarte con consultas de productos, clientes, estado del bot y más. ¿En qué te ayudo?',
            suggestions: ['¿Cuántos productos hay?', '¿El bot está activo?', '¿Últimos clientes?'],
            timestamp: new Date()
          }]);
        }, 3000);
      } else {
        setMessages([{
          role: 'assistant',
          content: '¡Hola de nuevo! ¿En qué te ayudo? 🐓',
          suggestions: ['¿Cuántos productos hay?', '¿El bot está activo?', '¿Últimos clientes?'],
          timestamp: new Date()
        }]);
      }
    }
  }, [isOpen]);

  // Parse actions from response
  const handleActions = useCallback((responseText: string) => {
    const navMatch = responseText.match(/\[ACTION:navigate:(\w+)\]/);
    if (navMatch) {
      const moduleMap: Record<string, string> = {
        whatsapp: '/mensajeria',
        mensajeria: '/mensajeria',
        configuracion: '/configuracion',
        facturas: '/subir',
        clientes: '/clientes',
        seguimientos: '/seguimientos',
        dashboard: '/',
      };
      const path = moduleMap[navMatch[1]] || '/';
      setTimeout(() => navigate(path), 800);
    }
  }, [navigate]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg: GallitoMessage = { role: 'user', content: msgText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const moduleMap: Record<string, string> = {
        '/': 'Dashboard',
        '/mensajeria': 'WhatsApp / Mensajería',
        '/configuracion': 'Configuración',
        '/subir': 'Subir Factura',
        '/clientes': 'Clientes',
        '/seguimientos': 'Seguimientos',
      };

      const conversationHistory = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('gallito', {
        body: {
          message: msgText,
          conversationHistory,
          moduleContext: moduleMap[location.pathname] || 'Desconocido'
        }
      });

      if (error) throw error;

      const response = data?.response || 'No pude procesar tu consulta.';
      const suggestions = data?.suggestions || [];

      const cleanResponse = response
        .replace(/\[ACTION:navigate:\w+\]/g, '')
        .replace(/\[ACTION:confirm:[^\]]+\]/g, '')
        .trim();

      const assistantMsg: GallitoMessage = {
        role: 'assistant',
        content: cleanResponse,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
      handleActions(response);

    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message || 'No se pudo conectar con Gallito'}`,
        timestamp: new Date()
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Proactive Tip Tooltip */}
      {activeTip && !isOpen && (
        <div
          onClick={() => { setActiveTip(null); setIsOpen(true); }}
          style={{
            position: 'fixed',
            bottom: 76,
            right: 20,
            zIndex: 9998,
            maxWidth: 260,
            padding: '12px 16px',
            borderRadius: 16,
            background: 'white',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            animation: 'tipSlideIn 0.4s ease-out',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', lineHeight: 1.5 }}>
            {activeTip}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>
            Clic para hablar conmigo →
          </div>
          {/* Arrow pointing to button */}
          <div style={{
            position: 'absolute',
            bottom: -6,
            right: 24,
            width: 12, height: 12,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderTop: 'none', borderLeft: 'none',
            transform: 'rotate(45deg)',
          }} />
        </div>
      )}

      {/* Floating Button — Gallito Logo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] group"
        style={{
          width: 60, height: 60,
          borderRadius: '50%',
          background: isOpen ? '#334155' : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          border: '3px solid rgba(255,255,255,0.3)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isOpen 
            ? '0 4px 12px rgba(0,0,0,0.3)' 
            : '0 4px 24px rgba(37,99,235,0.5), 0 0 0 4px rgba(37,99,235,0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          padding: 0,
          animation: !isOpen ? 'gallitoBreath 3s ease-in-out infinite' : 'none',
        }}
      >
        {isOpen ? (
          <X size={22} color="white" />
        ) : (
          <>
            <img 
              src="/gallito.jpg" 
              alt="Gallito"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
            {hasNewMessage && (
              <span style={{
                position: 'absolute', top: -2, right: -2,
                width: 14, height: 14, borderRadius: '50%',
                background: '#ef4444', border: '2px solid white',
              }} />
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[9998]"
          style={{
            width: 390, maxHeight: 560,
            borderRadius: 20,
            background: '#fff',
            boxShadow: '0 12px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            animation: 'chatSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.3)',
              flexShrink: 0,
            }}>
              <img 
                src="/gallito.jpg" 
                alt="Gallito"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>Gallito</div>
              <div style={{ 
                color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ 
                  width: 6, height: 6, borderRadius: '50%', 
                  background: '#4ade80', display: 'inline-block',
                }} />
                Asistente IA del CRM
              </div>
            </div>
            <div style={{ marginLeft: 'participante' }}>
              <Sparkles size={16} color="rgba(255,255,255,0.5)" />
            </div>
          </div>

          {/* Greeting Animation or Messages */}
          {showGreeting ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: 24, minHeight: 300,
            }}>
              <img 
                src="/The_cock_is_greeting.gif"
                alt="Gallito saludando"
                style={{
                  width: 180, height: 180,
                  objectFit: 'contain',
                  borderRadius: 16,
                }}
              />
              <div style={{
                marginTop: 16, fontSize: 15, fontWeight: 700,
                color: '#1e40af', textAlign: 'center',
              }}>
                ¡Hola! Soy Gallito 🐓
              </div>
              <div style={{
                marginTop: 6, fontSize: 12, fontWeight: 500,
                color: '#64748b', textAlign: 'center',
              }}>
                Tu asistente inteligente del CRM...
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
                maxHeight: 360, minHeight: 200,
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 12,
                    animation: 'msgFadeIn 0.3s ease-out',
                  }}>
                    {/* Avatar for assistant messages */}
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        overflow: 'hidden', flexShrink: 0, marginRight: 8, marginTop: 2,
                        border: '1.5px solid #e2e8f0',
                      }}>
                        <img src="/gallito.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '78%',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user' 
                        ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' 
                        : '#f1f5f9',
                      color: msg.role === 'user' ? 'white' : '#334155',
                      fontSize: 13,
                      lineHeight: 1.55,
                      fontWeight: 500,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                      
                      {/* Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {msg.suggestions.map((s, j) => (
                            <button
                              key={j}
                              onClick={() => sendMessage(s)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 10,
                                border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.3)' : '1px solid #cbd5e1',
                                background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'white',
                                color: msg.role === 'user' ? 'white' : '#2563eb',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: 6,
                                transition: 'all 0.2s',
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.background = msg.role === 'user' ? 'rgba(255,255,255,0.2)' : '#eff6ff')}
                              onMouseOut={(e) => (e.currentTarget.style.background = msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'white')}
                            >
                              <ChevronRight size={12} />
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      overflow: 'hidden', flexShrink: 0,
                      border: '1.5px solid #e2e8f0',
                    }}>
                      <img src="/gallito.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{
                      padding: '12px 18px', borderRadius: '16px 16px 16px 4px',
                      background: '#f1f5f9', display: 'flex', gap: 4, alignItems: 'center',
                    }}>
                      <span className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animationDelay: '0ms' }} />
                      <span className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animationDelay: '150ms' }} />
                      <span className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex', gap: 8,
                background: '#fafbfc',
              }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Preguntale a Gallito..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #e2e8f0',
                    background: 'white',
                    fontSize: 13,
                    fontWeight: 500,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    width: 40, height: 40,
                    borderRadius: 12,
                    background: input.trim() ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#e2e8f0',
                    border: 'none',
                    cursor: input.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: input.trim() ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                  }}
                >
                  <Send size={16} color={input.trim() ? 'white' : '#94a3b8'} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tipSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gallitoBreath {
          0%, 100% { box-shadow: 0 4px 24px rgba(37,99,235,0.5), 0 0 0 4px rgba(37,99,235,0.08); }
          50% { box-shadow: 0 4px 28px rgba(37,99,235,0.65), 0 0 0 8px rgba(37,99,235,0.12); }
        }
      `}</style>
    </>
  );
}
