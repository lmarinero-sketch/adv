import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './lib/supabase';
import { AppContext } from './App';
import {
  Search, Flag, UploadCloud, Plus, Trash2, Edit2, Check, X,
  RefreshCw, Paperclip, FileText, Download, Calendar, MapPin, Link as LinkIcon
} from 'lucide-react';

interface Carrera {
  id: string;
  name: string;
  date: string;
  location: string;
  link: string;
  description: string;
  files: string[];
  created_at: string;
}

export default function CarrerasPanel() {
  const { isSidebarOpen, showSystemModal } = React.useContext(AppContext);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Carrera>>({});

  // Add state
  const [showAdd, setShowAdd] = useState(false);
  const [newCarrera, setNewCarrera] = useState({ name: '', date: '', location: '', link: '', description: '', files: [] });

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // File Upload
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCarreras = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('ng_carreras').select('*').order('created_at', { ascending: false });
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    const { data, error } = await query;
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, ignore
        setCarreras([]);
      } else {
        console.error(error);
      }
    } else {
      setCarreras(data || []);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchCarreras(); }, [fetchCarreras]);

  const startEdit = (c: Carrera) => { setEditId(c.id); setEditData({ ...c }); };
  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const saveEdit = async () => {
    if (!editId) return;
    const { error } = await supabase.from('ng_carreras').update({
      name: editData.name, date: editData.date, location: editData.location,
      link: editData.link, description: editData.description
    }).eq('id', editId);
    
    if (error) { showSystemModal('Error', error.message, 'error'); return; }
    cancelEdit();
    fetchCarreras();
    showSystemModal('Guardado', 'Carrera actualizada correctamente.', 'success');
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from('ng_carreras').delete().eq('id', deleteId);
    setDeleteId(null);
    fetchCarreras();
  };

  const addCarrera = async () => {
    if (!newCarrera.name) {
      showSystemModal('Error', 'El nombre es obligatorio.', 'error'); return;
    }
    const { error } = await supabase.from('ng_carreras').insert([{ ...newCarrera }]);
    if (error) { showSystemModal('Error', error.message, 'error'); return; }
    setNewCarrera({ name: '', date: '', location: '', link: '', description: '', files: [] });
    setShowAdd(false);
    fetchCarreras();
    showSystemModal('Agregada', 'Carrera creada correctamente.', 'success');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) return;
    
    setUploadingId('uploading');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('carreras_archivos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('carreras_archivos')
        .getPublicUrl(filePath);

      // Fetch current files
      const currentCarrera = carreras.find(c => c.id === uploadingId);
      const currentFiles = currentCarrera?.files || [];
      const newFiles = [...currentFiles, publicUrl];

      // Update DB
      await supabase.from('ng_carreras').update({ files: newFiles }).eq('id', uploadingId);
      
      showSystemModal('Éxito', 'Archivo subido correctamente', 'success');
      fetchCarreras();
    } catch (error: any) {
      showSystemModal('Error al subir', 'Asegúrate de haber ejecutado el SQL para crear el Bucket carreras_archivos. Detalles: ' + error.message, 'error');
    } finally {
      setUploadingId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex-1 min-h-screen bg-zinc-950 flex flex-col transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
      <header className="h-[88px] bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-10 border-b border-zinc-800">
        <div>
          <h1 className="text-[22px] text-white"><span className="font-bold">Módulo</span> de Carreras</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Gestión de eventos, fechas, ubicaciones y archivos adjuntos (PDFs/Excel)</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[13px] font-bold px-4 py-2 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/30`}>
            {carreras.length} Eventos Activos
          </span>
        </div>
      </header>

      <main className="px-10 py-6 w-full space-y-6">
        
        {/* Toolbar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Buscar carrera..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-orange-500 text-white outline-none" />
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Nueva Carrera
          </button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-zinc-900 border border-orange-500/30 rounded-2xl p-6 animate-in fade-in">
            <h4 className="text-sm font-bold text-orange-500 mb-4 flex items-center"><Flag className="w-4 h-4 mr-2" /> Información de la Carrera</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input placeholder="Nombre (Ej: Maratón Internacional SJ)" value={newCarrera.name} onChange={e => setNewCarrera({...newCarrera, name: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white" />
              <input placeholder="Fecha (Ej: 26 de Julio 2026)" value={newCarrera.date} onChange={e => setNewCarrera({...newCarrera, date: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white" />
              <input placeholder="Ubicación / Lugar" value={newCarrera.location} onChange={e => setNewCarrera({...newCarrera, location: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white" />
              <input placeholder="Sitio Web (Ej: https://...)" value={newCarrera.link} onChange={e => setNewCarrera({...newCarrera, link: e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white" />
            </div>
            <textarea placeholder="Descripción o Notas Internas..." value={newCarrera.description} onChange={e => setNewCarrera({...newCarrera, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white mb-4 resize-none h-24" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-colors">Cancelar</button>
              <button onClick={addCarrera} className="bg-orange-600 text-white rounded-xl px-6 py-2.5 font-bold hover:bg-orange-700 transition-colors">Guardar Carrera</button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 flex items-center justify-center py-20 text-zinc-500"><RefreshCw className="w-5 h-5 animate-spin mr-3" /> Cargando...</div>
          ) : carreras.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <Flag className="w-12 h-12 mb-3 text-zinc-700" />
              <p className="font-bold text-zinc-400">No hay carreras registradas</p>
              <p className="text-sm text-zinc-600 mt-1">Recuerda ejecutar el código SQL para crear la tabla si aún no lo hiciste.</p>
            </div>
          ) : (
            carreras.map(c => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-colors rounded-2xl p-6 flex flex-col">
                {editId === c.id ? (
                  <div className="space-y-3 flex-1">
                     <input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded px-3 py-2 text-sm font-bold" placeholder="Nombre" />
                     <input value={editData.date || ''} onChange={e => setEditData({...editData, date: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded px-3 py-2 text-sm" placeholder="Fecha" />
                     <input value={editData.location || ''} onChange={e => setEditData({...editData, location: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded px-3 py-2 text-sm" placeholder="Ubicación" />
                     <input value={editData.link || ''} onChange={e => setEditData({...editData, link: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded px-3 py-2 text-sm" placeholder="Link web" />
                     <textarea value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white rounded px-3 py-2 text-sm h-20" placeholder="Descripción" />
                     <div className="flex justify-end gap-2 mt-4">
                       <button onClick={cancelEdit} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-bold">Cancelar</button>
                       <button onClick={saveEdit} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">Guardar</button>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{c.name}</h3>
                        <p className="text-orange-500 text-sm font-bold flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5" /> {c.date || 'Sin fecha'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(c)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-zinc-400 flex items-center"><MapPin className="w-4 h-4 mr-2 text-zinc-500" /> {c.location || 'No especificada'}</p>
                      {c.link && (
                        <p className="text-sm text-blue-400 flex items-center"><LinkIcon className="w-4 h-4 mr-2 text-blue-500" /> <a href={c.link} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-[300px]">{c.link}</a></p>
                      )}
                      {c.description && <p className="text-sm text-zinc-500 mt-3 pt-3 border-t border-zinc-800 line-clamp-3">{c.description}</p>}
                    </div>

                    <div className="mt-auto bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center"><Paperclip className="w-3.5 h-3.5 mr-1.5" /> Archivos ({c.files?.length || 0})</span>
                        <button 
                          onClick={() => { setUploadingId(c.id); fileInputRef.current?.click(); }}
                          disabled={uploadingId === 'uploading'}
                          className="text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center"
                        >
                          <UploadCloud className="w-3.5 h-3.5 mr-1" /> {uploadingId === 'uploading' && uploadingId === c.id ? 'Subiendo...' : 'Subir Archivo'}
                        </button>
                      </div>
                      
                      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2">
                        {(!c.files || c.files.length === 0) ? (
                          <p className="text-[11px] text-zinc-600 italic">No hay archivos adjuntos. Puedes subir PDFs, Excels, Word o Imágenes.</p>
                        ) : (
                          c.files.map((fileUrl, i) => {
                            const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i);
                            return (
                              <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg group">
                                <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center text-[12px] text-zinc-300 hover:text-orange-500 truncate max-w-[80%]">
                                  {isImage ? <Flag className="w-3.5 h-3.5 mr-2 text-zinc-500" /> : <FileText className="w-3.5 h-3.5 mr-2 text-zinc-500" />}
                                  {fileUrl.split('/').pop()?.split('?')[0] || `Archivo ${i+1}`}
                                </a>
                                <a href={fileUrl} download target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleFileUpload} />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-zinc-800" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar Carrera?</h3>
            <p className="text-sm text-zinc-400 mb-6">Se borrará de la base de datos. Los archivos subidos quedarán huérfanos en el bucket.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl text-sm hover:bg-zinc-700">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
