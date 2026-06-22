import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of ConfigTemplates
start_idx = content.find('function ConfigTemplates() {')
if start_idx == -1:
    print("Could not find start boundary!")
    exit(1)

# Find the end of ConfigTemplates by looking for the next function SystemModal
end_idx = content.find('const bgClasses = {', start_idx)
if end_idx == -1:
    print("Could not find end boundary!")
    exit(1)
    
# Check imports
if 'Users' not in content[:1000]:
    content = content.replace('  Home,', '  Home,\n  Users,\n  Settings as SettingsIcon,')

new_config_code = """function Configuracion({ isSidebarOpen, userRole }: { isSidebarOpen: boolean, userRole: string | null }) {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState<any>({
    empresa_nombre: 'Neumáticos Gallo',
    empresa_sucursal: 'Mendoza Sur',
    ai_prompt_resumen: 'Sos un asistente que resume el historial de chat con un cliente...',
    seguimiento_dias: '30, 60, 90'
  });

  // Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [newTemplate, setNewTemplate] = useState({ shortcut: '/', name: '', category: 'General', body: '' });

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('ng_settings').select('*');
    if (data && data.length > 0) {
      const merged = { ...settings };
      data.forEach(s => { merged[s.key] = s.value; });
      setSettings(merged);
    }
    setLoading(false);
  };

  const saveSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      await supabase.from('ng_settings').upsert({ key, value }, { onConflict: 'key' });
      setSettings({ ...settings, [key]: value });
    } catch(e) {
      console.error(e);
    }
    setSaving(false);
  };

  const fetchTemplates = async () => {
    const { data } = await supabase.from('ng_templates').select('*').order('created_at', { ascending: false });
    setTemplates(data || []);
  };

  const saveTemplate = async () => {
    const defaultTemplate = {
      shortcut: newTemplate.shortcut.startsWith('/') ? newTemplate.shortcut.toUpperCase() : `/${newTemplate.shortcut.toUpperCase()}`,
      body: newTemplate.body,
      category: newTemplate.category
    };
    await supabase.from('ng_templates').insert([defaultTemplate]);
    fetchTemplates();
    setNewTemplate({ shortcut: '/', name: '', category: 'General', body: '' });
  };

  if (userRole === 'vendedor') {
    return (
      <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center`}>
        <Lock className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Acceso Restringido</h2>
        <p className="text-slate-500 mt-2">No tienes permisos de Administrador para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} min-h-screen bg-[#0A0A0A] flex flex-col`}>
      <TopBar title="Neumáticos Gallo" subtitle="Centro de Control & Configuración" />
      
      <main className="px-10 py-6 w-full flex gap-8">
        {/* Sidebar Nav */}
        <div className="w-[240px] shrink-0 space-y-1">
          <button onClick={() => setActiveTab('general')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'general' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <Settings className="w-4 h-4" /> General e IA
          </button>
          <button onClick={() => setActiveTab('whatsapp')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'whatsapp' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <MessageSquare className="w-4 h-4" /> WhatsApp API
          </button>
          <button onClick={() => setActiveTab('seguimientos')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'seguimientos' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <Clock className="w-4 h-4" /> Seguimientos
          </button>
          <button onClick={() => setActiveTab('plantillas')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'plantillas' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <FileText className="w-4 h-4" /> Plantillas Rápidas
          </button>
          <button onClick={() => setActiveTab('equipo')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'equipo' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <Users className="w-4 h-4" /> Equipo / Permisos
          </button>
          <button onClick={() => setActiveTab('apariencia')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'apariencia' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <Sparkles className="w-4 h-4" /> Apariencia
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          {/* Radial Light */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#065F46]/20 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

          {activeTab === 'general' && (
            <div className="animate-in fade-in space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Datos de Empresa</h3>
                <p className="text-slate-400 text-sm mb-6">Información básica que se usa en resúmenes y encabezados.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre de Fantasía</label>
                    <input type="text" value={settings.empresa_nombre} onChange={e => setSettings({...settings, empresa_nombre: e.target.value})} onBlur={() => saveSetting('empresa_nombre', settings.empresa_nombre)} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sucursal / Ubicación</label>
                    <input type="text" value={settings.empresa_sucursal} onChange={e => setSettings({...settings, empresa_sucursal: e.target.value})} onBlur={() => saveSetting('empresa_sucursal', settings.empresa_sucursal)} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] focus:outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h3 className="text-xl font-bold text-white mb-2">Inteligencia Artificial</h3>
                <p className="text-slate-400 text-sm mb-6">Ajustá las instrucciones (prompt) que la IA usa para resumir el historial de clientes.</p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Prompt de Resumen</label>
                  <textarea rows={4} value={settings.ai_prompt_resumen} onChange={e => setSettings({...settings, ai_prompt_resumen: e.target.value})} onBlur={() => saveSetting('ai_prompt_resumen', settings.ai_prompt_resumen)} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] focus:outline-none transition-all resize-none font-mono" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="animate-in fade-in space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Conexión con BuilderBot</h3>
                <p className="text-slate-400 text-sm mb-6">Estado del proveedor de WhatsApp oficial (Cloud API v2).</p>
                <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#00FF88]/20 flex items-center justify-center border border-[#00FF88]/30">
                      <MessageSquare className="w-6 h-6 text-[#00FF88]" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">API Conectada</h4>
                      <p className="text-slate-400 text-sm font-mono mt-1">Host: app.builderbot.cloud</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold uppercase">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    En línea
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguimientos' && (
            <div className="animate-in fade-in space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Periodos de Seguimiento</h3>
                <p className="text-slate-400 text-sm mb-6">Definí los intervalos rápidos que se sugieren al agendar una alerta.</p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Días Sugeridos (Separados por coma)</label>
                  <input type="text" value={settings.seguimiento_dias} onChange={e => setSettings({...settings, seguimiento_dias: e.target.value})} onBlur={() => saveSetting('seguimiento_dias', settings.seguimiento_dias)} placeholder="Ej: 30, 60, 90" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88] focus:outline-none transition-all" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipo' && (
            <div className="animate-in fade-in space-y-6 text-center py-12">
              <Users className="w-20 h-20 text-slate-800 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Gestión de Perfiles y Roles</h3>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Los usuarios (Vendedores/Admins) se dan de alta directamente a través del panel de Supabase Auth para mantener la integridad criptográfica de las contraseñas.
              </p>
              <div className="mt-8 flex justify-center">
                <a href="https://supabase.com/dashboard/project/_/auth/users" target="_blank" rel="noreferrer" className="bg-[#00FF88] text-black px-6 py-3 rounded-full text-[14px] font-bold hover:bg-[#00E67A] transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.4)]">
                  Ir a Supabase Auth <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div className="animate-in fade-in space-y-6 text-center py-12">
              <Sparkles className="w-20 h-20 text-slate-800 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Diseño Premium</h3>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                El entorno está actualmente configurado en el sistema de diseño <strong>GrowLabs Ultra-Dark</strong> (Premium Powerhouse). Este tema asegura el menor desgaste visual y la máxima concentración operativa.
              </p>
            </div>
          )}

          {activeTab === 'plantillas' && (
            <div className="animate-in fade-in h-max">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white">Plantillas Rápidas</h3>
                  <p className="text-slate-400 text-sm mt-1">Configurá fragmentos que te ahorrarán tiempo de tipear al chatear.</p>
                </div>
                <div className="bg-[#1A1A1A] border border-white/5 rounded-lg px-4 py-2 flex items-center shadow-inner">
                  <span className="text-sm font-medium text-slate-400 mr-4">{templates.length} plantillas</span>
                  <div className="h-6 w-px bg-white/10 mr-4"></div>
                  <Package className="w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-8">
                {/* Formulario Nueva */}
                <div className="col-span-12 lg:col-span-5 relative">
                  <div className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/5 sticky top-6 shadow-xl relative z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                    <h3 className="text-[14px] font-bold text-white mb-5 flex items-center gap-2">
                      <PenLine className="w-4 h-4 text-blue-400" />
                      Crear nueva
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Comando rápido</label>
                        <input type="text" value={newTemplate.shortcut} onChange={e => setNewTemplate({...newTemplate, shortcut: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[14px] font-bold text-blue-400 focus:border-blue-500 focus:outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categoría</label>
                        <select value={newTemplate.category} onChange={e => setNewTemplate({...newTemplate, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-slate-300 focus:border-blue-500 focus:outline-none transition-all">
                          <option>General</option>
                          <option>Seguimiento</option>
                          <option>Ventas</option>
                          <option>Soporte</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mensaje e incrustaciones</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {['nombre', 'productos', 'importe', 'fecha'].map(vr => (
                            <button key={vr} onClick={() => setNewTemplate({...newTemplate, body: newTemplate.body + `{{${vr}}}`})} className="bg-[#0A0A0A] border border-white/10 px-3 py-1.5 rounded-lg text-blue-400 text-[11px] font-bold hover:border-blue-400 hover:bg-blue-900/20 transition-colors">
                              {`{{${vr}}}`}
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={4}
                          value={newTemplate.body}
                          onChange={e => setNewTemplate({...newTemplate, body: e.target.value})}
                          placeholder="Hola {{nombre}}, ¿En qué te puedo ayudar?"
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-slate-300 focus:border-blue-500 focus:outline-none resize-none transition-all"
                        />
                        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-medium">
                          <span>{newTemplate.body.length} caracteres</span>
                          <span>{newTemplate.body.match(/\{\{.+?\}\}/g)?.length || 0} variables</span>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button onClick={saveTemplate} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-[13px] font-bold flex items-center shadow-lg transition-all active:scale-95">
                          <Check className="w-4 h-4 mr-2" /> Guardar Plantilla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista Existentes */}
                <div className="col-span-12 lg:col-span-7 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {templates.length === 0 ? (
                    <div className="border border-white/5 bg-[#1A1A1A]/30 rounded-2xl p-12 text-center">
                      <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-[14px] font-bold text-slate-300">Aún no hay plantillas creadas.</p>
                      <p className="text-[13px] text-slate-500 mt-1">Usá el formulario lateral para agregar tu primer atajo.</p>
                    </div>
                  ) : (
                    templates.map((t, idx) => (
                      <div key={idx} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 hover:border-blue-500/30 hover:bg-[#1A1A1A]/80 transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] font-extrabold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg tracking-wider border border-blue-500/20">{t.shortcut}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide bg-black border border-white/10 px-2 py-1 rounded-md">{t.category}</span>
                          </div>
                          <button onClick={async (e) => { e.stopPropagation(); await supabase.from('ng_templates').delete().eq('id', t.id); fetchTemplates(); }} className="p-2 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                        <p className="text-[13px] text-slate-300 leading-relaxed font-light mt-4 pl-1 border-l-2 border-white/10 group-hover:border-blue-500/50 transition-colors">{t.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

"""

new_content = content[:start_idx] + new_config_code + content[end_idx:]

# Additionally, replace the route element to pass identical props using userRole hardcoded if missing later
new_content = new_content.replace(
    '<Route path="/configuracion" element={<ConfigTemplates />} />',
    '<Route path="/configuracion" element={<Configuracion isSidebarOpen={isSidebarOpen} userRole="admin" />} />'
)

with open('src/App.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(new_content)

print("Done resetting everything properly!")
