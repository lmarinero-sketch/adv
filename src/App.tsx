import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import GallitoWidget from './GallitoWidget';
import CarrerasPanel from './CarrerasPanel';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

import { 
  Home, 
  MessageSquare, 
  FileText, 
  Clock, 
  Settings,
  ChevronDown,
  Search,
  Moon,
  Upload,
  Edit2,
  Check,
  Package,
  ExternalLink,
  Menu,
  User,
  Sparkles,
  Flag,
  BrainCircuit,
  Zap,
  AlertTriangle,
  AlertCircle,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle,
  UploadCloud,
  PenLine,
  Table2,
  Lock,
  Users,
  RefreshCw,
  Phone,
  ShoppingCart,
  Eye,
  Plus,
  Trash2,
  X,
  MessageSquarePlus,
  Paperclip,
  Image as ImageIcon,
  Mic,
  History,
  RotateCcw
} from 'lucide-react';

export type ModalType = 'error' | 'success' | 'info';

export const AppContext = React.createContext({ 
  isSidebarOpen: true, 
  toggleSidebar: () => {},
  showSystemModal: (title: string, message: string, type?: ModalType) => {}
});

function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = React.useContext(AppContext);
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, text, badge }: { to: string, icon: any, text: string, badge?: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        title={!isSidebarOpen ? text : undefined}
        className={`flex items-center ${isSidebarOpen ? 'justify-between px-4' : 'justify-center px-0'} py-3 text-[14px] font-medium transition-all ${
          isActive 
            ? 'bg-orange-500/20 text-orange-400 border-r-4 border-orange-500' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white rounded-xl'
        }`}
      >
        <div className="flex items-center">
          <Icon className={`w-[18px] h-[18px] ${isSidebarOpen ? 'mr-3' : ''} ${isActive ? 'text-orange-500' : 'text-slate-500'}`} />
          {isSidebarOpen && text}
        </div>
        {badge && isSidebarOpen && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className={`h-screen flex flex-col fixed left-0 top-0 overflow-hidden transition-[width] duration-300 z-50 ${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'}`}
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(15,23,42,0.95) 0%, rgba(0,0,0,0.98) 100%), url(/2021-06-07.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className={`p-4 border-b border-white/10 flex items-center h-[88px] relative ${isSidebarOpen ? 'justify-between px-6' : 'justify-center px-2'}`}>
        <div className="flex items-center overflow-hidden">
            <img src="/images.jpg" alt="Adventure Pro" className="w-[42px] h-[42px] rounded-xl object-cover shadow-lg shrink-0 border-2 border-white/20" />
            {isSidebarOpen && (
              <div className="ml-3 shrink-0">
                <h2 className="text-[17px] font-extrabold text-white leading-tight">Eventos</h2>
                <p className="text-[14px] text-orange-500/70 leading-tight font-medium tracking-wide">Adventure Pro</p>
              </div>
            )}
        </div>
        
        {/* Toggle Button */}
        <button 
           onClick={toggleSidebar} 
           className="absolute -right-[14px] top-[30px] bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-orange-600 shadow-sm rounded-md p-1 z-50 transition-colors"
        >
           {isSidebarOpen ? <PanelLeftClose className="w-[18px] h-[18px]" /> : <PanelLeftOpen className="w-[18px] h-[18px]" />}
        </button>
      </div>
      
      <nav className={`flex-1 py-6 space-y-1 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
        <NavItem to="/" icon={Home} text="Inicio" />
        <NavItem to="/mensajeria" icon={MessageSquare} text="Mensajería" />
        <NavItem to="/clientes" icon={Users} text="Clientes" />
        <NavItem to="/carreras" icon={Flag} text="Carreras" />
        <NavItem to="/seguimientos" icon={Clock} text="Seguimientos" />
        <div className="my-4" />
        <NavItem to="/configuracion" icon={Settings} text="Configuración" />
      </nav>
      
      <div className="mt-auto">
        {isSidebarOpen && (
          <div className="px-4 pb-2 text-center flex flex-col items-center">
            <img src="/giftrote.gif" alt="Animation" className="w-full h-auto max-h-[250px] object-cover rounded-lg shadow-lg opacity-80 mix-blend-screen" />
          </div>
        )}
        {isSidebarOpen && (
          <div className="p-4 border-t border-white/10 text-center">
            <a href="https://www.growlabs.lat" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 font-medium uppercase tracking-wider hover:text-orange-500 transition-colors block">
              SISTEMA CREADO POR GROW LABS
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function TopBar({ title, subtitle }: { title: string, subtitle: string }) {
  const { toggleSidebar } = React.useContext(AppContext);
  // Format current date exactly like the UI
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = new Intl.DateTimeFormat('es-AR', dateOptions).format(new Date());

  return (
    <header className="h-[88px] bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-10 transition-colors">
      <div className="flex items-center">
        <div>
          <h1 className="text-[22px] text-white"><span className="font-bold">Administración</span> {title}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="bg-zinc-800 px-4 py-2 rounded-full text-[13px] font-medium text-zinc-300 capitalize">
          {formattedDate}
        </div>
        <div className="bg-zinc-800 pl-4 pr-1 py-1 rounded-full flex items-center justify-between border border-zinc-800">
          <span className="text-[13px] font-medium text-zinc-200 mr-3">Vendedor Juan</span>
          <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
            VJ
          </div>
        </div>
        <button className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button onClick={() => (window as any).toggleTheme()} className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors">
          <Moon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ followUps: 0, messages: 0 });
  const { isSidebarOpen } = React.useContext(AppContext);

  useEffect(() => {
    supabase.from('ng_follow_ups').select('*', { count: 'exact', head: true }).then(({count}) => {
      setStats(s => ({...s, followUps: count || 0}));
    });
    supabase.from('ng_whatsapp_messages').select('*', { count: 'exact', head: true }).then(({count}) => {
      setStats(s => ({...s, messages: count || 0}));
    });
  }, []);

  return (
    <div className={`flex-1 min-h-screen bg-zinc-950 flex flex-col transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
       <TopBar title="Adventure Pro" subtitle="Sistema de gestión integral" />
       
       <main className="px-10 py-6 w-full">
         
         {/* HERO BANNER - Exact replication */}
         <div className="w-full bg-black rounded-[28px] overflow-hidden mb-10 relative shadow-md shadow-orange-500/20">
           {/* Background Image Setup */}
           <div className="absolute inset-0 z-0">
             <img src="/maxresdefault.jpg" alt="Fondo Eventos" className="w-full h-full object-cover opacity-40 mix-blend-overlay brightness-75" />
             <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-orange-600/40"></div>
           </div>
           
           <div className="relative z-10 px-12 py-10">
             <div className="flex items-center space-x-3 mb-4">
               <Home className="w-6 h-6 text-white" />
               <h2 className="text-3xl font-bold text-white tracking-tight">Buenas noches 👋</h2>
             </div>
             
             <p className="text-orange-50 text-[15px] font-medium leading-relaxed max-w-3xl mb-8 opacity-90">
               Bienvenido al <strong>Sistema de Administración</strong> de Adventure Pro. Desde acá podés subir facturas, controlar seguimientos con inteligencia artificial y comunicarte automáticamente con los clientes por WhatsApp.
             </p>

             <div className="flex flex-wrap gap-3">
               <div className="bg-zinc-900/20 hover:bg-zinc-900/30 cursor-pointer backdrop-blur-md px-4 py-2 rounded-xl text-white text-[13px] font-medium border border-white/10 transition-colors flex items-center">
                 <FileText className="w-4 h-4 mr-2" /> Facturas <span className="ml-2 bg-zinc-900/20 px-2 py-0.5 rounded textxs">Módulo IA</span>
               </div>
               <div className="bg-zinc-900/20 hover:bg-zinc-900/30 cursor-pointer backdrop-blur-md px-4 py-2 rounded-xl text-white text-[13px] font-medium border border-white/10 transition-colors flex items-center">
                 <Clock className="w-4 h-4 mr-2" /> Seguimientos <span className="ml-2 bg-zinc-900/20 px-2 py-0.5 rounded textxs">{stats.followUps} Activos</span>
               </div>
               <div className="bg-zinc-900/20 hover:bg-zinc-900/30 cursor-pointer backdrop-blur-md px-4 py-2 rounded-xl text-white text-[13px] font-medium border border-white/10 transition-colors flex items-center">
                 <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp <span className="ml-2 bg-zinc-900/20 px-2 py-0.5 rounded textxs">Integrado</span>
               </div>
             </div>
           </div>
         </div>
         
         {/* SECTION TITLE */}
         <div className="flex items-center mb-6">
           <FileText className="w-5 h-5 text-zinc-400 mr-3" />
           <div>
             <h3 className="text-[17px] font-bold text-white">Acciones Directas</h3>
             <p className="text-sm text-zinc-500">Tocá cada sección para acceder al sistema rápido.</p>
           </div>
         </div>

         {/* ACTION LIST CARDS */}
         <div className="space-y-4">
           
           <Link to="/subir" className="bg-zinc-900 hover:bg-zinc-800/50 transition-colors cursor-pointer border border-zinc-800/60 rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] no-underline">
             <div className="flex items-center">
               <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mr-5 shrink-0">
                 <FileText className="w-5 h-5 text-orange-500" />
               </div>
               <div>
                 <h4 className="text-[16px] font-bold text-white">Cargar Nueva Factura</h4>
                 <p className="text-[13px] text-zinc-400 mt-0.5">Subí el PDF de la factura, extraé datos por IA y creá un seguimiento.</p>
               </div>
             </div>
             <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
               Subir PDF <ChevronDown className="w-4 h-4 ml-1" />
             </div>
            </Link>

           <Link to="/mensajeria" className="bg-zinc-900 hover:bg-zinc-800/50 transition-colors cursor-pointer border border-zinc-800/60 rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] no-underline">
             <div className="flex items-center">
               <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mr-5 shrink-0">
                 <MessageSquare className="w-5 h-5 text-green-500" />
               </div>
               <div>
                 <h4 className="text-[16px] font-bold text-white">Historial de Mensajes</h4>
                 <p className="text-[13px] text-zinc-400 mt-0.5">Controlá las consultas de los clientes que llegaron vía builderBot.</p>
               </div>
             </div>
             <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
               {stats.messages} mensajes <ChevronDown className="w-4 h-4 ml-1" />
             </div>
            </Link>

           <Link to="/configuracion" className="bg-zinc-900 hover:bg-zinc-800/50 transition-colors cursor-pointer border border-zinc-800/60 rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] no-underline">
             <div className="flex items-center">
               <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mr-5 shrink-0">
                 <Settings className="w-5 h-5 text-purple-500" />
               </div>
               <div>
                 <h4 className="text-[16px] font-bold text-white">Configuración</h4>
                 <p className="text-[13px] text-zinc-400 mt-0.5">Configurá las credenciales de Supabase y prompts de la IA.</p>
               </div>
             </div>
             <div className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
               1 tema <ChevronDown className="w-4 h-4 ml-1" />
             </div>
            </Link>

         </div>

       </main>
    </div>
  )
}

// Normaliza teléfono argentino al formato 549XXXXXXXXXX (sin 15, sin +)
function normalizePhone(raw: string): string {
  let p = raw.replace(/[^\d]/g, ''); // solo dígitos, esto ya remueve el +
  // Si empieza con 0, quitamos el 0
  if (p.startsWith('0')) p = p.substring(1);
  // Si empieza con 15, quitamos el 15
  if (p.startsWith('15')) p = p.substring(2);
  // Si empieza con 54 pero no 549, insertamos 9
  if (p.startsWith('54') && !p.startsWith('549')) p = '549' + p.substring(2);
  // Si NO empieza con 549, lo agregamos
  if (!p.startsWith('549')) p = '549' + p;
  return p;
}

// Formatea un importe numérico a formato argentino
function formatMoney(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0,00';
  return '$' + num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function UploadInvoice() {
  const { isSidebarOpen, showSystemModal } = React.useContext(AppContext);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [reason, setReason] = useState('Rotación de eventos');
  const [days, setDays] = useState(180);
  const [observations, setObservations] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }

      const { data, error } = await supabase.functions.invoke('parse-invoice', { 
        body: { text } 
      });
      
      if (error) throw error;
      // Normalize phone client side too
      if (data.phone) data.phone = normalizePhone(data.phone);
      setParsedData(data);
    } catch (err: any) {
      console.error(err);
      showSystemModal('Error', 'Error procesando factura (¿La Edge Function está corriendo?) | Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [saving, setSaving] = useState(false);

  const saveFollowUp = async () => {
    if (!parsedData) return;
    setSaving(true);
    try {
      const normalizedPhone = normalizePhone(parsedData.phone || '0000000');
      const { data: client, error: cErr } = await supabase.from('ng_clients').upsert({
        name: parsedData.clientName,
        phone: normalizedPhone
      }, { onConflict: 'phone' }).select().single();

      if (cErr) throw cErr; 

      // Save invoice with structured items
      const itemsToSave = Array.isArray(parsedData.items) ? parsedData.items : [];
      const { error: invErr } = await supabase.from('ng_invoices').insert({
        client_id: client?.id,
        invoice_number: parsedData.invoiceNumber || null,
        amount: parsedData.amount || 0,
        items: itemsToSave,
        purchase_date: parsedData.date || new Date().toISOString().split('T')[0]
      });
      if (invErr) throw invErr;
      
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + days);

      const { error: fErr } = await supabase.from('ng_follow_ups').insert({
        client_id: client?.id, 
        reason: reason,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        observations: observations || null
      });

      if (fErr) throw fErr;
      showSystemModal('¡Exito!', '¡Factura y Seguimiento Guardados Exitosamente!', 'success');
      setParsedData(null);
      setFile(null);
      setObservations('');
    } catch(e: any) {
      console.error(e);
      showSystemModal('Error Base de Datos', 'Error al guardar el seguimiento. Asegúrate de ejecutar el sql schema. Detalles: ' + e?.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const [uploadTab, setUploadTab] = useState<'pdf' | 'manual' | 'excel'>('pdf');
  const [manualData, setManualData] = useState({ clientName: '', phone: '', amount: '', items: '' });
  const [manualObservations, setManualObservations] = useState('');

  const handleManualSave = async () => {
    setSaving(true);
    try {
      const normalizedPhone = normalizePhone(manualData.phone);
      const { data: client } = await supabase.from('ng_clients').upsert({ phone: normalizedPhone, name: manualData.clientName }, { onConflict: 'phone' }).select().single();
      await supabase.from('ng_invoices').insert({ client_id: client?.id, amount: parseFloat(manualData.amount) || 0, items: manualData.items.split(',').map(i => i.trim()) });
      const scheduledDate = new Date(); scheduledDate.setDate(scheduledDate.getDate() + days);
      await supabase.from('ng_follow_ups').insert({ client_id: client?.id, reason, scheduled_date: scheduledDate.toISOString().split('T')[0], observations: manualObservations || null });
      showSystemModal('¡Éxito!', '¡Venta manual guardada exitosamente!', 'success');
      setManualData({ clientName: '', phone: '', amount: '', items: '' });
      setManualObservations('');
    } catch(e: any) {
      showSystemModal('Error', 'Error al guardar venta manual: ' + e?.message, 'error');
    }
    setSaving(false);
  };

  // Helper: check if items are in new structured format (array of objects)
  const hasStructuredItems = parsedData?.items && Array.isArray(parsedData.items) && parsedData.items.length > 0 && typeof parsedData.items[0] === 'object';

  return (
    <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} min-h-screen bg-zinc-950 flex flex-col`}>
      <TopBar title="Adventure Pro" subtitle="Subir Documentos" />
      <main className="px-10 py-6 w-full">
        
        {/* Tab Switcher */}
        <div className="flex items-center mb-8 bg-zinc-900 rounded-2xl border border-zinc-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-1.5">
          <button onClick={() => setUploadTab('pdf')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all ${uploadTab === 'pdf' ? 'bg-orange-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800/50'}`}>
            <Sparkles className="w-4 h-4" /> Extraer con IA (PDF)
          </button>
          <button onClick={() => setUploadTab('manual')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all ${uploadTab === 'manual' ? 'bg-orange-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800/50'}`}>
            <PenLine className="w-4 h-4" /> Ingreso Manual
          </button>
          <button onClick={() => setUploadTab('excel')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all relative ${uploadTab === 'excel' ? 'bg-orange-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800/50'}`}>
            <Table2 className="w-4 h-4" /> Carga Masiva (Excel)
            <span className="absolute -top-2 -right-1 bg-amber-400 text-amber-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">PRÓXIMAMENTE</span>
          </button>
        </div>

        {/* TAB: PDF IA */}
        {uploadTab === 'pdf' && (
          <>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-8 mb-8">
              <div className="flex items-center mb-6">
                <UploadCloud className="w-5 h-5 text-orange-500 mr-3" />
                <h2 className="text-[17px] font-bold text-white">Cargar PDF</h2>
              </div>
              <label className="border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer block">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <p className="text-[15px] font-bold text-zinc-200 mb-1">
                  {file ? `Archivo: ${file.name}` : 'Subir Factura'}
                </p>
                <p className="text-[13px] text-zinc-500">Seleccioná un archivo PDF (Max 5MB)</p>
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-[14px] font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Procesando Documento...' : 'Extraer con Inteligencia Artificial'}
                </button>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                RESULTADO DEL ANÁLISIS — ESTILO FACTURA
               ═══════════════════════════════════════════════════════════ */}
            {parsedData && (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
                
                {/* SUCCESS BANNER */}
                <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 flex items-center">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <p className="text-[13px] font-bold text-green-800">Análisis exitoso — Datos extraídos con IA</p>
                  <span className="ml-auto text-[11px] text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">Factura {parsedData.invoiceType || 'A'}</span>
                </div>

                {/* ──── FACTURA VISUAL CARD ──── */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800/60 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] overflow-hidden">
                  
                  {/* HEADER FACTURA */}
                  <div className="bg-gradient-to-r from-[#01428E] to-[#1E3A8A] p-6 flex items-start justify-between">
                    <div className="flex items-center">
                      <img src="/images.png" alt="Adventure Pro" className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 mr-4" />
                      <div>
                        <h3 className="text-white text-[18px] font-extrabold tracking-tight">Adventure Pro eventos</h3>
                        <p className="text-orange-500/70 text-[12px] font-medium">Adventure Pro S.R.L.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-3 mb-1">
                        <span className="bg-zinc-900 text-[#01428E] text-[14px] font-black px-3 py-1 rounded-lg">{parsedData.invoiceType || 'A'}</span>
                        <span className="text-white text-[16px] font-bold">Factura</span>
                      </div>
                      {parsedData.invoiceNumber && (
                        <p className="text-orange-500/70 text-[13px] font-bold tracking-wider">Nº {parsedData.invoiceNumber}</p>
                      )}
                      {parsedData.date && (
                        <p className="text-blue-300 text-[12px] mt-1">Fecha: {new Date(parsedData.date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      )}
                    </div>
                  </div>

                  {/* DATOS CLIENTE */}
                  <div className="grid grid-cols-2 gap-6 p-6 border-b border-zinc-800">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Señor/es</p>
                        <p className="text-[16px] font-extrabold text-white">{parsedData.clientName || '—'}</p>
                      </div>
                      {parsedData.cuit && (
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">C.U.I.T.</p>
                          <p className="text-[14px] font-mono font-bold text-zinc-200">{parsedData.cuit}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Teléfono</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-mono font-bold text-zinc-200">{parsedData.phone || 'No especificado'}</p>
                          {parsedData.phone && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">549 OK</span>}
                        </div>
                      </div>
                      {parsedData.paymentCondition && (
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Cond. Venta</p>
                          <p className="text-[14px] font-bold text-zinc-200">{parsedData.paymentCondition}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ──── TABLA DE PRODUCTOS ──── */}
                  <div className="p-6">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center">
                      <Package className="w-3.5 h-3.5 mr-2" />
                      Detalle de Productos / Servicios
                    </p>
                    <div className="border border-zinc-800 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-zinc-800/50">
                            <th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-[80px]">CÓD.</th>
                            <th className="text-center px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-[60px]">CANT.</th>
                            <th className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">DESCRIPCIÓN</th>
                            <th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-[120px]">P. UNIT.</th>
                            <th className="text-right px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-[120px]">IMPORTE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {hasStructuredItems ? (
                            parsedData.items.map((item: any, idx: number) => (
                              <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                                <td className="px-4 py-3 text-[12px] font-mono text-zinc-400">{item.cod || '—'}</td>
                                <td className="px-4 py-3 text-[13px] font-bold text-white text-center">{item.qty || 1}</td>
                                <td className="px-4 py-3 text-[13px] font-medium text-white">{item.description}</td>
                                <td className="px-4 py-3 text-[13px] font-mono text-zinc-300 text-right">{item.unitPrice ? formatMoney(item.unitPrice) : '—'}</td>
                                <td className="px-4 py-3 text-[13px] font-mono font-bold text-white text-right">{item.total ? formatMoney(item.total) : '—'}</td>
                              </tr>
                            ))
                          ) : Array.isArray(parsedData.items) ? (
                            parsedData.items.map((item: any, idx: number) => (
                              <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                                <td className="px-4 py-3 text-[12px] font-mono text-zinc-400">—</td>
                                <td className="px-4 py-3 text-[13px] font-bold text-white text-center">1</td>
                                <td className="px-4 py-3 text-[13px] font-medium text-white">{typeof item === 'string' ? item : item.description || JSON.stringify(item)}</td>
                                <td className="px-4 py-3 text-[13px] font-mono text-zinc-300 text-right">—</td>
                                <td className="px-4 py-3 text-[13px] font-mono font-bold text-white text-right">—</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 text-[13px] text-zinc-400 text-center">Sin productos extraídos</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ──── TOTALES ESTILO FACTURA ──── */}
                  <div className="px-6 pb-6">
                    <div className="flex justify-end">
                      <div className="w-[380px] space-y-2">
                        {parsedData.subtotal && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-zinc-400">Subtotal</span>
                            <span className="font-mono font-medium text-zinc-200">{formatMoney(parsedData.subtotal)}</span>
                          </div>
                        )}
                        {parsedData.discount && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-zinc-400">Descuento ({parsedData.discount}%)</span>
                            <span className="font-mono font-medium text-red-500">-{parsedData.discountAmount ? formatMoney(parsedData.discountAmount) : '—'}</span>
                          </div>
                        )}
                        {parsedData.iva && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-zinc-400">IVA 21%</span>
                            <span className="font-mono font-medium text-zinc-200">{formatMoney(parsedData.iva)}</span>
                          </div>
                        )}
                        <div className="border-t-2 border-slate-800 pt-3 mt-2 flex justify-between">
                          <span className="text-[15px] font-extrabold text-white">TOTAL</span>
                          <span className="text-[18px] font-extrabold text-white font-mono">{formatMoney(parsedData.amount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ──── CONFIGURACIÓN DE SEGUIMIENTO ──── */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-800 flex items-center">
                    <Clock className="w-4 h-4 text-amber-500 mr-3" />
                    <p className="text-[13px] font-bold text-zinc-200">Configurar Seguimiento</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[13px] font-bold text-zinc-200 mb-2">Motivo de contacto</label>
                        <select value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-orange-500 bg-zinc-900 shadow-sm">
                          <option>Rotación de eventos</option>
                          <option>Alineación y Balanceo</option>
                          <option>Satisfacción de compra</option>
                          <option>Cambio de Aceite</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-zinc-200 mb-2">Agendar a X días</label>
                        <div className="flex rounded-xl overflow-hidden shadow-sm border border-zinc-800 bg-zinc-900">
                          <button onClick={() => setDays(30)} className={`flex-1 py-3 text-[14px] font-medium transition-colors ${days === 30 ? 'bg-orange-600 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'}`}>30</button>
                          <div className="w-[1px] bg-zinc-800"></div>
                          <button onClick={() => setDays(90)} className={`flex-1 py-3 text-[14px] font-medium transition-colors ${days === 90 ? 'bg-orange-600 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'}`}>90</button>
                          <div className="w-[1px] bg-zinc-800"></div>
                          <button onClick={() => setDays(180)} className={`flex-1 py-3 text-[14px] font-medium transition-colors ${days === 180 ? 'bg-orange-600 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'}`}>180</button>
                        </div>
                      </div>
                    </div>

                    {/* OBSERVACIONES */}
                    <div>
                      <label className="block text-[13px] font-bold text-zinc-200 mb-2 flex items-center">
                        <Edit2 className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                        Observaciones
                        <span className="ml-2 text-[10px] font-medium text-zinc-500">(opcional — se verán en el seguimiento)</span>
                      </label>
                      <textarea 
                        value={observations} 
                        onChange={e => setObservations(e.target.value)} 
                        placeholder="Ej: Cliente pidió que lo contactemos por la mañana. Interesado en alineación 3D..." 
                        className="w-full border border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-zinc-200 h-24 resize-none focus:outline-none focus:border-orange-500 bg-zinc-900 shadow-sm" 
                      />
                    </div>
                    
                    <button 
                      onClick={saveFollowUp} 
                      disabled={saving} 
                      className="w-full bg-[#EAB308] hover:bg-yellow-400 text-yellow-950 font-bold px-6 py-4 rounded-xl shadow-sm transition-all text-[15px] disabled:opacity-50"
                    >
                      {saving ? 'Guardando en Base de Datos...' : 'Guardar Factura + Seguimiento Automático'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </>
        )}

        {/* TAB: MANUAL */}
        {uploadTab === 'manual' && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center">
              <PenLine className="w-4 h-4 text-orange-600 mr-3" />
              <p className="text-[13px] font-bold text-blue-800">Ingreso Manual de Venta</p>
            </div>
            <div className="p-8 grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Nombre del Cliente</label>
                <input type="text" value={manualData.clientName} onChange={e => setManualData({...manualData, clientName: e.target.value})} placeholder="Ej: Juan Pérez" className="w-full border border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-orange-500 bg-zinc-900" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Teléfono</label>
                <input type="text" value={manualData.phone} onChange={e => setManualData({...manualData, phone: e.target.value})} placeholder="Ej: 5492645438114" className="w-full border border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-orange-500 bg-zinc-900" />
                <p className="text-[10px] text-orange-500 mt-1 font-medium">Formato: 549 + código de área + número (sin 15). Ej: 549264<b>5438114</b></p>
                {manualData.phone && <p className="text-[10px] text-green-600 mt-0.5 font-bold">Se guardará como: {normalizePhone(manualData.phone)}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Importe Total ($)</label>
                <input type="number" value={manualData.amount} onChange={e => setManualData({...manualData, amount: e.target.value})} placeholder="Ej: 150000" className="w-full border border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-orange-500 bg-zinc-900" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Motivo de contacto</label>
                <select value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-orange-500 bg-zinc-900">
                  <option>Rotación de eventos</option>
                  <option>Alineación y Balanceo</option>
                  <option>Satisfacción de compra</option>
                  <option>Cambio de Aceite</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Productos (separados por coma)</label>
                <textarea value={manualData.items} onChange={e => setManualData({...manualData, items: e.target.value})} placeholder="Ej: Bridgestone 205/55R16, Alineación, Balanceo" className="w-full border border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-white h-24 resize-none focus:outline-none focus:border-orange-500 bg-zinc-900" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Observaciones (opcional)</label>
                <textarea value={manualObservations} onChange={e => setManualObservations(e.target.value)} placeholder="Ej: Llamar por la mañana, interesado en alineación..." className="w-full border border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-white h-20 resize-none focus:outline-none focus:border-orange-500 bg-zinc-900" />
              </div>
              <div className="col-span-2">
                <label className="block text-[13px] font-bold text-zinc-200 mb-2">Agendar seguimiento a X días</label>
                <div className="flex rounded-xl overflow-hidden shadow-sm border border-zinc-800 bg-zinc-900">
                  <button onClick={() => setDays(30)} className={`flex-1 py-3 text-[14px] font-medium transition-colors ${days === 30 ? 'bg-orange-600 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'}`}>30</button>
                  <div className="w-[1px] bg-zinc-800"></div>
                  <button onClick={() => setDays(90)} className={`flex-1 py-3 text-[14px] font-medium transition-colors ${days === 90 ? 'bg-orange-600 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'}`}>90</button>
                  <div className="w-[1px] bg-zinc-800"></div>
                  <button onClick={() => setDays(180)} className={`flex-1 py-3 text-[14px] font-medium transition-colors ${days === 180 ? 'bg-orange-600 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'}`}>180</button>
                </div>
              </div>
            </div>
            <div className="p-8 pt-0">
              <button 
                onClick={handleManualSave} 
                disabled={saving || !manualData.clientName || !manualData.phone}
                className="w-full bg-[#EAB308] hover:bg-yellow-400 text-yellow-950 font-bold px-6 py-4 rounded-xl shadow-sm transition-all text-[15px] disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Venta Manual + Seguimiento'}
              </button>
            </div>
          </div>
        )}

        {/* TAB: EXCEL */}
        {uploadTab === 'excel' && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-[20px] font-bold text-white mb-2">Carga Masiva por Excel</h3>
            <p className="text-[14px] text-zinc-400 mb-1 max-w-md mx-auto">Esta funcionalidad estará disponible próximamente. Vas a poder subir un archivo Excel (.xlsx) con múltiples ventas y el sistema las procesará automáticamente.</p>
            <span className="inline-block mt-4 bg-amber-100 text-amber-700 text-[12px] font-bold px-4 py-2 rounded-full">🚧 En desarrollo — Próximamente</span>
          </div>
        )}

      </main>
    </div>
  );
}

function Messenger() {
  const navigate = useNavigate();
  const { isSidebarOpen, showSystemModal } = React.useContext(AppContext);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [copilotData, setCopilotData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [fuReason, setFuReason] = useState('Seguimiento general');
  const [fuDate, setFuDate] = useState('');
  const [fuObservations, setFuObservations] = useState('');

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!activeContactInfo?.id || !fuDate) return;
    try {
      const { error } = await supabase.from('ng_follow_ups').insert({
        client_id: activeContactInfo.id,
        reason: fuReason,
        scheduled_date: fuDate,
        observations: fuObservations
      });
      if(error) throw error;
      showSystemModal('Éxito', 'Seguimiento programado correctamente.', 'success');
      setShowFollowUpModal(false);
      setFuReason('Seguimiento general');
      setFuDate('');
      setFuObservations('');
    } catch(err: any) {
      console.error(err);
      showSystemModal('Error', 'No se pudo agendar el seguimiento.', 'error');
    }
  };
  const PAGE_SIZE = 1000;
  
  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [activeContactInfo, setActiveContactInfo] = useState<any>(null);
  const [activeClientsMap, setActiveClientsMap] = useState<Record<string, string>>({});
  const [newMessage, setNewMessage] = useState("");
  const [showWaPicker, setShowWaPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Edición
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientName, setEditClientName] = useState("");

  const handleSaveClientName = async () => {
    if(!activeContact || !editClientName.trim()) return;
    try {
      const { data, error } = await supabase.from('ng_clients').upsert({
        phone: activeContact, 
        name: editClientName
      }, { onConflict: 'phone' }).select();

      if(error) {
        console.error("Error saving client name:", error);
        showSystemModal("Error guardando el nombre", "Error guardando el nombre del cliente. Revisa las policies de la base de datos.", "error");
      } else {
        setActiveContactInfo((prev: any) => ({...prev, name: editClientName}));
        setActiveClientsMap((prev: any) => ({...prev, [activeContact]: editClientName}));
        setMessages([...messages]); // trigger re-render
      }
    } catch(e) {
      console.error(e);
    }
    setIsEditingClient(false);
  };

  
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [tplForm, setTplForm] = useState({ shortcut: '/', body: '', category: 'General' });

  // Settings Modal
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'templates' | 'blacklist' | 'wa-templates' | 'bot-ia' | 'general'>('templates');
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [blacklistInput, setBlacklistInput] = useState('');
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [waTemplates, setWaTemplates] = useState<any[]>([]);
  const [waTemplatesLoading, setWaTemplatesLoading] = useState(false);

  const BB_URL = import.meta.env.VITE_BUILDERBOT_API_URL;
  const BB_KEY = import.meta.env.VITE_BUILDERBOT_API_KEY;
  const BB_BOT_ID = import.meta.env.VITE_BUILDERBOT_BOT_ID;

  const fetchBlacklist = async () => {
    setBlacklistLoading(true);
    try {
      const res = await fetch(`${BB_URL}/${BB_BOT_ID}/blacklist`, {
        headers: { 'x-api-builderbot': BB_KEY }
      });
      const data = await res.json();
      setBlacklist(Array.isArray(data) ? data : data?.blacklist || data?.numbers || []);
    } catch (e) { console.error('Error fetching blacklist:', e); }
    setBlacklistLoading(false);
  };

  const addToBlacklist = async () => {
    if (!blacklistInput.trim()) return;
    try {
      await fetch(`${BB_URL}/${BB_BOT_ID}/blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-builderbot': BB_KEY },
        body: JSON.stringify({ number: blacklistInput.trim(), intent: 'add' })
      });
      setBlacklist(prev => [...prev, blacklistInput.trim()]);
      setBlacklistInput('');
      showSystemModal('Blacklist', `Número ${blacklistInput} agregado. El bot no le responderá.`, 'success');
    } catch (e) { console.error(e); }
  };

  const removeFromBlacklist = async (number: string) => {
    try {
      await fetch(`${BB_URL}/${BB_BOT_ID}/blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-builderbot': BB_KEY },
        body: JSON.stringify({ number, intent: 'remove' })
      });
      setBlacklist(prev => prev.filter(n => n !== number));
      showSystemModal('Blacklist', `Número ${number} removido. El bot volverá a responderle.`, 'success');
    } catch (e) { console.error(e); }
  };

  const fetchWaTemplates = async () => {
    setWaTemplatesLoading(true);
    try {
      const res = await fetch(`${BB_URL}/${BB_BOT_ID}/whatsapp-template?limit=50`, {
        headers: { 'x-api-builderbot': BB_KEY }
      });
      const data = await res.json();
      setWaTemplates(Array.isArray(data) ? data : data?.templates || data?.data || []);
    } catch (e) { console.error('Error fetching WA templates:', e); }
    setWaTemplatesLoading(false);
  };

  const openSettings = (tab: 'templates' | 'blacklist' | 'wa-templates' | 'bot-ia' | 'general' = 'templates') => {
    setSettingsTab(tab);
    setShowSettings(true);
    if (tab === 'blacklist') fetchBlacklist();
    if (tab === 'wa-templates') fetchWaTemplates();
  };

  useEffect(() => {
    fetchMessages();
    fetchTemplates();
    
    const channel = supabase
      .channel('messenger-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ng_whatsapp_messages' },
        (payload) => {
          console.log('[Realtime] Nuevo mensaje recibido:', payload.new?.direction, payload.new?.body?.substring(0, 40));
          setMessages(prev => {
            // Deduplicar: check id exacto O body+phone con prefijo (80 chars, strip ZWS) en ventana de 120s
            const newBody = (payload.new.body || '').replace(/\u200B/g, '').trim();
            const newBodyPrefix = newBody.substring(0, 80);
            const isDuplicate = prev.some(m => 
              m.id === payload.new.id || 
              (m.client_phone === payload.new.client_phone && 
               (m.body || '').replace(/\u200B/g, '').trim().substring(0, 80) === newBodyPrefix &&
               Math.abs(new Date(m.created_at).getTime() - new Date(payload.new.created_at).getTime()) < 120000)
            );
            if (isDuplicate) {
              console.log('[Realtime] Mensaje duplicado, ignorando');
              return prev;
            }
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe((status, err) => {
        console.log('[Realtime] Estado:', status, err || '');
        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Error en canal, reintentando en 5s...');
          setTimeout(() => channel.subscribe(), 5000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (activeContact) {
      loadContactInfo(activeContact);
      setCopilotData(null);
    }
  }, [activeContact]);

  const loadContactInfo = async (phone: string) => {
    try {
      const { data: clientData } = await supabase.from('ng_clients').select('*').eq('phone', phone).single();
      if (clientData) {
        const { data: invoiceData } = await supabase.from('ng_invoices')
          .select('*').eq('client_id', clientData.id)
          .order('created_at', { ascending: false });
        
        setActiveContactInfo({
          ...clientData,
          invoices: invoiceData || [],
          lastInvoice: (invoiceData && invoiceData.length > 0) ? invoiceData[0] : null
        });
      } else {
        setActiveContactInfo({ name: 'Cliente' });
      }
    } catch (e) {
      setActiveContactInfo({ name: 'Cliente' });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await supabase.from('ng_templates').select('*');
      if (data && data.length > 0) {
        setTemplates(data);
      }
    } catch (e) {
    }
  };

  const analyzeChat = async () => {
    if (!activeContact) return;
    setIsAnalyzing(true);
    try {
      const tenMessages = activeMessages.slice(0, 15);
      const { data, error } = await supabase.functions.invoke('sales-copilot', {
        body: { phone: activeContact, messages: tenMessages.reverse() }
      });
      if (error) throw error;
      setCopilotData(data);
    } catch (e: any) {
      console.error(e);
      showSystemModal("Error del Copiloto", "No se pudo analizar el chat: " + e.message, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchMessages = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      if (!isLoadMore) {
        // ── Fetch recursivo: traer TODOS los mensajes en bloques de 1000 ──
        let allMessages: any[] = [];
        let currentPage = 0;
        let keepFetching = true;

        while (keepFetching) {
          const _from = currentPage * PAGE_SIZE;
          const _to = _from + PAGE_SIZE - 1;
          const { data, error } = await supabase
            .from('ng_whatsapp_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .range(_from, _to);
          
          if (error) throw error;
          const batch = data || [];
          allMessages = [...allMessages, ...batch];
          
          if (batch.length < PAGE_SIZE) {
            keepFetching = false;
          } else {
            currentPage++;
          }
        }

        console.log(`[Fetch] Total mensajes cargados: ${allMessages.length}`);
        setMessages(allMessages);
        setHasMore(false);
        setPage(0);

        const { data: cData } = await supabase.from('ng_clients').select('*');
        const clientsMap: Record<string, string> = {};
        if (cData) {
          cData.forEach(c => { clientsMap[c.phone] = c.name; });
        }
        setActiveClientsMap(clientsMap);

        if (allMessages.length > 0) {
          const firstContact = Array.from(new Set(allMessages.map(m => m.client_phone)))[0];
          setActiveContact(firstContact as string);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  const handleScrollSidebar = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100 && !loadingMore && hasMore) {
      fetchMessages(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewMessage(val);

    const words = val.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('/')) {
      setShowTemplates(true);
      if (!waTemplates.length && !waTemplatesLoading) fetchWaTemplates();
      const search = lastWord.toUpperCase();
      const matches = templates.filter(t => t.shortcut.toUpperCase().startsWith(search));
      setFilteredTemplates(matches.length > 0 ? matches : templates);
    } else {
      setShowTemplates(false);
    }
  };

  const applyTemplate = (templateBody: string) => {
    let replacedBody = templateBody;
    
    replacedBody = replacedBody.replace(/{{nombre}}/g, activeContactInfo?.name || 'Amigo');
    
    if (activeContactInfo?.lastInvoice) {
      const inv = activeContactInfo.lastInvoice;
      const prods = Array.isArray(inv.items) ? inv.items.join(', ') : inv.items || 'los productos seleccionados';
      replacedBody = replacedBody.replace(/{{productos}}/g, prods);
      replacedBody = replacedBody.replace(/{{fecha}}/g, inv.purchase_date || new Date().toLocaleDateString());
      replacedBody = replacedBody.replace(/{{importe}}/g, inv.amount || '0');
    } else {
      replacedBody = replacedBody.replace(/{{productos}}/g, 'nuestros productos');
      replacedBody = replacedBody.replace(/{{fecha}}/g, 'recientemente');
      replacedBody = replacedBody.replace(/{{importe}}/g, '0');
    }

    const words = newMessage.split(' ');
    words.pop();
    const newText = words.length > 0 ? words.join(' ') + ' ' + replacedBody : replacedBody;
    
    setNewMessage(newText);
    setShowTemplates(false);
  };

  const applyOfficialTemplate = (t: any) => {
    let textBody = '';
    const bodyComponent = t.components?.find((c: any) => c.type === 'BODY');
    if (bodyComponent && bodyComponent.text) {
      textBody = bodyComponent.text;
    }
    
    showSystemModal("Costo por mensaje", "ATENCIÓN: El uso de las plantillas oficiales de Meta generará un cargo económico según la tarifa vigente de WhatsApp Business.\n\nÚsala UNA SOLA VEZ para que el cliente responda. Una vez que el cliente responde, la ventana de 24hs se abre y los mensajes son gratuitos.", "info");
    
    setNewMessage(textBody);
    setShowWaPicker(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;
    
    setNewMessage("");
    setShowTemplates(false);

    // Save to local Supabase Database
    const optimisticMessage = {
      id: crypto.randomUUID(),
      client_phone: activeContact,
      body: newMessage,
      direction: 'outgoing',
      message_type: 'text',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('ng_whatsapp_messages').insert([{
      id: optimisticMessage.id,
      client_phone: activeContact,
      body: newMessage,
      direction: 'outgoing',
      message_type: 'text'
    }]);

    if (error) {
      console.error("Error BD al insertar mensaje: ", error);
      showSystemModal("Error en Base de Datos", "No se pudo guardar el mensaje: " + error.message, "error");
    } else {
      setMessages(prev => [optimisticMessage, ...prev]);
    }

    // Send to BuilderBot Cloud
    const builderBotUrl = import.meta.env.VITE_BUILDERBOT_API_URL;
    const builderBotKey = import.meta.env.VITE_BUILDERBOT_API_KEY;
    const builderBotBotId = import.meta.env.VITE_BUILDERBOT_BOT_ID;
    
    if (builderBotUrl && builderBotKey) {
      try {
        await fetch(`${builderBotUrl}/${builderBotBotId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-builderbot': builderBotKey
          },
          body: JSON.stringify({
             number: activeContact,
             messages: { content: newMessage }
          })
        });
      } catch (err) {
        console.error("Error sending message to BuilderBot: ", err);
      }
    }
  };

  const conversations = Array.from(new Set(messages.map(m => m.client_phone))).map(phone => {
    const contactMessages = messages.filter(m => m.client_phone === phone);
    const dbName = activeClientsMap[phone as string];
    const nameToDisplay = dbName ? (dbName.match(/^\d+$/) ? `Cliente ${dbName.substring(dbName.length - 4)}` : dbName) : phone;
    
    return {
      phone,
      name: nameToDisplay,
      lastMessage: contactMessages[0],
      total: contactMessages.length

    };
  }).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(c.phone).includes(searchTerm)
  );

  const formatMessageBody = (text: string) => {
    if (!text) return null;
    let formatted = text;
    if (!formatted.includes('\n') && formatted.match(/(♦|🟢|📍|📌|✅|⚠️|👉|- |• )/)) {
      formatted = formatted.replace(/(♦|🟢|📍|📌|✅|⚠️|👉|- |• )/g, '\n$1');
    }
    return formatted.trim();
  };

  // ── Heurística para corregir direction mal clasificado ──
  // Detecta mensajes outgoing que fueron guardados como incoming por error del webhook
  const getMessageDirection = (msg: any): string => {
    if (msg.direction === 'outgoing') return 'outgoing';
    
    const body = msg.body || '';
    
    // 1. Marca de agua invisible del bot IA (Zero-Width Space \u200B)
    if (body.includes('\u200B')) return 'outgoing';
    
    // 2. Patrones de presupuesto/venta del bot (mensajes largos con precios)
    if (body.length > 200 && (
      body.includes('Precio lista:') || body.includes('Precio Lista:') ||
      body.includes('cuotas de $') || body.includes('Contado $') || body.includes('Contado:') ||
      body.includes('Te paso presupuesto') || body.includes('te paso presupuesto')
    )) return 'outgoing';
    
    // 3. Frases típicas del vendedor/bot
    if (
      body.includes('asistente automático') ||
      (body.includes('asesor') && body.includes('atender')) ||
      body.includes('sucursal más cercana') || body.includes('sucursal mas cercana') ||
      body.includes('te las separo') ||
      (body.includes('Runflat') && body.includes('precisabas'))
    ) return 'outgoing';
    
    return msg.direction || 'incoming';
  };

  const activeMessages = messages
    .filter(m => m.client_phone === activeContact)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(m => ({ ...m, direction: getMessageDirection(m) }));

  useEffect(() => {
    scrollToBottom();
  }, [activeContact, activeMessages]);

  const is24hExpired = React.useMemo(() => {
    if (!activeMessages || activeMessages.length === 0) return true;
    
    let lastIncoming = null;
    for (let i = activeMessages.length - 1; i >= 0; i--) {
      if (activeMessages[i].direction === 'incoming') {
        lastIncoming = activeMessages[i];
        break;
      }
    }
    
    if (!lastIncoming) return true;
    
    const diffHours = (Date.now() - new Date(lastIncoming.created_at).getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  }, [activeMessages]);

  const renderMedia = (msg: any) => {
    if (!msg.attachment_urls || msg.attachment_urls.length === 0) return null;
    const url = msg.attachment_urls[0];
    const urlLower = (url || '').toLowerCase();
    
    // Verificar si la URL es válida (empieza con http/https)
    const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://'));
    
    // Si la URL no es válida (es un ID interno de BuilderBot), mostrar placeholder
    if (!isValidUrl) {
      const type = msg.message_type || 'media';
      if (type === 'image' || type === 'sticker') {
        return (
          <div className="mt-2 bg-zinc-800 rounded-lg p-4 flex items-center justify-center border border-zinc-800 max-w-[240px]">
            <div className="text-center">
              <span className="text-2xl">📷</span>
              <p className="text-[10px] text-zinc-500 mt-1 font-medium">Imagen (archivo temporal expirado)</p>
            </div>
          </div>
        );
      }
      if (type === 'audio' || type === 'voice' || type === 'ptt') {
        return (
          <div className="mt-2 bg-zinc-800 rounded-lg p-3 flex items-center border border-zinc-800 max-w-[240px]">
            <span className="text-lg mr-2">🎵</span>
            <p className="text-[11px] text-zinc-500 font-medium">Audio (archivo temporal expirado)</p>
          </div>
        );
      }
      if (type === 'video') {
        return (
          <div className="mt-2 bg-zinc-800 rounded-lg p-4 flex items-center justify-center border border-zinc-800 max-w-[240px]">
            <div className="text-center">
              <span className="text-2xl">🎬</span>
              <p className="text-[10px] text-zinc-500 mt-1 font-medium">Video (archivo temporal expirado)</p>
            </div>
          </div>
        );
      }
      if (type === 'document') {
        return (
          <div className="mt-2 bg-zinc-800 rounded-lg p-3 flex items-center border border-zinc-800 max-w-[240px]">
            <FileText className="w-4 h-4 mr-2 text-zinc-500" />
            <p className="text-[11px] text-zinc-500 font-medium">Documento (archivo temporal expirado)</p>
          </div>
        );
      }
      return (
        <div className="mt-2 bg-zinc-800 rounded-lg p-3 flex items-center border border-zinc-800 max-w-[240px]">
          <Upload className="w-4 h-4 mr-2 text-zinc-500" />
          <p className="text-[11px] text-zinc-500 font-medium">Archivo adjunto (no disponible)</p>
        </div>
      );
    }
    
    // URLs válidas: renderizar normalmente
    if (urlLower.match(/\.(jpeg|jpg|gif|png|webp)/) || msg.message_type === 'image' || msg.message_type === 'sticker') {
      return <img src={url} alt="Archivo adjunto" className="max-w-[240px] rounded-lg mt-2 cursor-pointer shadow-sm border border-zinc-800" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
    }
    if (urlLower.match(/\.(mp4|ogg|oga|mp3|wav)/) || msg.message_type === 'audio' || msg.message_type === 'voice' || msg.message_type === 'ptt') {
      return <audio controls src={url} className="w-[240px] mt-2 h-10 outline-none" />;
    }
    if (urlLower.match(/\.(mp4|webm|mov)/) || msg.message_type === 'video') {
      return <video controls src={url} className="max-w-[280px] rounded-lg mt-2 shadow-sm border border-zinc-800" />;
    }
    if (urlLower.match(/\.(pdf)/) || msg.message_type === 'document') {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="flex items-center mt-2 bg-zinc-800/50 p-3 rounded-lg border border-zinc-800 text-orange-600 hover:bg-zinc-800 transition-colors">
          <FileText className="w-5 h-5 mr-2" />
          <span className="text-xs font-bold truncate max-w-[180px]">Ver Documento PDF</span>
        </a>
      );
    }
    
    // Fallback: intentar mostrar como imagen si message_type es 'media'
    if (msg.message_type === 'media') {
      return <img src={url} alt="Archivo adjunto" className="max-w-[240px] rounded-lg mt-2 cursor-pointer shadow-sm border border-zinc-800" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
    }
    
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mt-2 text-[11px] font-bold text-orange-500 underline flex items-center">
        <Upload className="w-3 h-3 mr-1" /> Archivo Adjunto ({msg.message_type})
      </a>
    );
  };

  return (
    <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} h-screen bg-[#f0f2f5] flex overflow-hidden`}>
      
      <div className="w-[340px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 flex items-center justify-between bg-[#f0f2f5] text-slate-800">
          <h2 className="text-lg font-bold text-[#111b21] flex items-center">
            Mensajería <span className="ml-2 bg-red-500 text-[#111b21] text-[10px] px-1.5 py-0.5 rounded-full">{conversations.length}</span>
          </h2>
          <div className="flex space-x-2 text-[#54656f]">
            <button onClick={() => openSettings()} className="hover:text-[#111b21] transition-colors"><Settings className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-2 border border-transparent focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-blue-400">
            <Search className="w-4 h-4 text-[#54656f] mr-2 shrink-0" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar conversación..." className="bg-transparent border-none outline-none text-[13px] w-full text-[#111b21]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" onScroll={handleScrollSidebar}>
          {loading ? (
            <p className="text-center text-xs text-[#54656f] p-4">Cargando...</p>
          ) : conversations.length === 0 ? (
            <p className="text-center text-xs text-[#54656f] p-4">Sin mensajes en DB</p>
          ) : (
            conversations.map((c: any) => {
              const isActive = activeContact === c.phone;
              return (
                <div 
                  key={c.phone} 
                  onClick={() => setActiveContact(c.phone)}
                  className={`flex items-start p-3 cursor-pointer border-b border-slate-50 transition-colors ${isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
                >
                  <img src="/images.jpg" alt="Cliente" className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm mr-3 border border-slate-200" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className={`text-[14px] font-bold truncate ${isActive ? 'text-[#111b21]' : 'text-[#111b21]'}`}>{c.name}</h4>
                      <span className="text-[10px] text-[#54656f] font-medium">
                        {new Date(c.lastMessage.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-[12px] truncate ${isActive ? 'text-[#111b21] font-medium' : 'text-[#54656f]'}`}>
                      {c.lastMessage.message_type === 'media' ? '📷 Imagen/Audio adjunto' : c.lastMessage.body}
                    </p>
                    <div className="mt-1">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-wider">Business</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          {loadingMore && (
            <div className="p-4 flex justify-center items-center">
              <RefreshCw className="w-4 h-4 text-[#54656f] animate-spin mr-2" />
              <span className="text-xs text-[#54656f] font-bold">Cargando chats más antiguos...</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ SETTINGS MODAL ═══ */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowSettings(false)}>
          <div className="bg-zinc-900 rounded-2xl shadow-2xl w-[720px] max-h-[85vh] flex flex-col overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <h2 className="text-[16px] font-bold text-[#111b21] flex items-center">
                <Settings className="w-5 h-5 mr-2 text-[#111b21]" /> Configuración de Mensajería
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-[#54656f] hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-zinc-900">
              {[
                { key: 'templates', label: '📋 Plantillas Rápidas' },
                { key: 'blacklist', label: '🚫 Blacklist Bot' },
                { key: 'wa-templates', label: '📱 Plantillas WhatsApp' },
                { key: 'bot-ia', label: '🤖 Bot IA' },
                { key: 'general', label: '⚙️ General' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tab.key === 'bot-ia') {
                      navigate('/configuracion', { state: { tab: 'bot-ia' } });
                      setShowSettings(false);
                      return;
                    }
                    setSettingsTab(tab.key as any);
                    if (tab.key === 'blacklist') fetchBlacklist();
                    if (tab.key === 'wa-templates') fetchWaTemplates();
                  }}
                  className={`px-4 py-3 text-[12px] font-bold border-b-2 transition-colors ${
                    settingsTab === tab.key 
                      ? 'border-orange-500 text-[#111b21]' 
                      : 'border-transparent text-[#54656f] hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* ── TAB: Plantillas Rápidas ── */}
              {settingsTab === 'templates' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[14px] font-bold text-[#111b21]">Atajos de Plantillas</h3>
                      <p className="text-[12px] text-[#54656f] mt-0.5">Escribí "/" en el chat para usarlas rápidamente</p>
                    </div>
                    <button 
                      onClick={() => { setShowAddTemplate(!showAddTemplate); setEditingTemplate(null); setTplForm({ shortcut: '/', body: '', category: 'General' }); }}
                      className="bg-[#f0f2f5]0 hover:bg-orange-600 text-[#111b21] text-[11px] font-bold px-3 py-2 rounded-lg transition-colors flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Nueva Plantilla
                    </button>
                  </div>

                  {showAddTemplate && (
                    <div className="bg-[#f0f2f5] border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
                      <div className="flex gap-2">
                        <input type="text" value={tplForm.shortcut} onChange={e => setTplForm({...tplForm, shortcut: e.target.value})} placeholder="/ATAJO" className="w-[120px] border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-bold focus:border-blue-400 focus:outline-none bg-zinc-900" />
                        <select value={tplForm.category} onChange={e => setTplForm({...tplForm, category: e.target.value})} className="border border-slate-200 rounded-lg px-3 py-2 text-[12px] bg-zinc-900 focus:border-blue-400 focus:outline-none">
                          <option>General</option><option>Seguimiento</option><option>Ventas</option><option>Soporte</option>
                        </select>
                      </div>
                      <textarea value={tplForm.body} onChange={e => setTplForm({...tplForm, body: e.target.value})} placeholder="Texto de la plantilla... usa {{nombre}}, {{productos}}, {{importe}}" rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[12px] focus:border-blue-400 focus:outline-none bg-zinc-900 resize-none" />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setShowAddTemplate(false); setEditingTemplate(null); }} className="text-[#54656f] hover:text-zinc-300 text-[11px] font-bold px-3 py-1.5 rounded-lg">Cancelar</button>
                        <button onClick={async () => {
                          const tpl = { shortcut: tplForm.shortcut, body: tplForm.body, category: tplForm.category };
                          if (editingTemplate) {
                            await supabase.from('ng_templates').update(tpl).eq('id', editingTemplate.id);
                          } else {
                            await supabase.from('ng_templates').insert([tpl]);
                          }
                          fetchTemplates();
                          setShowAddTemplate(false);
                          setEditingTemplate(null);
                          setTplForm({ shortcut: '/', body: '', category: 'General' });
                        }} disabled={!tplForm.body.trim() || !tplForm.shortcut.trim()} className="bg-[#f0f2f5]0 hover:bg-orange-600 disabled:bg-slate-300 text-[#111b21] text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors">
                          {editingTemplate ? 'Actualizar' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {templates.map((t, idx) => (
                      <div key={t.id || idx} className="bg-zinc-900 border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#111b21]">{t.shortcut}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-[#54656f] font-medium">{t.category}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingTemplate(t); setTplForm({ shortcut: t.shortcut, body: t.body, category: t.category }); setShowAddTemplate(true); }} className="text-blue-400 hover:text-[#111b21] p-1.5 rounded-lg hover:bg-[#f0f2f5]"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={async () => { await supabase.from('ng_templates').delete().eq('id', t.id); fetchTemplates(); }} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <p className="text-[12px] text-[#54656f] leading-relaxed">{t.body}</p>
                      </div>
                    ))}
                    {templates.length === 0 && (
                      <div className="text-center py-8 text-[#54656f]">
                        <p className="text-[13px] font-medium">No hay plantillas creadas aún</p>
                        <p className="text-[11px] mt-1">Crea tu primera plantilla para agilizar tus respuestas</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB: Blacklist ── */}
              {settingsTab === 'blacklist' && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-[14px] font-bold text-[#111b21]">Lista Negra del Bot</h3>
                    <p className="text-[12px] text-[#54656f] mt-0.5">El bot no responderá automáticamente a estos números. Útil para proveedores, familiares o números internos.</p>
                  </div>

                  <div className="flex gap-2 mb-5">
                    <input 
                      type="text" 
                      value={blacklistInput} 
                      onChange={e => setBlacklistInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addToBlacklist()}
                      placeholder="Ej: 5491133775246" 
                      className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] focus:border-blue-400 focus:outline-none bg-zinc-900"
                    />
                    <button onClick={addToBlacklist} className="bg-red-500 hover:bg-red-600 text-[#111b21] text-[11px] font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center shrink-0">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Bloquear
                    </button>
                  </div>

                  {blacklistLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-4 h-4 text-[#54656f] animate-spin mr-2" />
                      <span className="text-[12px] text-[#54656f]">Cargando blacklist...</span>
                    </div>
                  ) : blacklist.length === 0 ? (
                    <div className="text-center py-8 text-[#54656f] bg-white rounded-xl border border-slate-200">
                      <p className="text-[13px] font-medium">🤖 Sin números bloqueados</p>
                      <p className="text-[11px] mt-1">El bot responde a todos los números por ahora</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {blacklist.map((num, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-zinc-900 border border-slate-200 rounded-xl px-4 py-3 hover:border-red-200 transition-colors group">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                              <span className="text-red-500 text-[11px] font-bold">🚫</span>
                            </div>
                            <div>
                              <span className="text-[13px] font-bold text-zinc-200">{typeof num === 'string' ? num : num.number || JSON.stringify(num)}</span>
                              <p className="text-[10px] text-[#54656f]">Bot desactivado</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromBlacklist(typeof num === 'string' ? num : num.number)} 
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all"
                          >
                            Desbloquear
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: Plantillas WhatsApp (Meta) ── */}
              {settingsTab === 'wa-templates' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[14px] font-bold text-[#111b21]">Plantillas Oficiales WhatsApp</h3>
                      <p className="text-[12px] text-[#54656f] mt-0.5">Templates aprobados por Meta para iniciar conversaciones después de 24hs</p>
                    </div>
                    <button onClick={fetchWaTemplates} className="text-orange-500 hover:text-orange-700 text-[11px] font-bold flex items-center">
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Actualizar
                    </button>
                  </div>

                  {waTemplatesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-4 h-4 text-[#54656f] animate-spin mr-2" />
                      <span className="text-[12px] text-[#54656f]">Cargando templates de Meta...</span>
                    </div>
                  ) : waTemplates.length === 0 ? (
                    <div className="text-center py-8 text-[#54656f] bg-white rounded-xl border border-slate-200">
                      <p className="text-[13px] font-medium">Sin plantillas de WhatsApp</p>
                      <p className="text-[11px] mt-1">Configurá tus templates desde el panel de Meta Business</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {waTemplates.map((wt: any, idx: number) => (
                        <div key={idx} className="bg-zinc-900 border border-slate-200 rounded-xl p-4 hover:border-green-300 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[13px] font-bold text-green-700">{wt.name || wt.templateName || `Template ${idx+1}`}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              (wt.status || '').toLowerCase() === 'approved' 
                                ? 'bg-green-100 text-green-600 border border-green-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>{wt.status || 'N/A'}</span>
                          </div>
                          <p className="text-[12px] text-[#54656f]">{wt.body || wt.text || (wt.components && wt.components[0]?.text) || 'Sin preview'}</p>
                          {wt.language && <span className="text-[10px] text-slate-300 mt-1 inline-block">Idioma: {wt.language}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: General ── */}
              {settingsTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[14px] font-bold text-[#111b21] mb-1">Información del Bot</h3>
                    <p className="text-[12px] text-[#54656f] mb-3">Datos de conexión con BuilderBot Cloud</p>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#54656f] font-medium">Bot ID:</span>
                        <span className="text-zinc-300 font-mono text-[11px]">{BB_BOT_ID || 'No configurado'}</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#54656f] font-medium">API URL:</span>
                        <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[300px]">{BB_URL || 'No configurado'}</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#54656f] font-medium">API Key:</span>
                        <span className="text-zinc-300 font-mono text-[11px]">{BB_KEY ? '••••••' + BB_KEY.slice(-8) : 'No configurado'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold text-[#111b21] mb-1">Webhook URL</h3>
                    <p className="text-[12px] text-[#54656f] mb-3">URL que debe estar configurada en BuilderBot → Webhooks</p>
                    <div className="bg-[#f0f2f5] rounded-xl border border-blue-200 p-4">
                      <code className="text-[11px] text-orange-700 font-mono break-all select-all">
                        https://pxvhovctyewwppwkldaq.supabase.co/functions/v1/builderbot-webhook
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold text-[#111b21] mb-1">Regla de 24 Horas</h3>
                    <p className="text-[12px] text-[#54656f] mb-3">WhatsApp requiere usar plantillas oficiales para contactar clientes después de 24hs sin interacción</p>
                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mr-3 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-amber-700">El sistema detecta automáticamente sesiones expiradas y obliga el uso de plantillas oficiales para cumplir con las políticas de Meta.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold text-[#111b21] mb-1">Estadísticas Rápidas</h3>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className="bg-zinc-900 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-[22px] font-bold text-[#111b21]">{conversations.length}</p>
                        <p className="text-[10px] text-[#54656f] font-bold uppercase tracking-wider">Conversaciones</p>
                      </div>
                      <div className="bg-zinc-900 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-[22px] font-bold text-green-600">{messages.length}</p>
                        <p className="text-[10px] text-[#54656f] font-bold uppercase tracking-wider">Mensajes</p>
                      </div>
                      <div className="bg-zinc-900 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-[22px] font-bold text-purple-600">{templates.length}</p>
                        <p className="text-[10px] text-[#54656f] font-bold uppercase tracking-wider">Plantillas</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}



            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-[#efeae2] relative">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'none' }}></div>

        {activeContact ? (
          <>
            {/* Chat Topbar */}
            <div className="h-16 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm relative">
              <div className="flex items-center">
                <img src="/images.jpg" alt="Avatar Cliente" className="w-10 h-10 rounded-full object-cover shadow-sm mr-3 border border-slate-200" />
                <div>
                  
                  {isEditingClient ? (
                    <div className="flex items-center space-x-2">
                       <input 
                         type="text"
                         autoFocus
                         value={editClientName}
                         onChange={(e) => setEditClientName(e.target.value)}
                         className="text-[14px] font-bold text-[#111b21] border-b border-blue-400 focus:outline-none bg-white px-1 py-0.5 rounded-sm"
                         onKeyDown={(e) => { if(e.key === 'Enter') handleSaveClientName(); if(e.key === 'Escape') setIsEditingClient(false); }}
                       />
                       <button onClick={handleSaveClientName} className="text-green-600 bg-green-50 p-1 rounded-md hover:bg-green-100"><Check className="w-4 h-4" /></button>
                       <button onClick={() => setIsEditingClient(false)} className="text-[#54656f] bg-white p-1 rounded-md hover:bg-zinc-800">X</button>
                    </div>
                  ) : (
                    <h3 className="text-[15px] font-bold text-[#111b21] flex items-center group">
                      {(() => {
                         const rawName = activeContactInfo?.name || '';
                         if (!rawName) return 'Cliente Nuevo';
                         return rawName.match(/^\d+$/) ? `Cliente ${rawName.substring(rawName.length - 4)}` : rawName;
                      })()}
                      <span className="text-[#54656f] ml-2 font-normal text-xs bg-zinc-800 px-1.5 py-0.5 rounded">{activeContact}</span>
                      <button 
                        onClick={() => {
                          setEditClientName(activeContactInfo?.name || activeContact);
                          setIsEditingClient(true);
                        }}
                        className="ml-2 text-slate-300 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Editar Nombre">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </h3>
                  )}

                  <div className="flex items-center text-[11px] text-orange-500 font-medium">
                    <MessageSquare className="w-3 h-3 mr-1" /> WhatsApp Integrado {activeContactInfo?.lastInvoice ? '• Factura Vinculada' : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={async () => {
                    const tenMessages = activeMessages.slice(0, 10);
                    if(tenMessages.length === 0) return showSystemModal('Atención', 'No hay mensajes con este cliente', 'info');
                    try {
                       const { data, error } = await supabase.functions.invoke('summarize-chat', {
                          body: { messages: tenMessages.reverse() }
                       });
                       if(error) throw error;
                       showSystemModal('🤖 Resumen IA', data.summary, 'success');
                    } catch(err:any) {
                       console.error(err);
                       showSystemModal('Error IA', 'Error al resumir conversación de IA. Revisa edge function. Detalles: ' + err.message, 'error');
                    }
                  }}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-colors flex items-center border border-purple-200"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Resumir con IA
                </button>
                
                <button 
                  onClick={analyzeChat}
                  disabled={isAnalyzing}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-colors flex items-center border border-indigo-200"
                >
                  {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />}
                  {isAnalyzing ? 'Analizando...' : 'Copiloto IA'}
                </button>

                <div className="bg-zinc-800/80 px-4 py-1.5 rounded-full text-[11px] font-bold text-[#54656f] shadow-sm border border-slate-200">
                  {new Intl.DateTimeFormat('es-AR', { weekday:'long', day:'2-digit', month:'long', year:'numeric'}).format(new Date())}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 z-10 flex flex-col">
              {activeMessages.map((msg: any) => (
                <div key={msg.id} className={`flex flex-col mb-4 max-w-[75%] group/msg ${msg.direction === 'outgoing' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`px-4 py-3 rounded-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] relative
                    ${msg.direction === 'outgoing' 
                      ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-sm' 
                      : 'bg-white border border-transparent text-[#111b21] rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {renderMedia(msg)}
                    {msg.body && msg.body !== 'Multimedia' && (
                      <p className="text-[14px] leading-loose whitespace-pre-wrap font-medium">{formatMessageBody(msg.body)}</p>
                    )}
                    
                    <div className={`text-[10px] mt-1.5 text-right font-medium flex items-center justify-end ${msg.direction === 'outgoing' ? 'text-[#667781]' : 'text-[#54656f]'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      {msg.direction === 'outgoing' && <span className="ml-1 text-[10px]">✓✓</span>}
                    </div>

                    {/* Toggle direction button - visible on hover */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const newDir = msg.direction === 'outgoing' ? 'incoming' : 'outgoing';
                        const { error } = await supabase
                          .from('ng_whatsapp_messages')
                          .update({ direction: newDir })
                          .eq('id', msg.id);
                        if (!error) {
                          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, direction: newDir } : m));
                        }
                      }}
                      className={`absolute -top-2 ${msg.direction === 'outgoing' ? '-left-8' : '-right-8'} opacity-0 group-hover/msg:opacity-100 transition-opacity w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-md border
                        ${msg.direction === 'outgoing' 
                          ? 'bg-zinc-900 text-[#111b21] border-blue-200 hover:bg-[#f0f2f5]' 
                          : 'bg-[#f0f2f5]0 text-[#111b21] border-blue-400 hover:bg-orange-600'}`}
                      title={msg.direction === 'outgoing' ? 'Marcar como recibido' : 'Marcar como enviado'}
                    >
                      ↔
                    </button>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="relative z-20">
              {showTemplates && (
                <div className="absolute bottom-full left-12 w-[440px] mb-2 bg-zinc-900 rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in">
                  <div className="bg-white p-2.5 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Atajos / Plantillas</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#54656f]">{filteredTemplates.length} encontradas</span>
                      <button onClick={(e) => { e.stopPropagation(); setShowAddTemplate(!showAddTemplate); setEditingTemplate(null); setTplForm({ shortcut: '/', body: '', category: 'General' }); }} className="bg-[#f0f2f5]0 hover:bg-orange-600 text-[#111b21] text-[10px] font-bold px-2 py-1 rounded-md transition-colors flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Nueva
                      </button>
                    </div>
                  </div>

                  {/* Add/Edit Template Form */}
                  {showAddTemplate && (
                    <div className="p-3 border-b border-slate-200 bg-white bg-[#f0f2f5]/50 space-y-2">
                      <div className="flex gap-2">
                        <input type="text" value={tplForm.shortcut} onChange={e => setTplForm({...tplForm, shortcut: e.target.value})} placeholder="/ATAJO" className="w-[100px] border border-slate-200 rounded-lg px-2 py-1.5 text-[12px] font-bold focus:border-blue-400 focus:outline-none bg-zinc-900" />
                        <select value={tplForm.category} onChange={e => setTplForm({...tplForm, category: e.target.value})} className="border border-slate-200 rounded-lg px-2 py-1.5 text-[12px] bg-zinc-900 focus:border-blue-400 focus:outline-none">
                          <option>General</option><option>Seguimiento</option><option>Ventas</option><option>Soporte</option>
                        </select>
                      </div>
                      <textarea value={tplForm.body} onChange={e => setTplForm({...tplForm, body: e.target.value})} placeholder="Texto de la plantilla... usa {{nombre}}, {{productos}}, {{importe}}" rows={2} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[12px] focus:border-blue-400 focus:outline-none bg-zinc-900 resize-none" />
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {['nombre','productos','importe','fecha'].map(v => (
                            <button key={v} onClick={() => setTplForm({...tplForm, body: tplForm.body + `{{${v}}}`})} className="text-[10px] bg-zinc-900 border border-slate-200 px-1.5 py-0.5 rounded text-indigo-600 hover:bg-indigo-50 transition-colors">{`{{${v}}}`}</button>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => { setShowAddTemplate(false); setEditingTemplate(null); }} className="text-[11px] text-[#54656f] hover:text-zinc-300 px-2 py-1 transition-colors">Cancelar</button>
                          <button onClick={async () => {
                            const tpl = { shortcut: tplForm.shortcut.startsWith('/') ? tplForm.shortcut.toUpperCase() : `/${tplForm.shortcut.toUpperCase()}`, body: tplForm.body, category: tplForm.category };
                            if (editingTemplate) {
                              await supabase.from('ng_templates').update(tpl).eq('id', editingTemplate.id);
                            } else {
                              await supabase.from('ng_templates').insert([tpl]);
                            }
                            fetchTemplates();
                            setShowAddTemplate(false);
                            setEditingTemplate(null);
                            setTplForm({ shortcut: '/', body: '', category: 'General' });
                          }} disabled={!tplForm.body.trim() || !tplForm.shortcut.trim()} className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-[#111b21] text-[11px] font-bold px-3 py-1 rounded-md transition-colors">
                            {editingTemplate ? 'Actualizar' : 'Guardar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="max-h-60 overflow-y-auto">
                    {filteredTemplates.map((t, idx) => (
                      <div 
                        key={t.id || idx} 
                        className="p-3 hover:bg-[#f0f2f5] border-b border-slate-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] font-bold text-[#111b21] cursor-pointer" onClick={() => applyTemplate(t.body)}>{t.shortcut}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-[#54656f]">{t.category}</span>
                            <button onClick={(e) => { e.stopPropagation(); setEditingTemplate(t); setTplForm({ shortcut: t.shortcut, body: t.body, category: t.category }); setShowAddTemplate(true); }} className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-[#111b21] p-0.5 transition-all" title="Editar">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={async (e) => { e.stopPropagation(); await supabase.from('ng_templates').delete().eq('id', t.id); fetchTemplates(); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5 transition-all" title="Eliminar">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-[12px] text-[#54656f] truncate cursor-pointer" onClick={() => applyTemplate(t.body)}>{t.body}</p>
                      </div>
                    ))}
                    {filteredTemplates.length === 0 && !showAddTemplate && (
                      <div className="p-4 text-center text-sm text-[#54656f] font-medium">
                        No hay plantillas. <button onClick={() => setShowAddTemplate(true)} className="text-orange-500 hover:underline">Crear la primera</button>
                      </div>
                    )}
                    
                    {/* SECCIÓN META TEMPLATES */}
                    <div className="bg-zinc-800 px-3 py-1.5 border-y border-slate-200">
                      <span className="text-[10px] font-bold text-[#54656f] uppercase tracking-wider flex items-center">
                        <MessageSquarePlus className="w-3 h-3 mr-1" />
                        Plantillas Meta (Con Costo)
                      </span>
                    </div>
                    {waTemplatesLoading ? (
                      <div className="p-4 text-center text-xs text-[#54656f] font-medium animate-pulse">Cargando Meta API...</div>
                    ) : waTemplates.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#54656f]">No hay plantillas oficiales recibidas.<br/><button onClick={fetchWaTemplates} className="text-orange-500 hover:underline mt-1">Actualizar</button></div>
                    ) : (
                      waTemplates.map((t, idx) => {
                        const body = t.components?.find((c: any) => c.type === 'BODY')?.text || 'Plantilla sin texto';
                        return (
                          <div key={`meta-${idx}`} className="p-3 hover:bg-green-50/50 border-b border-slate-200 cursor-pointer transition-colors" onClick={() => applyOfficialTemplate(t)}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13px] font-bold text-green-700">/{t.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-mono uppercase text-[8px] flex items-center">Oficial</span>
                            </div>
                            <p className="text-[12px] text-[#54656f] truncate">{body}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

                <div className="bg-[#f0f2f5] p-4 shrink-0 flex items-center shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.05)] border-t border-slate-200 relative">
                {is24hExpired && (
                  <div className="absolute top-0 left-0 right-0 -translate-y-full bg-amber-100 border-y border-amber-300 px-6 py-2.5 flex items-center justify-center shadow-md z-30">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
                    <span className="text-[12px] font-bold text-amber-800">Sesión expirada (+24hs). DEBES iniciar con una Plantilla oficial (usa "/")</span>
                  </div>
                )}
                
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="w-12 h-12 flex-shrink-0 text-[#54656f] hover:text-[#111b21] hover:bg-[#f0f2f5] rounded-full flex items-center justify-center transition-all bg-white border border-slate-200 shadow-sm"
                    title="Adjuntar / Plantillas"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {/* Menú de Adjuntos */}
                  {showAttachmentMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-[220px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in">
                      <div className="p-1.5 flex flex-col gap-1">
                        <button onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }} className="flex items-center gap-3 w-full p-2.5 hover:bg-[#f0f2f5] rounded-lg text-[#111b21] transition-colors">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#111b21]"><ImageIcon className="w-4 h-4" /></div>
                          <div className="text-left"><p className="text-[13px] font-bold">Fotos y Videos</p></div>
                        </button>
                        <button onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }} className="flex items-center gap-3 w-full p-2.5 hover:bg-[#f0f2f5] rounded-lg text-[#111b21] transition-colors">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><FileText className="w-4 h-4" /></div>
                          <div className="text-left"><p className="text-[13px] font-bold">Documento</p></div>
                        </button>
                        <button onClick={() => { alert("Nota de voz en desarrollo..."); setShowAttachmentMenu(false); }} className="flex items-center gap-3 w-full p-2.5 hover:bg-[#f0f2f5] rounded-lg text-[#111b21] transition-colors">
                          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600"><Mic className="w-4 h-4" /></div>
                          <div className="text-left"><p className="text-[13px] font-bold">Audio</p></div>
                        </button>
                        <div className="h-[1px] bg-slate-200 my-1"></div>
                        <button onClick={() => { setShowWaPicker(true); setShowAttachmentMenu(false); if (!waTemplates.length) { fetchWaTemplates(); } }} className="flex items-center gap-3 w-full p-2.5 hover:bg-green-50 rounded-lg text-[#111b21] transition-colors group">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform"><MessageSquarePlus className="w-4 h-4" /></div>
                          <div className="text-left">
                            <p className="text-[13px] font-bold text-green-800">Plantilla de Meta</p>
                            <p className="text-[10px] text-green-600">(Con Costo)</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if(f) {
                      showSystemModal("Adjunto no soportado", "El envío de multimedia desde el CRM requiere configurar el bucket del proveedor en el próximo módulo.", "info");
                    }
                  }} />
                </div>

                {showWaPicker && (
                  <div className="absolute bottom-full left-4 w-[400px] mb-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in">
                    <div className="bg-green-50 p-2.5 border-b border-green-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Plantillas Meta (Con Costo)</span>
                      <button onClick={() => setShowWaPicker(false)} className="text-[#54656f] hover:text-[#111b21]"><X className="w-4 h-4"/></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {waTemplatesLoading ? (
                        <div className="p-4 text-center text-sm text-[#54656f] font-medium animate-pulse">Cargando Meta API...</div>
                      ) : waTemplates.length === 0 ? (
                        <div className="p-4 text-center text-sm text-[#54656f] font-medium">No hay plantillas oficiales disponibles.</div>
                      ) : (
                        waTemplates.map((t, idx) => {
                          const body = t.components?.find((c: any) => c.type === 'BODY')?.text || 'Plantilla sin texto';
                          return (
                            <div key={idx} className="p-3 hover:bg-green-50/50 border-b border-slate-200 cursor-pointer transition-colors" onClick={() => applyOfficialTemplate(t)}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[13px] font-bold text-[#111b21]">{t.name}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f0f2f5] text-[#54656f] font-mono uppercase">{t.language || 'es'}</span>
                              </div>
                              <p className="text-[12px] text-[#54656f] truncate">{body}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex-1 mx-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => {
                      if (is24hExpired && !e.target.value.startsWith('/') && e.target.value.length > 0) {
                        showSystemModal("Sesión Expirada", "Solo puedes utilizar Plantillas '/' para retomar el diálogo.", "error");
                        // force empty or just keep '/'
                        setNewMessage(e.target.value.startsWith('/') ? e.target.value : "/");
                        return;
                      }
                      handleInputChange(e);
                    }}
                    placeholder={is24hExpired ? "Escribe '/' para elegir plantilla..." : "Escribe '/' para plantillas o simplemente un mensaje..."} 
                    className={`w-full border rounded-full px-5 py-3 text-[14px] focus:outline-none transition-all shadow-inner 
                      ${is24hExpired 
                        ? 'bg-amber-50 border-amber-300 text-amber-900 focus:bg-amber-100 focus:border-amber-500 placeholder:text-amber-500/70' 
                        : 'bg-white border-transparent text-[#111b21] focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-orange-500/10 shadow-sm'}`}
                  />
                </form>

                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || (is24hExpired && !newMessage.startsWith('/'))}
                  className={`w-12 h-12 disabled:bg-slate-300 disabled:cursor-not-allowed text-[#111b21] rounded-full flex items-center justify-center transition-all shadow-md ml-2
                    ${is24hExpired ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}
                  `}
                >
                  <div style={{transform: "rotate(45deg) translate(-2px, 2px)"}}><Upload className="w-5 h-5" /></div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center z-10 text-[#54656f]">
            <MessageSquare className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-bold text-[#54656f]">Selecciona un chat</p>
            <p className="text-sm mt-2">Para comenzar a enviar y recibir mensajes empresariales.</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDE PANEL: Facturas Asociadas */}
      {activeContact && (
        <div className="w-[320px] bg-zinc-900 text-[#111b21] flex flex-col shrink-0 overflow-y-auto border-l border-slate-200 relative z-20">
          <div className="p-8 flex flex-col items-center border-b border-slate-200 bg-white">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center font-bold text-xl uppercase text-[#111b21] mb-4 shadow-sm border border-blue-200">
              {activeContactInfo?.name ? activeContactInfo.name.substring(0,2) : activeContact.substring(0,2)}
            </div>
            <h3 className="font-bold text-center text-[15px] tracking-wide text-[#111b21]">{activeContactInfo?.name || 'CLIENTE'}</h3>
            <p className="text-[#54656f] text-xs mt-1 tracking-wider">{activeContact}</p>
          </div>
          
          <div className="p-6">
            
              <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4">
                <h4 className="text-[12px] font-bold text-[#111b21] flex items-center mb-3">
                  <Zap className="w-4 h-4 mr-1.5 text-amber-500" /> Acciones Rápidas
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => {
                      setNewMessage("¡Hola! Te dejo los datos de nuestra cuenta bancaria para realizar la transferencia:\n\nCBU: 00000031238918239123\nAlias: ADVENTURE.PRO\nBanco: Galicia\n\nPor favor, enviame el comprobante por acá cuando la realices. ¡Gracias!");
                    }}
                    className="flex items-center text-left bg-zinc-900 border border-slate-200 hover:border-blue-400 hover:bg-[#f0f2f5] text-[11px] font-bold text-zinc-200 px-3 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-[#111b21] flex items-center justify-center mr-2"><CheckCircle className="w-3.5 h-3.5" /></span>
                    Enviar Datos Bancarios
                  </button>

                  <button 
                    onClick={() => {
                      setFuReason(copilotData?.extracted_data?.carrera_interes || 'Seguimiento general');
                      setShowFollowUpModal(true);
                    }}
                    className="flex items-center text-left bg-zinc-900 border border-slate-200 hover:border-green-400 hover:bg-green-50 text-[11px] font-bold text-zinc-200 px-3 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2"><Clock className="w-3.5 h-3.5" /></span>
                    Agendar Seguimiento
                  </button>
                </div>
              </div>

{copilotData && (
              <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[12px] font-bold text-indigo-800 flex items-center">
                    <BrainCircuit className="w-4 h-4 mr-1.5 text-indigo-600" /> Copiloto de Ventas
                  </h4>
                  <div className="flex items-center bg-zinc-900 px-2 py-1 rounded-md border border-indigo-100 shadow-sm">
                    <span className="text-[10px] font-bold text-[#54656f] mr-1.5">Termómetro:</span>
                    <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${copilotData.lead_score > 70 ? 'bg-green-500' : copilotData.lead_score > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${copilotData.lead_score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {copilotData.extracted_data && (
                  <div className="mb-4 bg-zinc-900 rounded-lg p-3 border border-indigo-100 text-[11px]">
                    <p className="font-bold text-zinc-200 mb-1 flex items-center"><Zap className="w-3 h-3 mr-1 text-amber-500" /> Datos Extraídos:</p>
                    <div className="grid grid-cols-2 gap-2 text-zinc-300">
                      <div><span className="text-[#54656f]">Carrera:</span> {copilotData.extracted_data.carrera_interes || '-'}</div>
                      <div><span className="text-[#54656f]">Distancia:</span> {copilotData.extracted_data.distancia || '-'}</div>
                      <div className="col-span-2"><span className="text-[#54656f]">Interés:</span> {copilotData.extracted_data.intent_summary || '-'}</div>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-bold text-[#54656f] mb-2">Sugerencias de respuesta:</p>
                  <div className="space-y-1.5">
                    {copilotData.suggested_replies?.map((reply: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setNewMessage(reply)}
                        className="w-full text-left bg-zinc-900 hover:bg-indigo-600 hover:text-[#111b21] hover:border-indigo-600 text-zinc-200 text-[11px] p-2 rounded-lg border border-slate-200 transition-colors shadow-sm"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeContactInfo?.invoices && activeContactInfo.invoices.length > 0 && (
              <>
                <h4 className="text-[11px] font-bold text-[#54656f] tracking-[0.2em] flex items-center mb-5 uppercase">
                  <Package className="w-3.5 h-3.5 mr-2" />
                  Facturas ({activeContactInfo.invoices.length})
                </h4>
            
            <div className="space-y-4">
              {activeContactInfo.invoices.map((inv: any, idx: number) => (
                <div key={idx} className="bg-zinc-900 border border-slate-200 rounded-xl p-4 transition-all hover:border-blue-300 hover:shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f0f2f5]0 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] font-bold text-[#111b21] tracking-wider">FA-{inv.id.substring(0,6).toUpperCase()}</span>
                    <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-[4px] tracking-wider">PENDIENTE</span>
                  </div>
                  
                  <div className="space-y-2 text-[12px] text-zinc-300">
                    <p className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-[#54656f] font-medium">Motivo:</span>
                      <span className="truncate max-w-[140px] font-medium text-zinc-200" title={Array.isArray(inv.items) ? inv.items.join(', ') : inv.items || 'Detalles'}>
                        {Array.isArray(inv.items) ? inv.items[0] : (inv.items || 'Detalles').split(',')[0]}
                      </span>
                    </p>
                    <p className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-[#54656f] font-medium">Total:</span>
                      <span className="font-bold text-[#111b21]">${inv.amount}</span>
                    </p>
                    <p className="flex justify-between pb-1">
                      <span className="text-[#54656f] font-medium">Fecha:</span>
                      <span className="text-zinc-300">{inv.purchase_date}</span>
                    </p>
                  </div>
                  
                  {inv.file_url && (
                    <a href={inv.file_url} target="_blank" rel="noreferrer" className="mt-4 w-full py-2.5 rounded-lg border border-blue-200 text-[#111b21] text-[10px] font-bold tracking-[0.2em] flex items-center justify-center hover:bg-orange-600 hover:text-[#111b21] transition-all">
                      <ExternalLink className="w-3 h-3 mr-2" />
                      VER PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function FollowUps() {
  const { isSidebarOpen, showSystemModal } = React.useContext(AppContext);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Contact Panel state
  const [selectedFollowUp, setSelectedFollowUp] = useState<any>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTplPicker, setShowTplPicker] = useState(false);
  const [contactMsg, setContactMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchFollowUps();
    supabase.from('ng_templates').select('*').then(({ data }) => setTemplates(data || []));
  }, []);

  const fetchFollowUps = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ng_follow_ups')
      .select('*, ng_clients(id, name, phone)')
      .order('scheduled_date', { ascending: true });
    setFollowUps(data || []);
    setLoading(false);
  };

  const openContactPanel = async (f: any) => {
    setSelectedFollowUp(f);
    setPanelOpen(true);
    setContactMsg('');
    // Fetch last invoices for this client
    if (f.client_id) {
      const { data } = await supabase.from('ng_invoices').select('*').eq('client_id', f.client_id).order('created_at', { ascending: false }).limit(3);
      setClientInvoices(data || []);
    }
  };

  const applyTemplate = (tpl: any) => {
    const client = selectedFollowUp?.ng_clients;
    const lastInv = clientInvoices[0];
    let body = tpl.body;
    body = body.replace(/\{\{nombre\}\}/gi, client?.name || 'Cliente');
    body = body.replace(/\{\{productos\}\}/gi, lastInv?.items ? (Array.isArray(lastInv.items) ? lastInv.items.join(', ') : lastInv.items) : 'productos');
    body = body.replace(/\{\{fecha\}\}/gi, new Date().toLocaleDateString('es-AR'));
    body = body.replace(/\{\{importe\}\}/gi, lastInv?.amount ? `$${lastInv.amount}` : '$0');
    setContactMsg(body);
    setShowTplPicker(false);
  };

  const handleSendFollowUpMsg = async () => {
    if (!contactMsg.trim() || !selectedFollowUp?.ng_clients?.phone) return;
    setSending(true);
    const phone = selectedFollowUp.ng_clients.phone;

    // Save to DB
    await supabase.from('ng_whatsapp_messages').insert([{
      client_phone: phone, body: contactMsg, direction: 'outgoing', message_type: 'text'
    }]);

    // Send via BuilderBot
    const builderBotUrl = import.meta.env.VITE_BUILDERBOT_API_URL;
    const builderBotKey = import.meta.env.VITE_BUILDERBOT_API_KEY;
    const builderBotBotId = import.meta.env.VITE_BUILDERBOT_BOT_ID;
    if (builderBotUrl && builderBotKey) {
      try {
        await fetch(`${builderBotUrl}/${builderBotBotId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-builderbot': builderBotKey },
          body: JSON.stringify({ number: phone, messages: { content: contactMsg } })
        });
      } catch (err) { console.error(err); }
    }

    // Mark as completed
    await supabase.from('ng_follow_ups').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', selectedFollowUp.id);
    
    showSystemModal('Mensaje enviado', `Se envió el mensaje a ${selectedFollowUp.ng_clients?.name || phone} y el seguimiento fue marcado como completado.`, 'success');
    setSending(false);
    setPanelOpen(false);
    fetchFollowUps();
  };

  const markComplete = async (id: string) => {
    await supabase.from('ng_follow_ups').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id);
    fetchFollowUps();
  };

  const markCancelled = async (id: string) => {
    await supabase.from('ng_follow_ups').update({ status: 'cancelled' }).eq('id', id);
    fetchFollowUps();
  };

  const filtered = followUps.filter(f => filterStatus === 'all' || f.status === filterStatus);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      'pending': 'bg-amber-100 text-amber-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = { 'pending': 'Pendiente', 'completed': 'Completado', 'cancelled': 'Cancelado' };
    return <span className={`${map[status] || 'bg-zinc-800 text-zinc-300'} text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>{labels[status] || status}</span>;
  };

  const daysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return <span className="text-red-500 font-bold text-[12px]">Vencido hace {Math.abs(diff)} días</span>;
    if (diff === 0) return <span className="text-amber-600 font-bold text-[12px]">Hoy</span>;
    return <span className="text-zinc-300 text-[12px]">En {diff} días</span>;
  };

  return (
    <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} min-h-screen bg-zinc-950 flex flex-col`}>
      <TopBar title="Adventure Pro" subtitle="Seguimientos Programados" />
      <main className="px-10 py-6 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#111b21]">Seguimientos</h2>
              <p className="text-[13px] text-[#54656f]">Contactos agendados automáticamente tras cargar facturas</p>
            </div>
          </div>
          <div className="flex items-center bg-zinc-900 rounded-xl border border-slate-200 p-1 shadow-sm">
            {[{k:'all',l:'Todos'},{k:'pending',l:'Pendientes'},{k:'completed',l:'Completados'},{k:'cancelled',l:'Cancelados'}].map(f => (
              <button key={f.k} onClick={() => setFilterStatus(f.k)} className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${filterStatus === f.k ? 'bg-orange-600 text-[#111b21] shadow-sm' : 'text-[#54656f] hover:bg-[#f5f6f6]'}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
            <p className="text-[12px] font-bold text-[#54656f] uppercase tracking-wider mb-1">Total</p>
            <p className="text-[28px] font-extrabold text-[#111b21]">{followUps.length}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
            <p className="text-[12px] font-bold text-amber-500 uppercase tracking-wider mb-1">Pendientes</p>
            <p className="text-[28px] font-extrabold text-amber-600">{followUps.filter(f => f.status === 'pending').length}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
            <p className="text-[12px] font-bold text-green-500 uppercase tracking-wider mb-1">Completados</p>
            <p className="text-[28px] font-extrabold text-green-600">{followUps.filter(f => f.status === 'completed').length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Teléfono</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Motivo</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Observaciones</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Fecha Programada</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Tiempo</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-4 text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[#54656f] text-[14px]">Cargando seguimientos...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[#54656f] text-[14px]">No hay seguimientos {filterStatus !== 'all' ? `con estado "${filterStatus}"` : ''}</td></tr>
                ) : filtered.map((f: any) => (
                  <tr key={f.id} onClick={() => openContactPanel(f)} className="border-b border-slate-50 hover:bg-[#f0f2f5]/40 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img src="/images.png" alt="" className="w-8 h-8 rounded-full object-cover mr-3 border border-slate-200" />
                        <span className="text-[14px] font-bold text-[#111b21]">{f.ng_clients?.name || 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-zinc-300 font-medium">{f.ng_clients?.phone || '—'}</td>
                    <td className="px-6 py-4 text-[13px] text-zinc-300 font-medium">{f.reason}</td>
                    <td className="px-6 py-4 text-[12px] text-[#54656f] max-w-[180px] truncate" title={f.observations || ''}>{f.observations || <span className="text-slate-300">—</span>}</td>
                    <td className="px-6 py-4 text-[13px] text-zinc-200 font-bold">{new Date(f.scheduled_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4">{daysUntil(f.scheduled_date)}</td>
                    <td className="px-6 py-4">{statusBadge(f.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {f.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openContactPanel(f); }} className="bg-[#f0f2f5] hover:bg-orange-100 text-[#111b21] p-2 rounded-lg transition-colors" title="Contactar">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); markComplete(f.id); }} className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg transition-colors" title="Marcar completado">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); markCancelled(f.id); }} className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition-colors" title="Cancelar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* SLIDE-OVER CONTACT PANEL */}
      {panelOpen && selectedFollowUp && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPanelOpen(false)}></div>
          <div className="relative w-full max-w-[520px] bg-zinc-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <img src="/images.png" alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/30 mr-4" />
                <div>
                  <h3 className="text-[#111b21] font-bold text-[17px]">{selectedFollowUp.ng_clients?.name || 'Sin nombre'}</h3>
                  <p className="text-[#667781] text-[13px] font-medium">{selectedFollowUp.ng_clients?.phone || '—'}</p>
                </div>
              </div>
              <button onClick={() => setPanelOpen(false)} className="text-[#111b21]/70 hover:text-[#111b21] p-2 rounded-lg hover:bg-zinc-900/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Client Info Cards */}
            <div className="p-5 space-y-4 border-b border-slate-200 overflow-y-auto flex-shrink-0">
              {/* Follow-up info */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2">Seguimiento</p>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div><span className="text-[#54656f]">Motivo:</span> <span className="font-bold text-zinc-200">{selectedFollowUp.reason}</span></div>
                  <div><span className="text-[#54656f]">Fecha:</span> <span className="font-bold text-zinc-200">{new Date(selectedFollowUp.scheduled_date).toLocaleDateString('es-AR')}</span></div>
                  <div><span className="text-[#54656f]">Estado:</span> {statusBadge(selectedFollowUp.status)}</div>
                  <div>{daysUntil(selectedFollowUp.scheduled_date)}</div>
                </div>
                {selectedFollowUp.observations && (
                  <div className="mt-3 pt-3 border-t border-amber-200">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Observaciones</p>
                    <p className="text-[13px] text-zinc-200 leading-relaxed whitespace-pre-wrap">{selectedFollowUp.observations}</p>
                  </div>
                )}
              </div>

              {/* Last purchase */}
              {clientInvoices.length > 0 && (
                <div className="bg-[#f0f2f5] rounded-xl p-4 border border-orange-100">
                  <p className="text-[11px] font-bold text-[#111b21] uppercase tracking-wider mb-2">Última Compra</p>
                  {clientInvoices.slice(0, 1).map((inv: any, i: number) => (
                    <div key={i} className="text-[13px] space-y-1">
                      <div><span className="text-[#54656f]">Productos:</span> <span className="font-bold text-zinc-200">{Array.isArray(inv.items) ? inv.items.join(', ') : inv.items || '—'}</span></div>
                      <div><span className="text-[#54656f]">Importe:</span> <span className="font-extrabold text-green-700">${inv.amount || 0}</span></div>
                      <div><span className="text-[#54656f]">Fecha:</span> <span className="font-medium text-zinc-300">{new Date(inv.created_at).toLocaleDateString('es-AR')}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Composer (WhatsApp style) */}
            <div className="flex-1 flex flex-col p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-[#54656f] uppercase tracking-wider">Enviar Mensaje WhatsApp</p>
                <div className="relative">
                  <button onClick={() => setShowTplPicker(!showTplPicker)} className="bg-[#f0f2f5] hover:bg-orange-100 text-[#111b21] px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Plantillas
                  </button>
                  {showTplPicker && (
                    <div className="absolute right-0 top-10 bg-zinc-900 rounded-xl shadow-2xl border border-slate-200 w-[300px] max-h-[280px] overflow-y-auto z-50">
                      <div className="p-3 border-b border-slate-200 bg-white">
                        <p className="text-[11px] font-bold text-[#54656f] uppercase tracking-wider">Seleccioná una plantilla</p>
                      </div>
                      {templates.length === 0 ? (
                        <p className="p-4 text-[13px] text-[#54656f] text-center">No hay plantillas creadas</p>
                      ) : templates.map((tpl: any) => (
                        <button
                          key={tpl.id}
                          onClick={() => applyTemplate(tpl)}
                          className="w-full text-left px-4 py-3 hover:bg-[#f0f2f5] border-b border-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-[#111b21]">{tpl.shortcut}</span>
                            <span className="text-[10px] text-[#54656f] uppercase">{tpl.category}</span>
                          </div>
                          <p className="text-[12px] text-[#54656f] mt-1 line-clamp-2">{tpl.body.substring(0, 80)}...</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <textarea 
                value={contactMsg} 
                onChange={e => setContactMsg(e.target.value)}
                placeholder="Escribí tu mensaje para el cliente..."
                className="flex-1 w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-[#111b21] resize-none focus:outline-none focus:border-blue-400 bg-white min-h-[160px]"
              />
              <p className="text-[11px] text-[#54656f] mt-2 mb-4">{contactMsg.length} caracteres</p>

              <button 
                onClick={handleSendFollowUpMsg} 
                disabled={sending || !contactMsg.trim()}
                className="w-full bg-green-500 hover:bg-green-600 text-[#111b21] font-bold py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-[15px] disabled:opacity-50"
              >
                <MessageSquare className="w-5 h-5" />
                {sending ? 'Enviando...' : 'Enviar por WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Clients() {
  const { isSidebarOpen, showSystemModal } = React.useContext(AppContext);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [clientFollowUps, setClientFollowUps] = useState<any[]>([]);
  const [clientMsgCount, setClientMsgCount] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [generatingSummaries, setGeneratingSummaries] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ng_clients')
      .select('*')
      .order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);

    // Proactively generate summaries for clients without one
    const withoutSummary = (data || []).filter((c: any) => !c.ai_summary);
    if (withoutSummary.length > 0) {
      generateSummariesBackground();
    }
  };

  const generateSummariesBackground = async () => {
    setGeneratingSummaries(true);
    try {
      await supabase.functions.invoke('generate-client-summary', { body: {} });
      // Refresh clients to get the new summaries
      const { data } = await supabase.from('ng_clients').select('*').order('created_at', { ascending: false });
      setClients(data || []);
    } catch (e) {
      console.error('Error generating summaries:', e);
    }
    setGeneratingSummaries(false);
  };

  const refreshSingleSummary = async (clientId: string) => {
    try {
      await supabase.from('ng_clients').update({ ai_summary: null }).eq('id', clientId);
      await supabase.functions.invoke('generate-client-summary', { body: { clientId } });
      const { data } = await supabase.from('ng_clients').select('*').eq('id', clientId).single();
      if (data) {
        setClients(prev => prev.map(c => c.id === clientId ? data : c));
        if (selectedClient?.id === clientId) setSelectedClient(data);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const openClientPanel = async (client: any) => {
    setSelectedClient(client);
    setPanelOpen(true);
    setEditingName(false);

    // Fetch invoices
    const { data: invs } = await supabase.from('ng_invoices')
      .select('*').eq('client_id', client.id)
      .order('created_at', { ascending: false });
    setClientInvoices(invs || []);

    // Fetch follow-ups
    const { data: fus } = await supabase.from('ng_follow_ups')
      .select('*').eq('client_id', client.id)
      .order('scheduled_date', { ascending: false });
    setClientFollowUps(fus || []);

    // Count messages
    const { count } = await supabase.from('ng_whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('client_phone', client.phone);
    setClientMsgCount(count || 0);
  };

  const saveClientName = async () => {
    if (!editName.trim() || !selectedClient) return;
    const { error } = await supabase.from('ng_clients').update({ name: editName.trim() }).eq('id', selectedClient.id);
    if (error) {
      showSystemModal('Error guardando el nombre', 'Error guardando el nombre del cliente. Revisa las policies de la base de datos.', 'error');
      return;
    }
    const updated = { ...selectedClient, name: editName.trim() };
    setSelectedClient(updated);
    setClients(prev => prev.map(c => c.id === selectedClient.id ? updated : c));
    setEditingName(false);
    showSystemModal('Nombre actualizado', `El cliente ahora se llama "${editName.trim()}"`, 'success');
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q);
  });

  const totalInvoiceAmount = (invs: any[]) => invs.reduce((acc: number, i: any) => acc + (parseFloat(i.amount) || 0), 0);

  return (
    <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} min-h-screen bg-zinc-950 flex flex-col`}>
      <TopBar title="Adventure Pro" subtitle="Clientes" />
      <main className="px-10 py-6 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#111b21]">Clientes</h2>
              <p className="text-[13px] text-[#54656f]">Base de datos de todos los contactos · Resumen IA automático</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {generatingSummaries && (
              <span className="text-[11px] text-indigo-500 font-medium bg-indigo-50 px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Generando resúmenes IA...
              </span>
            )}
            <span className="text-[13px] font-medium text-[#54656f]">{clients.length} clientes</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
            <p className="text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-1">Total Clientes</p>
            <p className="text-[26px] font-extrabold text-[#111b21]">{clients.length}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
            <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Con Factura</p>
            <p className="text-[26px] font-extrabold text-indigo-600">{clients.filter(c => c.ai_summary && c.ai_summary.toLowerCase().includes('factura')).length || '—'}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
            <p className="text-[11px] font-bold text-green-500 uppercase tracking-wider mb-1">Con Resumen IA</p>
            <p className="text-[26px] font-extrabold text-green-600">{clients.filter(c => c.ai_summary).length}</p>
          </div>
          <div className="bg-zinc-900 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">Sin Resumen</p>
            <p className="text-[26px] font-extrabold text-amber-600">{clients.filter(c => !c.ai_summary).length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-zinc-900 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center">
            <div className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#54656f]" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o teléfono..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-[13px] font-medium text-zinc-200 focus:outline-none focus:bg-zinc-900 focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-12 text-center text-[#54656f] text-[14px]">Cargando clientes...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-[#54656f] text-[14px]">No se encontraron clientes</div>
            ) : filtered.map(client => (
              <div 
                key={client.id} 
                onClick={() => openClientPanel(client)}
                className="flex items-center px-6 py-4 hover:bg-[#f0f2f5]/40 transition-colors cursor-pointer group"
              >
                <img src="/images.png" alt="" className="w-10 h-10 rounded-full object-cover mr-4 border border-slate-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#111b21] truncate">{client.name || 'Sin nombre'}</p>
                  <p className="text-[12px] text-[#54656f] font-mono">{client.phone}</p>
                </div>
                {client.ai_summary ? (
                  <div className="flex-1 max-w-[400px] mx-4">
                    <p className="text-[12px] text-[#54656f] line-clamp-2 leading-relaxed italic">{client.ai_summary}</p>
                  </div>
                ) : (
                  <div className="flex-1 max-w-[400px] mx-4">
                    <span className="text-[11px] text-slate-300 italic">Sin resumen IA</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {client.ai_summary && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">IA</span>}
                  <Eye className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* SLIDE-OVER CLIENT DETAIL PANEL */}
      {panelOpen && selectedClient && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPanelOpen(false)}></div>
          <div className="relative w-full max-w-[580px] bg-zinc-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
            
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <img src="/images.png" alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/30 mr-4" />
                <div>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && saveClientName()}
                        className="bg-zinc-900/20 text-[#111b21] border border-white/30 rounded-lg px-3 py-1.5 text-[15px] font-bold focus:outline-none focus:bg-zinc-900/30 w-[200px]"
                        autoFocus
                      />
                      <button onClick={saveClientName} className="bg-zinc-900/20 hover:bg-zinc-900/30 text-[#111b21] p-1.5 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingName(false)} className="text-[#111b21]/60 hover:text-[#111b21] p-1.5 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#111b21] font-bold text-[17px]">{selectedClient.name || 'Sin nombre'}</h3>
                      <button onClick={() => { setEditName(selectedClient.name || ''); setEditingName(true); }} className="text-[#111b21]/50 hover:text-[#111b21] p-1 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3 text-indigo-200" />
                    <p className="text-indigo-100 text-[13px] font-mono">{selectedClient.phone}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setPanelOpen(false)} className="text-[#111b21]/70 hover:text-[#111b21] p-2 rounded-lg hover:bg-zinc-900/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* AI Summary Card */}
            <div className="p-5 border-b border-slate-200 flex-shrink-0">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Resumen Inteligente
                  </p>
                  <button onClick={() => refreshSingleSummary(selectedClient.id)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Regenerar
                  </button>
                </div>
                <p className="text-[13px] text-zinc-200 leading-relaxed">
                  {selectedClient.ai_summary || 'Resumen pendiente de generación...'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b border-slate-200 flex-shrink-0">
              <div className="bg-[#f0f2f5] rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Facturas</p>
                <p className="text-[20px] font-extrabold text-orange-700">{clientInvoices.length}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Facturado</p>
                <p className="text-[16px] font-extrabold text-green-700">{formatMoney(totalInvoiceAmount(clientInvoices))}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Mensajes</p>
                <p className="text-[20px] font-extrabold text-amber-700">{clientMsgCount}</p>
              </div>
            </div>

            {/* Invoices Section */}
            <div className="p-5 border-b border-slate-200 flex-shrink-0">
              <p className="text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5" /> Facturas Asociadas
              </p>
              {clientInvoices.length === 0 ? (
                <p className="text-[13px] text-[#54656f] italic">Sin facturas registradas</p>
              ) : clientInvoices.map((inv: any, idx: number) => (
                <div key={idx} className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-zinc-300">
                      {inv.invoice_number ? `Factura N° ${inv.invoice_number}` : `Factura #${idx + 1}`}
                    </span>
                    <span className="text-[14px] font-extrabold text-green-700">{formatMoney(inv.amount || 0)}</span>
                  </div>
                  <p className="text-[11px] text-[#54656f] mb-2">{inv.purchase_date ? new Date(inv.purchase_date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Sin fecha'}</p>
                  
                  {/* Products table for this invoice */}
                  {Array.isArray(inv.items) && inv.items.length > 0 && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden mt-2">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-zinc-900">
                            <th className="text-left px-3 py-2 text-[9px] font-bold text-[#54656f] uppercase">Cant.</th>
                            <th className="text-left px-3 py-2 text-[9px] font-bold text-[#54656f] uppercase">Producto</th>
                            <th className="text-right px-3 py-2 text-[9px] font-bold text-[#54656f] uppercase">Importe</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {inv.items.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="px-3 py-1.5 text-[12px] font-bold text-zinc-200">{typeof item === 'object' ? (item.qty || 1) : 1}</td>
                              <td className="px-3 py-1.5 text-[12px] text-zinc-200">{typeof item === 'object' ? item.description : item}</td>
                              <td className="px-3 py-1.5 text-[12px] font-mono text-right text-zinc-300">{typeof item === 'object' && item.total ? formatMoney(item.total) : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Follow-ups Section */}
            <div className="p-5 flex-shrink-0">
              <p className="text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Seguimientos
              </p>
              {clientFollowUps.length === 0 ? (
                <p className="text-[13px] text-[#54656f] italic">Sin seguimientos registrados</p>
              ) : clientFollowUps.map((fu: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${fu.status === 'pending' ? 'bg-amber-400' : fu.status === 'completed' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-zinc-200">{fu.reason}</p>
                    {fu.observations && <p className="text-[11px] text-[#54656f] italic truncate">{fu.observations}</p>}
                  </div>
                  <span className="text-[11px] text-[#54656f] flex-shrink-0">{new Date(fu.scheduled_date).toLocaleDateString('es-AR')}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${fu.status === 'pending' ? 'bg-amber-100 text-amber-700' : fu.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {fu.status === 'pending' ? 'Pendiente' : fu.status === 'completed' ? 'Completado' : 'Cancelado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Configuracion({ isSidebarOpen, userRole }: { isSidebarOpen: boolean, userRole: string | null }) {
  const location = useLocation();
  const { showSystemModal } = React.useContext(AppContext);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bot IA Config & Utilidades states
  const [botEnabled, setBotEnabled] = useState(true);
  const [botTrigger, setBotTrigger] = useState('edge');
  const [botPrompt, setBotPrompt] = useState('');
  const [originalBotPrompt, setOriginalBotPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [botSaving, setBotSaving] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const [productUploading, setProductUploading] = useState(false);
  const [botConfigLoading, setBotConfigLoading] = useState(true);
  const [productPreview, setProductPreview] = useState<any[] | null>(null);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [lastCatalogUpdate, setLastCatalogUpdate] = useState<string | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState<any>({
    empresa_nombre: 'Adventure Pro',
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
    fetchBotConfig();
    fetchPromptHistory();
    fetchProductCount();
  }, []);

  const fetchProductCount = async () => {
    try {
      const { count } = await supabase.from('ng_products').select('*', { count: 'exact', head: true }).neq('id', '00000000-0000-0000-0000-000000000000');
      setProductCount(count || 0);
      // Get last catalog update date
      const { data: lastProduct } = await supabase.from('ng_products').select('created_at').order('created_at', { ascending: false }).limit(1);
      if (lastProduct && lastProduct.length > 0) {
        setLastCatalogUpdate(new Date(lastProduct[0].created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Step 1: Parse Excel and show preview
  const handleProductUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProductUploading(true);
    
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      const products: any[] = [];
      // Auto-detect header row (look for 'Cód' or 'Articulo' in first cells)
      let headerRow = 0;
      for (let i = 0; i < Math.min(data.length, 5); i++) {
        const row = data[i];
        if (row && row.some((cell: any) => String(cell || '').toLowerCase().includes('art') || String(cell || '').toLowerCase().includes('cód'))) {
          headerRow = i;
          break;
        }
      }

      // Columnas esperadas: A=Cód.Art, B=Articulo, C=Marca, D=Medida, E=Cód.Alt, F=Precio, G=Cantidad
      for (let i = headerRow + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[0] || String(row[0]).toLowerCase().includes('total')) continue;
        
        const code = String(row[0]).trim();
        const fullName = row[1] ? String(row[1]).trim() : '';
        const brand = row[2] ? String(row[2]).trim() : '';
        const measure = row[3] ? String(row[3]).replace(/\s+/g, '') : '';
        const altCode = row[4] ? String(row[4]).trim() : null;
        const price = typeof row[5] === 'number' ? row[5] : parseFloat(String(row[5]).replace(/[^0-9.]/g, '')) || 0;
        const stock = typeof row[6] === 'number' ? row[6] : parseInt(String(row[6]).replace(/[^0-9]/g, '')) || 0;

        if (code && fullName) {
          products.push({ code, alt_code: altCode, name: fullName, brand, measure, price, stock });
        }
      }

      if (products.length === 0) {
        showSystemModal('Error', 'No se encontraron productos en el archivo. Verificá el formato.', 'error');
        setProductUploading(false);
        return;
      }

      // Show preview instead of uploading immediately
      setProductPreview(products.slice(0, 8));
      setPendingProducts(products);
    } catch (err: any) {
      console.error('Error uploading products:', err);
      showSystemModal('Error', 'Error procesando el archivo: ' + err.message, 'error');
    }
    setProductUploading(false);
    e.target.value = '';
  };

  // Step 2: Confirm and upload to DB
  const confirmProductUpload = async () => {
    if (pendingProducts.length === 0) return;
    setProductUploading(true);
    try {
      await supabase.from('ng_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      for (let i = 0; i < pendingProducts.length; i += 50) {
        const batch = pendingProducts.slice(i, i + 50);
        await supabase.from('ng_products').insert(batch);
      }
      setProductCount(pendingProducts.length);
      setLastCatalogUpdate(new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
      showSystemModal('Catálogo Actualizado', `Se importaron ${pendingProducts.length} productos correctamente. El bot ya tiene acceso a los precios actualizados.`, 'success');
    } catch (err: any) {
      console.error('Error uploading products:', err);
      showSystemModal('Error', 'Error subiendo productos a la base de datos: ' + err.message, 'error');
    }
    setProductUploading(false);
    setProductPreview(null);
    setPendingProducts([]);
  };

  const cancelProductUpload = () => {
    setProductPreview(null);
    setPendingProducts([]);
  };

  const fetchBotConfig = async () => {
    setBotConfigLoading(true);
    try {
      const { data, error } = await supabase.from('ng_bot_config').select('key, value');
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((c: any) => { map[c.key] = c.value; });
      setBotEnabled(map['bot_enabled'] === 'true');
      setBotTrigger(map['bot_trigger'] || '');
      setBotPrompt(map['system_prompt'] || '');
      setOriginalBotPrompt(map['system_prompt'] || '');
    } catch (e: any) {
      console.error('Error fetching bot config:', e);
      showSystemModal('Error de Conexión', 'No se pudo cargar la configuración del Bot IA. Verificá que las tablas existan en Supabase.\n\nDetalle: ' + (e?.message || 'Error desconocido'), 'error');
    }
    setBotConfigLoading(false);
  };

  const saveBotConfig = async () => {
    setBotSaving(true);
    try {
      const upserts = [
        { key: 'bot_enabled', value: botEnabled ? 'true' : 'false' },
        { key: 'bot_trigger', value: botTrigger },
        { key: 'system_prompt', value: botPrompt }
      ];
      for (const u of upserts) {
        const { error } = await supabase.from('ng_bot_config').upsert(u, { onConflict: 'key' });
        if (error) throw error;
      }

      if (originalBotPrompt !== botPrompt) {
        const { error } = await supabase.from('ng_prompt_history').insert({
          old_prompt: originalBotPrompt,
          new_prompt: botPrompt,
          username: localStorage.getItem('crm_username') || 'Admin'
        });
        if (error) throw error;
        setOriginalBotPrompt(botPrompt);
        fetchPromptHistory(); // Auto-refresh history
      }
      showSystemModal("¡Éxito!", "Configuración de IA Guardada correctamente.", "success");
    } catch (e: any) { 
      console.error(e);
      showSystemModal("Error al guardar", e.message || "Verifica la base de datos.", "error");
    }
    setBotSaving(false);
  };

  const fetchPromptHistory = async () => {
    setFetchingHistory(true);
    try {
      const { data } = await supabase.from('ng_prompt_history').select('*').order('created_at', { ascending: false }).limit(50);
      setPromptHistory(data || []);
    } catch(e) { console.error(e); }
    setFetchingHistory(false);
  };

  const handleRollbackPrompt = (oldPrompt: string) => {
    setBotPrompt(oldPrompt);
    setActiveTab('bot-ia');
  };

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
      <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} min-h-screen bg-zinc-950 flex flex-col items-center justify-center`}>
        <Lock className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-zinc-200">Acceso Restringido</h2>
        <p className="text-[#54656f] mt-2">No tienes permisos de Administrador para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className={`flex-1 transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} min-h-screen bg-zinc-950 flex flex-col`}>
      <TopBar title="Adventure Pro" subtitle="Centro de Control & Configuración" />
      
      <main className="px-10 py-6 w-full flex gap-8">
        {/* Sidebar Nav */}
        <div className="w-[240px] shrink-0 space-y-1">
          <button onClick={() => setActiveTab('general')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'general' ? 'bg-zinc-900 text-[#111b21] border border-slate-200/60 shadow-sm' : 'text-[#54656f] hover:bg-zinc-900/50 hover:text-zinc-200'}`}>
            <Settings className="w-4 h-4" /> General
          </button>
          <button onClick={() => setActiveTab('bot-ia')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'bot-ia' ? 'bg-zinc-900 text-[#111b21] border border-slate-200/60 shadow-sm' : 'text-[#54656f] hover:bg-zinc-900/50 hover:text-zinc-200'}`}>
            <MessageSquare className="w-4 h-4" /> Bot IA
          </button>
          <button onClick={() => setActiveTab('whatsapp')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'whatsapp' ? 'bg-zinc-900 text-[#111b21] border border-slate-200/60 shadow-sm' : 'text-[#54656f] hover:bg-zinc-900/50 hover:text-zinc-200'}`}>
            <MessageSquare className="w-4 h-4" /> WhatsApp API
          </button>
          <button onClick={() => setActiveTab('seguimientos')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'seguimientos' ? 'bg-zinc-900 text-[#111b21] border border-slate-200/60 shadow-sm' : 'text-[#54656f] hover:bg-zinc-900/50 hover:text-zinc-200'}`}>
            <Clock className="w-4 h-4" /> Seguimientos
          </button>
          <button onClick={() => setActiveTab('plantillas')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'plantillas' ? 'bg-zinc-900 text-[#111b21] border border-slate-200/60 shadow-sm' : 'text-[#54656f] hover:bg-zinc-900/50 hover:text-zinc-200'}`}>
            <FileText className="w-4 h-4" /> Plantillas Rápidas
          </button>
          <button onClick={() => setActiveTab('utilidades')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'utilidades' ? 'bg-zinc-900 text-[#111b21] border border-slate-200/60 shadow-sm' : 'text-[#54656f] hover:bg-zinc-900/50 hover:text-zinc-200'}`}>
            <History className="w-4 h-4" /> Utilidades & Logs
          </button>
          <button onClick={() => setActiveTab('equipo')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'equipo' ? 'bg-zinc-900 text-[#111b21] border border-slate-200/60 shadow-sm' : 'text-[#54656f] hover:bg-zinc-900/50 hover:text-zinc-200'}`}>
            <Users className="w-4 h-4" /> Equipo / Permisos
          </button>
          <button onClick={() => setActiveTab('apariencia')} className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-3 ${activeTab === 'apariencia' ? 'bg-zinc-900 text-[#111b21] border border-slate-200/60 shadow-sm' : 'text-[#54656f] hover:bg-zinc-900/50 hover:text-zinc-200'}`}>
            <Sparkles className="w-4 h-4" /> Apariencia
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-900 border border-slate-200/60 rounded-2xl p-8 relative overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#065F46]/20 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

          {activeTab === 'general' && (
            <div className="animate-in fade-in space-y-8">
              <div>
                <h3 className="text-xl font-bold text-[#111b21] mb-2">Datos de Empresa</h3>
                <p className="text-[#54656f] text-sm mb-6">Información básica que se usa en resúmenes y encabezados.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">Nombre de Fantasía</label>
                    <input type="text" value={settings.empresa_nombre} onChange={e => setSettings({...settings, empresa_nombre: e.target.value})} onBlur={() => saveSetting('empresa_nombre', settings.empresa_nombre)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111b21] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">Sucursal / Ubicación</label>
                    <input type="text" value={settings.empresa_sucursal} onChange={e => setSettings({...settings, empresa_sucursal: e.target.value})} onBlur={() => saveSetting('empresa_sucursal', settings.empresa_sucursal)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111b21] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all" />
                  </div>
                </div>
              </div>            </div>
          )}

          {activeTab === 'bot-ia' && (
            <div className="animate-in fade-in space-y-8">
              {botConfigLoading ? (
                /* Loading Skeleton */
                <div className="space-y-6 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-6 bg-zinc-700 rounded w-64 mb-2"></div>
                      <div className="h-4 bg-zinc-800 rounded w-96"></div>
                    </div>
                    <div className="w-20 h-6 bg-zinc-700 rounded-full"></div>
                  </div>
                  <div className="h-10 bg-zinc-800 rounded-xl w-1/2"></div>
                  <div className="h-40 bg-zinc-800 rounded-xl"></div>
                  <div className="h-24 bg-zinc-800 rounded-xl"></div>
                </div>
              ) : (
                <>
                  {/* Header con Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                       <h3 className="text-xl font-bold text-[#111b21] mb-2">Bot de Inteligencia Artificial</h3>
                       <p className="text-[#54656f] text-sm">Controla la personalidad del bot y sus disparadores automáticos (triggers).</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={botEnabled} onChange={e => setBotEnabled(e.target.checked)} className="sr-only peer" />
                      <div className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-900 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white ${botEnabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      <span className={`ml-3 text-sm font-bold ${botEnabled ? 'text-green-700' : 'text-[#54656f]'}`}>{botEnabled ? 'Activado' : 'Apagado'}</span>
                    </label>
                  </div>

                  {/* Status banner */}
                  <div className={`flex items-center px-4 py-3 rounded-xl text-[12px] font-bold border ${botEnabled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${botEnabled ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    {botEnabled ? 'El bot está respondiendo mensajes entrantes en WhatsApp automáticamente.' : 'El bot está apagado. Los mensajes entrantes no recibirán respuesta automática.'}
                  </div>

                  {/* Trigger */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">Palabra Clave (Trigger)</label>
                      <input type="text" value={botTrigger} onChange={e => setBotTrigger(e.target.value)} placeholder="Ej: asistente, edge (vacío = responde siempre)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111b21] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all" />
                      <p className="text-[10px] text-[#54656f] mt-1.5">Si está vacío, el bot responde a todos los mensajes. Si tiene valor, solo responde cuando el mensaje contiene esa palabra.</p>
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div className="pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[14px] font-bold text-[#111b21]">System Prompt Principal</h3>
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg ${botPrompt.length > 2000 ? 'bg-amber-100 text-amber-700' : 'bg-zinc-800 text-[#54656f]'}`}>
                        {botPrompt.length} caracteres
                      </span>
                    </div>
                    <p className="text-[12px] text-[#54656f] mb-4">Instrucciones vitales de cómo debe presentarse y pensar el asistente GPT cada vez que contesta.</p>
                    <textarea rows={12} value={botPrompt} onChange={e => setBotPrompt(e.target.value)} placeholder="Sos el asesor virtual de Adventure Pro..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111b21] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all resize-none shadow-sm font-mono leading-relaxed" />
                    {botPrompt !== originalBotPrompt && (
                      <div className="flex items-center mt-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <AlertCircle className="w-3.5 h-3.5 mr-2 shrink-0" />
                        Tenés cambios sin guardar en el prompt.
                      </div>
                    )}
                  </div>

                  {/* Catálogo de Precios */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-slate-50 mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-[14px] font-bold text-[#111b21] flex items-center">
                          <Package className="w-4 h-4 mr-2 text-green-600" />
                          Catálogo de Precios
                        </h3>
                        <p className="text-[11px] text-[#54656f] mt-0.5">El bot usa estos precios para cotizar automáticamente</p>
                        {lastCatalogUpdate && (
                          <p className="text-[10px] text-orange-500 mt-1 font-medium">Última actualización: {lastCatalogUpdate}</p>
                        )}
                      </div>
                      <div className={`text-[12px] font-bold px-3 py-1.5 rounded-lg ${productCount > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {productCount} productos
                      </div>
                    </div>
                    
                    {/* Product Preview Table */}
                    {productPreview && productPreview.length > 0 ? (
                      <div className="space-y-3 mt-4">
                        <div className="bg-[#f0f2f5] border border-blue-200 rounded-xl px-4 py-3 flex items-center text-[12px] font-bold text-orange-700">
                          <Info className="w-4 h-4 mr-2 shrink-0" />
                          Se detectaron {pendingProducts.length} productos. Revisá la vista previa y confirmá la carga.
                        </div>
                        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[260px] overflow-y-auto">
                          <table className="w-full text-[12px]">
                            <thead className="bg-white sticky top-0">
                              <tr>
                                <th className="text-left px-3 py-2 font-bold text-[#54656f] uppercase text-[10px]">Código</th>
                                <th className="text-left px-3 py-2 font-bold text-[#54656f] uppercase text-[10px]">Producto</th>
                                <th className="text-left px-3 py-2 font-bold text-[#54656f] uppercase text-[10px]">Marca</th>
                                <th className="text-right px-3 py-2 font-bold text-[#54656f] uppercase text-[10px]">Precio</th>
                                <th className="text-right px-3 py-2 font-bold text-[#54656f] uppercase text-[10px]">Stock</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {productPreview.map((p: any, i: number) => (
                                <tr key={i} className="hover:bg-[#f0f2f5]/40">
                                  <td className="px-3 py-2 font-mono text-[#54656f]">{p.code}</td>
                                  <td className="px-3 py-2 font-medium text-[#111b21] truncate max-w-[220px]">{p.name}</td>
                                  <td className="px-3 py-2 text-zinc-300">{p.brand || '—'}</td>
                                  <td className="px-3 py-2 font-mono font-bold text-[#111b21] text-right">{formatMoney(p.price)}</td>
                                  <td className="px-3 py-2 font-bold text-right">{p.stock}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {pendingProducts.length > 8 && (
                          <p className="text-[10px] text-[#54656f] text-center">Mostrando 8 de {pendingProducts.length} productos...</p>
                        )}
                        <div className="flex gap-3">
                          <button onClick={cancelProductUpload} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl text-[12px] transition-all border border-slate-200">
                            Cancelar
                          </button>
                          <button onClick={confirmProductUpload} disabled={productUploading} className="flex-1 bg-green-600 hover:bg-green-700 text-[#111b21] font-bold py-3 rounded-xl text-[12px] transition-all shadow-md flex items-center justify-center disabled:opacity-50">
                            {productUploading ? (
                              <><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Subiendo...</>
                            ) : (
                              <><CheckCircle className="w-4 h-4 mr-2" /> Confirmar Carga ({pendingProducts.length} productos)</>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <label className={`flex-1 flex items-center justify-center border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition-all ${productUploading ? 'border-blue-300 bg-[#f0f2f5]' : 'border-slate-200 hover:border-blue-400 hover:bg-[#f0f2f5]'}`}>
                          <input 
                            type="file" 
                            accept=".xls,.xlsx" 
                            onChange={handleProductUpload} 
                            className="hidden" 
                            disabled={productUploading}
                          />
                          {productUploading ? (
                            <>
                              <RefreshCw className="w-4 h-4 text-orange-500 animate-spin mr-2" />
                              <span className="text-[12px] text-[#111b21] font-bold">Leyendo archivo...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-5 h-5 text-[#54656f] mr-2" />
                              <div className="text-left">
                              <span className="text-[12px] text-zinc-300 font-bold block">Subir archivo de precios</span>
                                <span className="text-[10px] text-[#54656f]">Columnas: Cód.Art | Articulo | Marca | Medida | Cód.Alt | Precio | Cantidad</span>
                              </div>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2">
                     <button onClick={() => setBotPrompt(originalBotPrompt)} disabled={botPrompt === originalBotPrompt} className={`px-6 py-3 rounded-xl font-bold text-[12px] transition-all flex items-center ${botPrompt !== originalBotPrompt ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 hover:text-amber-700 shadow-sm' : 'bg-white text-[#54656f] border border-slate-200 opacity-50 cursor-not-allowed'}`}>
                       <RotateCcw className="w-3.5 h-3.5 mr-2" />
                       Deshacer Cambios (Volver Atrás)
                     </button>
                     <button onClick={saveBotConfig} disabled={botSaving} className="bg-orange-600 hover:bg-orange-700 text-[#111b21] font-extrabold px-6 py-3 rounded-xl shadow-md transition-all text-[12px] flex items-center disabled:opacity-50">
                       {botSaving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> Guardando...</> : <><Check className="w-3.5 h-3.5 mr-2" /> Guardar Configuración</>}
                     </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'utilidades' && (
            <div className="animate-in fade-in space-y-6 max-h-[70vh] overflow-hidden flex flex-col">
              <div className="shrink-0 mb-4">
                <h3 className="text-xl font-bold text-[#111b21] mb-2">Utilidades y Auditoría</h3>
                <p className="text-[#54656f] text-sm">Registro de cambios (logs) y sistema de reversionado de prompts de IA.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl flex-1 flex flex-col overflow-hidden">
                <div className="bg-zinc-900 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                  <h4 className="text-[14px] font-bold text-[#111b21] flex items-center"><History className="w-4 h-4 mr-2 text-orange-500" /> Historial de Prompts (Reversionado)</h4>
                  <span className="text-[11px] bg-[#f0f2f5] text-[#111b21] font-bold px-3 py-1 rounded-full border border-blue-200">{promptHistory.length} registros</span>
                </div>
                
                {fetchingHistory ? (
                  <div className="p-12 text-center text-[#54656f] font-mono tracking-widest uppercase text-[12px]"><RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3 text-orange-500/50" /> Leyendo base de datos...</div>
                ) : promptHistory.length === 0 ? (
                  <div className="p-12 text-center text-[#54656f] font-medium text-[13px]">No hay registros históricos aún.</div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                     <div className="divide-y divide-slate-200">
                        {promptHistory.map((hist, i) => (
                           <div key={hist.id || i} className="p-6 hover:bg-zinc-900 transition-colors group">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-orange-100 border border-blue-200 flex items-center justify-center text-[13px] font-bold text-orange-700 shadow-sm">{hist.username?.charAt(0) || 'A'}</div>
                                   <div>
                                     <p className="text-[14px] font-bold text-[#111b21]">{hist.username || 'Admin'}</p>
                                     <p className="text-[11px] text-[#54656f] font-mono uppercase tracking-wider">{new Date(hist.created_at).toLocaleString('es-AR')}</p>
                                   </div>
                                </div>
                                <button onClick={() => handleRollbackPrompt(hist.old_prompt)} className="opacity-0 group-hover:opacity-100 bg-orange-100 hover:bg-orange-600 hover:text-[#111b21] text-orange-700 text-[11px] font-bold px-4 py-2 rounded-lg flex items-center transition-all shadow-sm border border-blue-200 uppercase tracking-widest">
                                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Revertir Cambios
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-6 mt-4">
                                 <div>
                                   <p className="text-[10px] font-bold text-[#54656f] mb-2 uppercase tracking-widest flex items-center"><X className="w-3 h-3 text-red-500 mr-2" /> Prompt Anterior</p>
                                   <div className="bg-zinc-900 text-zinc-300 text-[12px] p-4 rounded-xl border border-slate-200 h-[160px] overflow-y-auto font-mono whitespace-pre-wrap shadow-sm">{hist.old_prompt || '(Vacío)'}</div>
                                 </div>
                                 <div>
                                   <p className="text-[10px] font-bold text-emerald-600 mb-2 uppercase tracking-widest flex items-center"><Check className="w-3 h-3 text-emerald-500 mr-2" /> Prompt Modificado</p>
                                   <div className="bg-emerald-50 text-emerald-700 text-[12px] p-4 rounded-xl border border-emerald-200 h-[160px] overflow-y-auto font-mono whitespace-pre-wrap shadow-sm">{hist.new_prompt}</div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="animate-in fade-in space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#111b21] mb-2">Conexión con BuilderBot</h3>
                <p className="text-[#54656f] text-sm mb-6">Configuración del proveedor de WhatsApp oficial (Cloud API v2).</p>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#f0f2f5] flex items-center justify-center border border-blue-200">
                      <MessageSquare className="w-6 h-6 text-[#111b21]" />
                    </div>
                    <div>
                      <h4 className="text-[#111b21] font-bold text-base">API BuilderBot</h4>
                      <p className="text-[#54656f] text-sm font-mono mt-1">Host configurado: {settings.builderbot_url || 'https://app.builderbot.cloud'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold uppercase">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Estado Activo
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">URL Base de API (Endpoint)</label>
                    <input type="text" value={settings.builderbot_url || ''} onChange={e => setSettings({...settings, builderbot_url: e.target.value})} onBlur={() => saveSetting('builderbot_url', settings.builderbot_url)} placeholder="https://api.builderbot.cloud" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111b21] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">Token de Acceso (API Key)</label>
                    <input type="password" value={settings.builderbot_token || ''} onChange={e => setSettings({...settings, builderbot_token: e.target.value})} onBlur={() => saveSetting('builderbot_token', settings.builderbot_token)} placeholder="Bearer token..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111b21] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">Número de Teléfono (Instancia)</label>
                    <input type="text" value={settings.builderbot_phone || ''} onChange={e => setSettings({...settings, builderbot_phone: e.target.value})} onBlur={() => saveSetting('builderbot_phone', settings.builderbot_phone)} placeholder="5491100000000" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111b21] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all font-mono" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'seguimientos' && (
            <div className="animate-in fade-in space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#111b21] mb-2">Periodos de Seguimiento</h3>
                <p className="text-[#54656f] text-sm mb-6">Definí los intervalos rápidos que se sugieren al agendar una alerta.</p>
                <div>
                  <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">Días Sugeridos (Separados por coma)</label>
                  <input type="text" value={settings.seguimiento_dias} onChange={e => setSettings({...settings, seguimiento_dias: e.target.value})} onBlur={() => saveSetting('seguimiento_dias', settings.seguimiento_dias)} placeholder="Ej: 30, 60, 90" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#111b21] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipo' && (
            <div className="animate-in fade-in space-y-6 text-center py-12">
              <Users className="w-20 h-20 text-slate-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[#111b21] mb-2">Gestión de Perfiles y Roles</h3>
              <p className="text-[#54656f] text-sm max-w-lg mx-auto">
                Los usuarios (Vendedores/Admins) se dan de alta directamente a través del panel de Supabase Auth para mantener la integridad criptográfica de las contraseñas.
              </p>
              <div className="mt-8 flex justify-center">
                <a href="https://supabase.com/dashboard/project/_/auth/users" target="_blank" rel="noreferrer" className="bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-full text-[14px] font-bold hover:bg-red-500 hover:text-[#111b21] transition-colors flex items-center gap-2 shadow-sm">
                  Ir a Supabase Auth <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div className="animate-in fade-in space-y-6 text-center py-12">
              <Sparkles className="w-20 h-20 text-blue-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-[#111b21] mb-2">Diseño Estándar Ligero</h3>
              <p className="text-[#54656f] text-sm max-w-lg mx-auto">
                El entorno está actualmente configurado en el sistema de diseño <strong>Light Standard</strong>. Este tema asegura armonía con el resto de los componentes y una experiencia fluida.
              </p>
            </div>
          )}

          {activeTab === 'plantillas' && (
            <div className="animate-in fade-in h-max">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-[#111b21]">Plantillas Rápidas</h3>
                  <p className="text-[#54656f] text-sm mt-1">Configurá fragmentos que te ahorrarán tiempo de tipear al chatear.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center shadow-sm">
                  <span className="text-sm font-medium text-zinc-300 mr-4">{templates.length} plantillas</span>
                  <div className="h-6 w-px bg-zinc-700 mr-4"></div>
                  <Package className="w-4 h-4 text-[#54656f]" />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-8">
                {/* Formulario Nueva */}
                <div className="col-span-12 lg:col-span-5 relative">
                  <div className="bg-zinc-900 rounded-2xl p-6 border border-slate-200 sticky top-6 shadow-sm relative z-10 overflow-hidden">
                    <h3 className="text-[14px] font-bold text-[#111b21] mb-5 flex items-center gap-2">
                      <PenLine className="w-4 h-4 text-orange-500" />
                      Crear nueva
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">Comando rápido</label>
                        <input type="text" value={newTemplate.shortcut} onChange={e => setNewTemplate({...newTemplate, shortcut: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] font-bold text-[#111b21] focus:border-orange-500 focus:outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">Categoría</label>
                        <select value={newTemplate.category} onChange={e => setNewTemplate({...newTemplate, category: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-zinc-200 focus:border-orange-500 focus:outline-none transition-all">
                          <option>General</option>
                          <option>Seguimiento</option>
                          <option>Ventas</option>
                          <option>Soporte</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-[#54656f] uppercase tracking-wider mb-2">Mensaje e incrustaciones</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {['nombre', 'productos', 'importe', 'fecha'].map(vr => (
                            <button key={vr} onClick={() => setNewTemplate({...newTemplate, body: newTemplate.body + `{{${vr}}}`})} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[#111b21] text-[11px] font-bold hover:border-blue-400 hover:bg-[#f0f2f5] transition-colors">
                              {`{{${vr}}}`}
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={4}
                          value={newTemplate.body}
                          onChange={e => setNewTemplate({...newTemplate, body: e.target.value})}
                          placeholder="Hola {{nombre}}, ¿En qué te puedo ayudar?"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[13px] text-zinc-200 focus:border-orange-500 focus:outline-none resize-none transition-all"
                        />
                        <div className="flex items-center justify-between mt-2 text-[11px] text-[#54656f] font-medium">
                          <span>{newTemplate.body.length} caracteres</span>
                          <span>{newTemplate.body.match(/\{\{.+?\}\}/g)?.length || 0} variables</span>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button onClick={saveTemplate} className="bg-orange-600 hover:bg-[#f0f2f5]0 text-[#111b21] px-6 py-3 rounded-xl text-[13px] font-bold flex items-center shadow-lg transition-all active:scale-95">
                          <Check className="w-4 h-4 mr-2" /> Guardar Plantilla
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista Existentes */}
                <div className="col-span-12 lg:col-span-7 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {templates.length === 0 ? (
                    <div className="border border-slate-200 bg-white rounded-2xl p-12 text-center">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-[14px] font-bold text-zinc-300">Aún no hay plantillas creadas.</p>
                      <p className="text-[13px] text-[#54656f] mt-1">Usá el formulario lateral para agregar tu primer atajo.</p>
                    </div>
                  ) : (
                    templates.map((t, idx) => (
                      <div key={idx} className="bg-zinc-900 border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:bg-[#f0f2f5]/50 transition-all shadow-sm group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[14px] font-extrabold text-[#111b21] bg-[#f0f2f5] px-3 py-1 rounded-lg tracking-wider border border-blue-200">{t.shortcut}</span>
                            <span className="text-[11px] font-bold text-[#54656f] uppercase tracking-wide bg-zinc-800 border border-slate-200 px-2 py-1 rounded-md">{t.category}</span>
                          </div>
                          <button onClick={async (e) => { e.stopPropagation(); await supabase.from('ng_templates').delete().eq('id', t.id); fetchTemplates(); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                        <p className="text-[13px] text-zinc-300 leading-relaxed font-medium mt-4 pl-1 border-l-2 border-slate-200 group-hover:border-blue-400 transition-colors">{t.body}</p>
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

function SystemModal({ isOpen, title, message, type, onClose }: { isOpen: boolean, title: string, message: string, type: ModalType, onClose: () => void }) {
  if (!isOpen) return null;

  const bgClasses = {
    'error': 'bg-red-50 text-red-600 border-red-200',
    'success': 'bg-green-50 text-green-600 border-green-200',
    'info': 'bg-[#f0f2f5] text-[#111b21] border-blue-200'
  };

  const Icon = {
    'error': AlertTriangle,
    'success': CheckCircle,
    'info': Info
  }[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`px-6 py-4 border-b flex items-center justify-between ${bgClasses[type]}`}>
          <div className="flex items-center">
            <Icon className="w-5 h-5 mr-2" />
            <h3 className="font-bold text-[16px] uppercase tracking-wide">{title}</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity p-1">
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-zinc-300 text-[14px] leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button onClick={async () => {
            // Log issue to DB
            supabase.from('ng_error_logs').insert([{ title, message, type }]).then();
            
            // Send WhatsApp to admin via BuilderBot
            const builderBotUrl = import.meta.env.VITE_BUILDERBOT_API_URL;
            const builderBotKey = import.meta.env.VITE_BUILDERBOT_API_KEY;
    const builderBotBotId = import.meta.env.VITE_BUILDERBOT_BOT_ID;
            if (builderBotUrl && builderBotKey) {
              try {
                const alertMsg = `⚠️ *REPORTE DE PROBLEMA*\n\n📋 *Título:* ${title}\n💬 *Detalle:* ${message}\n🏷️ *Tipo:* ${type}\n📅 *Fecha:* ${new Date().toLocaleString('es-AR')}`;
                await fetch(`${builderBotUrl}/${builderBotBotId}/messages`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-api-builderbot': builderBotKey },
                  body: JSON.stringify({ number: '5492645438114', messages: { content: alertMsg } })
                });
              } catch (err) { console.error('Error sending alert to admin:', err); }
            }
            onClose();
          }} className="text-[11px] font-medium text-[#54656f] hover:text-[#111b21] underline">
            Reportar problema
          </button>
          <button onClick={onClose} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-[#111b21] font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm cursor-pointer border-none outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
const darkThemeCss = `
  .dark {
    color-scheme: dark;
  }
`;

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: ModalType}>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  const showSystemModal = (title: string, message: string, type: ModalType = 'info') => {
    setModalState({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    // Inyectamos nuestro theme manager
    const style = document.createElement('style');
    style.innerHTML = darkThemeCss;
    document.head.appendChild(style);
    
    // Asignamos la funcion global
    (window as any).toggleTheme = () => {
      document.documentElement.classList.toggle('dark');
    };
    
    return () => {
      document.head.removeChild(style);
      delete (window as any).toggleTheme;
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AppContext.Provider value={{ isSidebarOpen, toggleSidebar, showSystemModal }}>
      <div className="flex h-screen overflow-x-hidden overflow-y-auto font-sans selection:bg-orange-100 transition-colors duration-300 relative bg-[#000]">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subir" element={<UploadInvoice />} />
          <Route path="/mensajeria" element={<Messenger />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/seguimientos" element={<FollowUps />} />
          <Route path="/carreras" element={<CarrerasPanel />} />
          <Route path="/configuracion" element={<Configuracion isSidebarOpen={isSidebarOpen} userRole="admin" />} />
        </Routes>
        <SystemModal 
          isOpen={modalState.isOpen} 
          title={modalState.title} 
          message={modalState.message} 
          type={modalState.type} 
          onClose={() => setModalState(s => ({ ...s, isOpen: false }))} 
        />
        {/* <GallitoWidget /> */}
      </div>
    </AppContext.Provider>
  );
}

export default App;
