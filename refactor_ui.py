import sys
import re

def process_file():
    with open('src/App.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. State addition
    content = content.replace(
        '  const [newMessage, setNewMessage] = useState("");\n',
        '  const [newMessage, setNewMessage] = useState("");\n  const [searchTerm, setSearchTerm] = useState("");\n'
    )
    
    # 2. Limit 5000
    content = content.replace('.limit(500);', '.limit(5000);')
    
    # 3. Duplicate issue & template fix
    remove_block = """    const tempMsg = {
      id: Math.random().toString(),
      client_phone: activeContact,
      body: newMessage,
      direction: 'outgoing',
      message_type: 'text',
      created_at: new Date().toISOString()
    };
    
    setMessages([tempMsg, ...messages]);
    setNewMessage("");
    setShowTemplates(false);

    // Save to local Supabase Database
    await supabase.from('ng_whatsapp_messages').insert([{
      client_phone: activeContact,
      body: tempMsg.body,"""
      
    replace_block = """    setNewMessage("");
    setShowTemplates(false);

    // Save to local Supabase Database
    await supabase.from('ng_whatsapp_messages').insert([{
      client_phone: activeContact,
      body: newMessage,"""
      
    content = content.replace(remove_block, replace_block)
    
    # 4. Search Filter
    old_conversations = """    };
  });

  const activeMessages = messages.filter(m => m.client_phone === activeContact).reverse();"""
    new_conversations = """    };
  }).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(c.phone).includes(searchTerm)
  );

  const formatMessageBody = (text) => {
    if (!text) return null;
    let formatted = text;
    if (!formatted.includes('\\n') && formatted.match(/(♦|🟢|📍|📌|✅|⚠️|👉|- |• )/)) {
      formatted = formatted.replace(/(♦|🟢|📍|📌|✅|⚠️|👉|- |• )/g, '\\n$1');
    }
    return formatted.trim();
  };

  const activeMessages = messages.filter(m => m.client_phone === activeContact).reverse();"""
  
    content = content.replace(old_conversations, new_conversations)
    
    # 5. Search bar UI updates
    old_search = """<input type="text" placeholder="Buscar conversación..." className="bg-transparent border-none outline-none text-[13px] w-full text-slate-700" />"""
    new_search = """<input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar conversación..." className="bg-transparent border-none outline-none text-[13px] w-full text-white" />"""
    content = content.replace(old_search, new_search)

    # 6. Apply Ultra-Dark Style Design Token 
    # Let's replace the colors in the Messenger component.
    # Note: Regex to replace classes could be tricky, let's replace exact strings inside Messenger.
    # Container
    content = content.replace("h-screen bg-slate-100 flex overflow-hidden", "h-screen bg-[#000000] flex overflow-hidden text-white")
    content = content.replace("w-[340px] bg-white border-r border-slate-200", "w-[340px] bg-[#0A0A0A] border-r border-white/10")
    content = content.replace("p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50", "p-4 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-md")
    content = content.replace("text-lg font-bold text-slate-800", "text-lg font-bold text-white")
    content = content.replace("bg-red-500 text-white", "bg-[#00FF88] text-black")
    content = content.replace("text-slate-400 hover:text-slate-600", "text-[#9CA3AF] hover:text-white")
    content = content.replace("p-3 border-b border-slate-100", "p-3 border-b border-white/5")
    content = content.replace("bg-slate-100 rounded-lg flex items-center px-3 py-2 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400", "bg-white/5 rounded-lg flex items-center px-3 py-2 border border-white/10 focus-within:ring-1 focus-within:ring-[#00FF88] focus-within:border-[#00FF88] transition-all")
    content = content.replace("text-slate-400 mr-2 shrink-0", "text-[#9CA3AF] mr-2 shrink-0")
    
    # Active/Inactive sidebar items
    content = content.replace("border-b border-slate-50 transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-slate-50'}", "border-b border-white/5 transition-colors ${isActive ? 'bg-white/5 border-l-2 border-l-[#00FF88]' : 'hover:bg-white/5'}")
    content = content.replace("isActive ? 'text-blue-800' : 'text-slate-800'", "isActive ? 'text-white' : 'text-[#9CA3AF]'")
    content = content.replace("text-slate-400 font-medium", "text-[#9CA3AF] font-medium")
    content = content.replace("isActive ? 'text-blue-600 font-medium' : 'text-slate-500'", "isActive ? 'text-[#00FF88] font-medium' : 'text-[#9CA3AF]'")
    content = content.replace("bg-green-100 text-green-700", "bg-[#00FF88]/20 text-[#00FF88]")
    
    # Empty states
    content = content.replace("text-center text-xs text-slate-400 p-4", "text-center text-xs text-[#9CA3AF] p-4")
    
    # Chat surface
    content = content.replace("flex-1 flex flex-col bg-[#E5EAEF] relative", "flex-1 flex flex-col bg-black relative")
    content = content.replace("radial-gradient(circle at center, #bfdbfe 0%, transparent 100%)", "radial-gradient(circle at center, rgba(30,58,138,0.2) 0%, rgba(6,95,70,0.15) 100%)")
    
    # Chat Topbar
    content = content.replace("h-16 bg-white border-b border-slate-200", "h-16 bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm relative")
    content = content.replace("text-[14px] font-bold text-slate-800 border-b border-blue-400 focus:outline-none bg-slate-50", "text-[14px] font-bold text-white border-b border-[#00FF88] focus:outline-none bg-transparent")
    content = content.replace("text-[15px] font-bold text-slate-800", "text-[15px] font-bold text-white")
    content = content.replace("text-slate-400 ml-2 font-normal text-xs bg-slate-100", "text-[#9CA3AF] ml-2 font-normal text-xs bg-white/5 border border-white/10")
    content = content.replace("text-[11px] text-blue-500 font-medium", "text-[11px] text-[#00D1FF] font-medium")
    content = content.replace("bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-colors flex items-center border border-purple-200", "bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-colors flex items-center border border-indigo-500/30")
    content = content.replace("bg-slate-100/80 px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-500 shadow-sm border border-slate-200", "bg-white/5 px-4 py-1.5 rounded-full text-[11px] font-bold text-[#9CA3AF] shadow-sm border border-white/10")
    
    # Message bubbles
    old_incoming = "'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'"
    new_incoming = "'bg-white/5 border border-white/10 text-white rounded-tl-sm backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)]'"
    content = content.replace(old_incoming, new_incoming)
    
    old_outgoing = "'bg-blue-600 text-white rounded-tr-sm'"
    new_outgoing = "'bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] rounded-tr-sm backdrop-blur-md shadow-[0_0_15px_rgba(0,255,136,0.05)]'"
    content = content.replace(old_outgoing, new_outgoing)
    
    # Apply formatMessageBody 
    content = content.replace(
        '<p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.body}</p>',
        '<p className="text-[14px] leading-loose whitespace-pre-wrap font-medium">{formatMessageBody(msg.body)}</p>'
    )
    
    content = content.replace("text-blue-200", "text-[#00FF88]/70")

    # Bottom bar (Input)
    content = content.replace("bg-white p-4 shrink-0 flex items-center shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.05)] border-t border-slate-200", "bg-black/90 backdrop-blur-xl p-4 shrink-0 flex items-center shadow-lg border-t border-white/10")
    content = content.replace("w-full bg-slate-100 border border-transparent rounded-full px-5 py-3 text-[14px] text-slate-800 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner", "w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-[14px] text-white focus:outline-none focus:bg-white/10 focus:border-[#00FF88] transition-all shadow-inner")
    content = content.replace("w-12 h-12 bg-green-500 hover:bg-green-600", "w-12 h-12 bg-[#00FF88] hover:bg-[#00E57A]")
    
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Done rewriting UI theme and fixing issues.")

process_file()
