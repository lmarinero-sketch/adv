import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './lib/supabase';
import { AppContext } from './App';
import * as XLSX from 'xlsx';
import {
  Send,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Play,
  Pause,
  Phone,
  User,
  Mail,
  Check,
  X,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Search,
  Eye,
  CheckSquare,
  Square,
  ChevronRight,
  ShieldCheck,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

// Normalizador específico para números de teléfono en Argentina
// Convierte cualquier formato a: 5492645438114
export function normalizeArgentinePhone(raw: any): {
  normalized: string;
  isValid: boolean;
  original: string;
  reason?: string;
} {
  const original = String(raw ?? '').trim();
  if (!original) {
    return { normalized: '', isValid: false, original, reason: 'Teléfono vacío' };
  }

  // 1. Quitar todos los caracteres no numéricos (+, -, espacios, paréntesis, etc.)
  let digits = original.replace(/\D/g, '');
  if (!digits) {
    return { normalized: '', isValid: false, original, reason: 'No contiene números' };
  }

  // 2. Si comienza con 0 (ej: 0264..., 0260...), quitar el 0 inicial
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // 3. Manejar prefijo de país 54
  if (digits.startsWith('54')) {
    if (digits.startsWith('549')) {
      digits = digits.substring(3); // Quitar 549 temporalmente para normalizar el número nacional
    } else {
      digits = digits.substring(2); // Quitar 54
    }
  }

  // Si tras quitar 54 quedó un 0 (ej: +54 0264...)
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // 4. Manejo del "15" característico de móviles en Argentina
  // Caso A: Sin código de área, empieza directo con 15 (ej: 155438114 - 8 o 9 dígitos)
  // Por defecto en San Juan (área local de Adventure Pro) es 264
  if (digits.startsWith('15') && (digits.length === 9 || digits.length === 8)) {
    digits = '264' + digits.substring(2);
  }

  // Caso B: Con código de área y "15" intermedio (ej: 264 15 5438114 -> 12 dígitos)
  // Área de 3 dígitos (San Juan 264, Mendoza 261, Córdoba 351, etc.):
  if (digits.length === 12 && digits.substring(3, 5) === '15') {
    digits = digits.substring(0, 3) + digits.substring(5);
  }
  // Área de 2 dígitos (Buenos Aires 11): ej 11 15 12345678 (12 dígitos)
  else if (digits.length === 12 && digits.substring(2, 4) === '15') {
    digits = digits.substring(0, 2) + digits.substring(4);
  }
  // Área de 4 dígitos: ej 2644 15 123456
  else if (digits.length === 12 && digits.substring(4, 6) === '15') {
    digits = digits.substring(0, 4) + digits.substring(6);
  }
  // Longitud 11 con 15 en posición 3
  else if (digits.length === 11 && digits.substring(3, 5) === '15') {
    digits = digits.substring(0, 3) + digits.substring(5);
  }

  // Caso C: Número local corto de 7 u 8 dígitos sin código de área
  if (digits.length === 7 || digits.length === 8) {
    if (digits.startsWith('15')) {
      digits = '264' + digits.substring(2);
    } else {
      digits = '264' + digits;
    }
  }

  // 5. Prefijo internacional obligatorio de Meta WhatsApp para móviles de Argentina: 549
  const finalNumber = '549' + digits;

  // En Argentina los celulares internacionales con 549 tienen normalmente 13 dígitos
  // (549 + 10 dígitos nacionales = 13 dígitos)
  const isValid = finalNumber.length === 13;

  return {
    normalized: finalNumber,
    isValid,
    original,
    reason: isValid ? undefined : `Longitud inusual (${finalNumber.length} dígitos, se esperaban 13)`
  };
}

interface WhatsAppTemplateComponent {
  type: string;
  text?: string;
  buttons?: Array<{ type: string; text: string }>;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: WhatsAppTemplateComponent[];
}

interface ExcelContact {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phoneOriginal: string;
  phoneNormalized: string;
  phoneValid: boolean;
  phoneReason?: string;
  email: string;
  distance: string;
  paymentStatus: string;
  // Estado de envío
  sendState: 'pending' | 'sending' | 'success' | 'error';
  errorMessage?: string;
  messageId?: string;
  sentAt?: string;
  selected: boolean;
}

export default function PlantillasPanel() {
  const { isSidebarOpen, showSystemModal } = React.useContext(AppContext);

  // Credenciales de BuilderBot
  const bbUrl = import.meta.env.VITE_BUILDERBOT_API_URL || 'https://app.builderbot.cloud/api/v2';
  const bbKey = import.meta.env.VITE_BUILDERBOT_API_KEY || '';
  const bbBotId = import.meta.env.VITE_BUILDERBOT_BOT_ID || '';

  // Estados de plantillas
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);

  // Estados de contactos
  const [contacts, setContacts] = useState<ExcelContact[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'approved' | 'manual'>('all');
  const [validityFilter, setValidityFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  // Estados de envío masivo
  const [isSending, setIsSending] = useState(false);
  const [sendDelaySec, setSendDelaySec] = useState<number>(1.5);
  const [syncToSupabase, setSyncToSupabase] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Referencias para control de pausa/cancelación
  const cancelSendingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Cargar plantillas desde BuilderBot
  const fetchTemplates = useCallback(async () => {
    if (!bbUrl || !bbKey || !bbBotId) {
      showSystemModal('Error de Configuración', 'Faltan variables VITE_BUILDERBOT en el entorno .env', 'error');
      return;
    }

    setLoadingTemplates(true);
    try {
      const endpoint = `${bbUrl}/${bbBotId}/whatsapp-template?limit=50`;
      const res = await fetch(endpoint, {
        headers: {
          'x-api-builderbot': bbKey
        }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTemplates(json.data);
        if (json.data.length > 0 && !selectedTemplate) {
          // Seleccionar la primera aprobada o la primera disponible
          const approved = json.data.find((t: WhatsAppTemplate) => t.status === 'APPROVED');
          setSelectedTemplate(approved || json.data[0]);
        }
      } else {
        setTemplates([]);
      }
    } catch (err: any) {
      console.error('Error al obtener plantillas:', err);
      showSystemModal('Error al listar plantillas', err.message || 'No se pudieron consultar las plantillas en Meta', 'error');
    } finally {
      setLoadingTemplates(false);
    }
  }, [bbUrl, bbKey, bbBotId, selectedTemplate, showSystemModal]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // 2. Procesar archivo Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          showSystemModal('Archivo vacío', 'El archivo Excel no contiene filas de datos.', 'info');
          return;
        }

        // Mapear filas buscando las columnas correspondientes
        const parsedContacts: ExcelContact[] = rawJson.map((row, idx) => {
          // Búsqueda insensible a mayúsculas/minúsculas de columnas
          const getVal = (possibleNames: string[]) => {
            const foundKey = Object.keys(row).find(k =>
              possibleNames.some(p => k.trim().toLowerCase() === p.toLowerCase())
            );
            return foundKey ? String(row[foundKey]).trim() : '';
          };

          const firstName = getVal(['FirstName', 'First Name', 'Nombre', 'Nombres']);
          const lastName = getVal(['LastName', 'Last Name', 'Apellido', 'Apellidos']);
          const dni = getVal(['DNI', 'Documento', 'Identificacion', 'Doc']);
          const phoneRaw = getVal(['phone', 'Phone', 'Telefono', 'Celular', 'Tel', 'Movil']);
          const email = getVal(['email', 'Email', 'Correo', 'Mail']);
          const distance = getVal(['distance', 'Distance', 'Distancia', 'Categoria', 'Km']);
          const paymentStatus = getVal(['payment_status', 'paymentstatus', 'Estado Pago', 'Pago', 'Estado']);

          const norm = normalizeArgentinePhone(phoneRaw);

          return {
            id: `row-${idx}-${Date.now()}`,
            firstName,
            lastName,
            dni,
            phoneOriginal: phoneRaw,
            phoneNormalized: norm.normalized,
            phoneValid: norm.isValid,
            phoneReason: norm.reason,
            email,
            distance,
            paymentStatus: paymentStatus || 'manual',
            sendState: 'pending',
            selected: norm.isValid // Seleccionado por defecto solo si el número es válido
          };
        });

        setContacts(parsedContacts);
        showSystemModal(
          'Excel Procesado',
          `Se importaron ${parsedContacts.length} contactos. ${
            parsedContacts.filter(c => c.phoneValid).length
          } números fueron normalizados al formato 549... correctamente.`,
          'success'
        );
      } catch (err: any) {
        console.error('Error leyendo Excel:', err);
        showSystemModal('Error de Archivo', 'No se pudo leer el archivo Excel: ' + err.message, 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Descargar plantilla Excel de ejemplo
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        FirstName: 'Carolina Alejandra',
        LastName: 'Riofrio Martino',
        DNI: '29149185',
        phone: '2644124346',
        email: 'carolinariofriom@gmail.com',
        distance: '10K',
        payment_status: 'approved'
      },
      {
        FirstName: 'Freddy',
        LastName: 'Marroquin',
        DNI: '94893659',
        phone: '02604312760',
        email: 'fr.marroquin90@gmail.com',
        distance: '15K',
        payment_status: 'approved'
      },
      {
        FirstName: 'Liliana',
        LastName: 'Ramos',
        DNI: '21520553',
        phone: '155438114',
        email: 'lgragro27@gmail.com',
        distance: '10K',
        payment_status: 'manual'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contactos');
    XLSX.writeFile(wb, 'plantilla_envio_masivo_clientes.xlsx');
  };

  // Filtrado de contactos para la tabla
  const filteredContacts = contacts.filter(c => {
    // Búsqueda
    const term = search.toLowerCase();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch =
      !term ||
      fullName.includes(term) ||
      c.dni.toLowerCase().includes(term) ||
      c.phoneOriginal.toLowerCase().includes(term) ||
      c.phoneNormalized.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term);

    // Filtro pago
    const matchesPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'approved' && c.paymentStatus.toLowerCase() === 'approved') ||
      (paymentFilter === 'manual' && c.paymentStatus.toLowerCase() !== 'approved');

    // Filtro validez teléfono
    const matchesValidity =
      validityFilter === 'all' ||
      (validityFilter === 'valid' && c.phoneValid) ||
      (validityFilter === 'invalid' && !c.phoneValid);

    return matchesSearch && matchesPayment && matchesValidity;
  });

  // Selección masiva
  const toggleSelectAll = (select: boolean) => {
    const visibleIds = new Set(filteredContacts.map(c => c.id));
    setContacts(prev =>
      prev.map(c => {
        if (visibleIds.has(c.id)) {
          // Solo permitir seleccionar si el teléfono es válido
          return { ...c, selected: select ? c.phoneValid : false };
        }
        return c;
      })
    );
  };

  const toggleSelectContact = (id: string) => {
    setContacts(prev =>
      prev.map(c => {
        if (c.id === id) {
          return { ...c, selected: !c.selected };
        }
        return c;
      })
    );
  };

  // 3. Proceso de envío masivo de la plantilla Meta
  const startMassSend = async () => {
    if (!selectedTemplate) {
      showSystemModal('Atención', 'Debes seleccionar una plantilla antes de enviar.', 'error');
      return;
    }

    const toSend = contacts.filter(c => c.selected && c.phoneValid && c.sendState !== 'success');
    if (toSend.length === 0) {
      showSystemModal('Sin contactos seleccionados', 'No hay contactos válidos seleccionados para enviar.', 'info');
      return;
    }

    setShowConfirmModal(false);
    setIsSending(true);
    cancelSendingRef.current = false;

    // Obtener texto del body de la plantilla para el registro
    const bodyComp = selectedTemplate.components.find(c => c.type.toUpperCase() === 'BODY');
    const templateBodyText = bodyComp?.text || `[Plantilla: ${selectedTemplate.name}]`;

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];

      // Si fue cancelado por el usuario
      if (cancelSendingRef.current) {
        break;
      }

      // Solo procesar si está seleccionado, válido y no fue enviado con éxito previamente
      if (!contact.selected || !contact.phoneValid || contact.sendState === 'success') {
        continue;
      }

      // Marcar como enviando
      setContacts(prev =>
        prev.map(c => (c.id === contact.id ? { ...c, sendState: 'sending' } : c))
      );

      try {
        const payload: any = {
          to: contact.phoneNormalized,
          templateName: selectedTemplate.name,
          languageCode: selectedTemplate.language || 'es'
        };

        const res = await fetch(`${bbUrl}/${bbBotId}/whatsapp-template`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-builderbot': bbKey
          },
          body: JSON.stringify(payload)
        });

        const resData = await res.json();

        if (res.ok && resData.success) {
          const messageId = resData.messageId || 'wamid.success';
          successCount++;

          // Registrar en estado
          setContacts(prev =>
            prev.map(c =>
              c.id === contact.id
                ? {
                    ...c,
                    sendState: 'success',
                    messageId,
                    sentAt: new Date().toLocaleTimeString()
                  }
                : c
            )
          );

          // Opcional: Registrar en Supabase para historial de mensajería
          if (syncToSupabase) {
            try {
              await supabase.from('ng_whatsapp_messages').insert([
                {
                  id: `meta-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  client_phone: contact.phoneNormalized,
                  body: `[Plantilla Meta: ${selectedTemplate.name}]\n\n${templateBodyText}`,
                  direction: 'outgoing',
                  message_type: 'template'
                }
              ]);
            } catch (dbErr) {
              console.warn('No se pudo guardar en ng_whatsapp_messages:', dbErr);
            }
          }
        } else {
          errorCount++;
          const errDetail =
            resData.error || resData.message || (resData.details ? JSON.stringify(resData.details) : `Error HTTP ${res.status}`);
          setContacts(prev =>
            prev.map(c =>
              c.id === contact.id
                ? {
                    ...c,
                    sendState: 'error',
                    errorMessage: errDetail
                  }
                : c
            )
          );
        }
      } catch (netErr: any) {
        errorCount++;
        setContacts(prev =>
          prev.map(c =>
            c.id === contact.id
              ? {
                  ...c,
                  sendState: 'error',
                  errorMessage: netErr.message || 'Error de conexión'
                }
              : c
          )
        );
      }

      // Delay de cortesía entre mensajes para no saturar Meta
      if (i < contacts.length - 1 && !cancelSendingRef.current) {
        await new Promise(r => setTimeout(r, sendDelaySec * 1000));
      }
    }

    setIsSending(false);
    showSystemModal(
      'Envío Masivo Finalizado',
      `Resultados del envío:\n✅ Éxitos: ${successCount}\n❌ Errores: ${errorCount}`,
      successCount > 0 ? 'success' : 'error'
    );
  };

  const cancelSending = () => {
    cancelSendingRef.current = true;
    setIsSending(false);
    showSystemModal('Envío Pausado', 'Se interrumpió el envío masivo. Puedes reanudarlo cuando quieras.', 'info');
  };

  // Reintentar solo los fallidos
  const retryFailed = () => {
    setContacts(prev =>
      prev.map(c => (c.sendState === 'error' ? { ...c, sendState: 'pending', selected: true } : c))
    );
  };

  // Exportar reporte de resultados
  const exportReport = () => {
    if (contacts.length === 0) return;
    const reportData = contacts.map(c => ({
      Nombre: c.firstName,
      Apellido: c.lastName,
      DNI: c.dni,
      'Telefono Original': c.phoneOriginal,
      'Telefono Normalizado': c.phoneNormalized,
      'Telefono Valido': c.phoneValid ? 'SI' : 'NO',
      Email: c.email,
      Distancia: c.distance,
      'Estado Pago': c.paymentStatus,
      'Estado Envio': c.sendState.toUpperCase(),
      'ID Mensaje Meta': c.messageId || '',
      'Error': c.errorMessage || '',
      'Hora Envio': c.sentAt || ''
    }));

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Envio');
    XLSX.writeFile(wb, `reporte_envio_meta_${Date.now()}.xlsx`);
  };

  // Métricas
  const totalCount = contacts.length;
  const validCount = contacts.filter(c => c.phoneValid).length;
  const selectedCount = contacts.filter(c => c.selected && c.phoneValid).length;
  const successCount = contacts.filter(c => c.sendState === 'success').length;
  const errorCount = contacts.filter(c => c.sendState === 'error').length;
  const approvedCount = contacts.filter(c => c.paymentStatus.toLowerCase() === 'approved').length;

  return (
    <div
      className={`flex-1 min-h-screen bg-zinc-950 flex flex-col transition-[margin] duration-300 ${
        isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'
      }`}
    >
      {/* Header Superior */}
      <header className="h-[88px] bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] text-white">
              <span className="font-extrabold text-orange-500">Automatización</span> de Plantillas Meta
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Meta Cloud API
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Carga de planillas Excel, normalización estricta para Argentina (549...) y difusión oficial por WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTemplates}
            disabled={loadingTemplates}
            className="px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Sincronizar plantillas con BuilderBot / Meta"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTemplates ? 'animate-spin text-orange-400' : ''}`} />
            {loadingTemplates ? 'Actualizando...' : 'Recargar Plantillas'}
          </button>

          <button
            onClick={downloadSampleExcel}
            className="px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center gap-2 transition-colors"
            title="Descargar modelo con columnas FirstName, LastName, DNI, phone, email, distance, payment_status"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            Descargar Modelo Excel
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="px-8 py-6 w-full space-y-6">
        {/* Fila Superior: Selector de Plantillas y Carga de Excel */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Columna Izquierda: Plantillas de WhatsApp Oficiales de Meta (5 cols) */}
          <div className="xl:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Plantillas Autorizadas por Meta</h2>
                    <p className="text-[11px] text-zinc-400">Selecciona la plantilla aprobada a enviar</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {templates.length} disponibles
                </span>
              </div>

              {/* Selector / Listado de Plantillas */}
              {loadingTemplates ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                  <span className="text-xs">Consultando plantillas en Meta Cloud...</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="py-8 px-4 text-center bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-zinc-300">No se encontraron plantillas</p>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                    Si acabas de solicitar una plantilla en Meta Business Manager, puede estar en revisión o necesitar autorización.
                  </p>
                  <button
                    onClick={fetchTemplates}
                    className="mt-3 text-xs text-orange-400 hover:text-orange-300 underline font-medium"
                  >
                    Volver a comprobar
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {templates.map(tmpl => {
                      const isSelected = selectedTemplate?.id === tmpl.id;
                      const isApproved = tmpl.status.toUpperCase() === 'APPROVED';
                      return (
                        <button
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl)}
                          className={`text-left px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-orange-500/20 border-orange-500 text-white shadow-sm'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-orange-400">/{tmpl.name}</span>
                            <span className="text-[10px] text-zinc-500 uppercase">({tmpl.language})</span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isApproved
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {tmpl.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Vista Previa del Mensaje Estilo WhatsApp */}
                  {selectedTemplate && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                        <span className="font-semibold uppercase tracking-wider text-zinc-300">
                          Vista previa en WhatsApp:
                        </span>
                        <span className="text-zinc-500">Categoría: {selectedTemplate.category}</span>
                      </div>

                      <div className="bg-[#0b141a] rounded-2xl p-4 border border-zinc-800 shadow-inner relative overflow-hidden">
                        {/* Globo de mensaje estilo WhatsApp */}
                        <div className="bg-[#202c33] text-[#e9edef] rounded-2xl rounded-tl-sm p-4 text-[13px] leading-relaxed max-w-[95%] shadow-md whitespace-pre-wrap border border-white/5">
                          {selectedTemplate.components.find(c => c.type.toUpperCase() === 'BODY')?.text ||
                            'Sin texto en el cuerpo de la plantilla.'}

                          <div className="text-[10px] text-zinc-400 text-right mt-2 flex items-center justify-end gap-1">
                            <span>12:00</span>
                            <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />
                          </div>
                        </div>

                        {/* Botones de acción si la plantilla los tiene */}
                        {selectedTemplate.components.find(c => c.type.toUpperCase() === 'BUTTONS')?.buttons && (
                          <div className="mt-2 space-y-1.5 max-w-[95%]">
                            {selectedTemplate.components
                              .find(c => c.type.toUpperCase() === 'BUTTONS')
                              ?.buttons?.map((btn, bIdx) => (
                                <div
                                  key={bIdx}
                                  className="w-full py-2 px-3 bg-[#202c33] hover:bg-[#233138] text-[#53bdeb] text-xs font-semibold rounded-xl text-center border border-white/5 cursor-default transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <span>{btn.text}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Carga de Excel & Normalizador (7 cols) */}
          <div className="xl:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Importador de Planilla Excel</h2>
                    <p className="text-[11px] text-zinc-400">
                      Soporta columnas: FirstName, LastName, DNI, phone, email, distance, payment_status
                    </p>
                  </div>
                </div>

                {fileName && (
                  <span className="text-xs text-orange-400 font-mono bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg">
                    {fileName}
                  </span>
                )}
              </div>

              {/* Zona de Drop / Carga */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="cursor-pointer border-2 border-dashed border-zinc-800 hover:border-orange-500/50 bg-zinc-950/70 hover:bg-zinc-950 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-orange-500/10 border border-zinc-700 group-hover:border-orange-500/40 flex items-center justify-center text-zinc-400 group-hover:text-orange-400 transition-colors shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-semibold text-white group-hover:text-orange-400 transition-colors">
                    Haz clic aquí o arrastra tu archivo Excel (.xlsx / .xls)
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    El sistema detectará automáticamente las columnas y normalizará todos los teléfonos.
                  </p>
                </div>
              </label>

              {/* Tarjeta explicativa de la normalización del teléfono */}
              <div className="mt-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 text-xs">
                <div className="flex items-center gap-2 text-orange-400 font-semibold mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Motor de Normalización de Números Telefónicos (Argentina):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400">
                  <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block">Ejemplo Local:</span>
                    <span className="line-through text-red-400">2645438114</span>
                    <span className="text-emerald-400 font-mono block">↳ 5492645438114</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block">Con "15" o Cero:</span>
                    <span className="line-through text-red-400">02604312760 / 155438114</span>
                    <span className="text-emerald-400 font-mono block">↳ 5492604312760</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 block">Con Signo o Espacios:</span>
                    <span className="line-through text-red-400">+549 264-5438114</span>
                    <span className="text-emerald-400 font-mono block">↳ 5492645438114</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones de Envío / Controles */}
            <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Pausa entre envíos:</span>
                  <select
                    value={sendDelaySec}
                    onChange={e => setSendDelaySec(Number(e.target.value))}
                    disabled={isSending}
                    className="mt-0.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-orange-500"
                  >
                    <option value={1}>1 segundo</option>
                    <option value={1.5}>1.5 segundos (Recomendado)</option>
                    <option value={2}>2 segundos</option>
                    <option value={3}>3 segundos</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    id="sync-supabase"
                    checked={syncToSupabase}
                    onChange={e => setSyncToSupabase(e.target.checked)}
                    disabled={isSending}
                    className="accent-orange-500 rounded"
                  />
                  <label htmlFor="sync-supabase" className="text-zinc-300 text-xs cursor-pointer select-none">
                    Registrar en historial de chat
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isSending ? (
                  <button
                    onClick={cancelSending}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-colors"
                  >
                    <Pause className="w-4 h-4" /> Pausar Envío
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={selectedCount === 0 || !selectedTemplate}
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Plantilla ({selectedCount} contactos)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de KPIs / Métricas Rápidas */}
        {contacts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Total Contactos</span>
              <span className="text-xl font-bold text-white mt-1 block">{totalCount}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Teléfonos Válidos</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{validCount}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Pagos Aprobados</span>
              <span className="text-xl font-bold text-sky-400 mt-1 block">{approvedCount}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Seleccionados</span>
              <span className="text-xl font-bold text-orange-400 mt-1 block">{selectedCount}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Enviados con Éxito</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{successCount}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Errores</span>
              <span className={`text-xl font-bold mt-1 block ${errorCount > 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                {errorCount}
              </span>
            </div>
          </div>
        )}

        {/* Tabla de Contactos y Filtros */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Barra de Filtros y Herramientas */}
          <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              {/* Buscador */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI o teléfono..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs focus:border-orange-500 text-white outline-none"
                />
              </div>

              {/* Filtro por Estado de Pago */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    paymentFilter === 'all' ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Todos los Pagos
                </button>
                <button
                  onClick={() => setPaymentFilter('approved')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    paymentFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Solo Approved
                </button>
                <button
                  onClick={() => setPaymentFilter('manual')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    paymentFilter === 'manual' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Manuales
                </button>
              </div>

              {/* Filtro por Validez */}
              <select
                value={validityFilter}
                onChange={e => setValidityFilter(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-orange-500"
              >
                <option value="all">Todos los Teléfonos</option>
                <option value="valid">Solo Válidos (549...)</option>
                <option value="invalid">Con Errores de Formato</option>
              </select>
            </div>

            {/* Acciones de Selección y Reporte */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSelectAll(true)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
              >
                Seleccionar Visibles
              </button>
              <button
                onClick={() => toggleSelectAll(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
              >
                Deseleccionar
              </button>
              {errorCount > 0 && (
                <button
                  onClick={retryFailed}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium border border-red-500/30 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" /> Reintentar Fallidos
                </button>
              )}
              {contacts.length > 0 && (
                <button
                  onClick={exportReport}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" /> Exportar Reporte
                </button>
              )}
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-semibold sticky top-0 z-10 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">Sel</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">DNI</th>
                  <th className="py-3 px-4">Teléfono Original</th>
                  <th className="py-3 px-4">Normalizado (549...)</th>
                  <th className="py-3 px-4">Distancia</th>
                  <th className="py-3 px-4">Estado Pago</th>
                  <th className="py-3 px-4 text-center">Estado Envío</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-zinc-500">
                      <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 opacity-30 text-orange-500" />
                      <p className="text-sm font-semibold text-zinc-400">No hay contactos cargados todavía</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Sube un archivo Excel arriba o descarga el modelo de ejemplo para comenzar.
                      </p>
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      No se encontraron contactos con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(contact => (
                    <tr
                      key={contact.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        contact.selected ? 'bg-orange-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={contact.selected}
                          onChange={() => toggleSelectContact(contact.id)}
                          disabled={!contact.phoneValid || isSending}
                          className="accent-orange-500 rounded cursor-pointer disabled:opacity-30"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-[11px] text-zinc-500">{contact.email || 'Sin email'}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400">{contact.dni || '-'}</td>

                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {contact.phoneOriginal || <span className="text-red-400">Vacío</span>}
                      </td>

                      <td className="py-3 px-4">
                        {contact.phoneValid ? (
                          <div className="flex items-center gap-1.5 font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit border border-emerald-500/20">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            {contact.phoneNormalized}
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-1.5 font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md w-fit border border-red-500/20"
                            title={contact.phoneReason}
                          >
                            <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                            {contact.phoneNormalized || 'Inválido'}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {contact.distance ? (
                          <span className="font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {contact.distance}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            contact.paymentStatus.toLowerCase() === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {contact.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {contact.sendState === 'pending' && (
                          <span className="text-zinc-500 text-[11px] flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" /> Pendiente
                          </span>
                        )}
                        {contact.sendState === 'sending' && (
                          <span className="text-sky-400 text-[11px] font-semibold flex items-center justify-center gap-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Enviando...
                          </span>
                        )}
                        {contact.sendState === 'success' && (
                          <div className="flex flex-col items-center">
                            <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Enviado
                            </span>
                            {contact.sentAt && (
                              <span className="text-[9px] text-zinc-500">{contact.sentAt}</span>
                            )}
                          </div>
                        )}
                        {contact.sendState === 'error' && (
                          <div className="flex flex-col items-center" title={contact.errorMessage}>
                            <span className="text-red-400 text-[11px] font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Error
                            </span>
                            <span className="text-[9px] text-red-400/80 max-w-[120px] truncate">
                              {contact.errorMessage}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Confirmación antes de Enviar */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-orange-500 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirmar Envío Masivo Oficial</h3>
                <p className="text-xs text-zinc-400">WhatsApp Meta Cloud API</p>
              </div>
            </div>

            <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300">
              <div className="flex justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Plantilla Meta:</span>
                <span className="font-bold text-orange-400 font-mono">/{selectedTemplate?.name}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Destinatarios seleccionados:</span>
                <span className="font-bold text-emerald-400">{selectedCount} personas</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Pausa de cortesía:</span>
                <span className="text-white font-medium">{sendDelaySec} segundos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Formato destino:</span>
                <span className="text-white font-mono">549XXXXXXXXXX (13 dígitos)</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed">
              Los mensajes se enviarán directamente a través de los servidores oficiales de Meta WhatsApp. Asegúrate de
              que los destinatarios pertenezcan al listado correspondiente de la carrera.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={startMassSend}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Iniciar Envíos Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
