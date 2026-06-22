import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { AppContext } from './App';
import * as XLSX from 'xlsx';
import {
  Search, Package, UploadCloud, Plus, Trash2, Edit2, Check, X,
  RefreshCw, CheckCircle, Info, ChevronLeft, ChevronRight, Download
} from 'lucide-react';

interface Product {
  id: string;
  code: string;
  alt_code: string | null;
  name: string;
  brand: string;
  measure: string;
  price: number;
  stock: number;
  created_at: string;
}

const PAGE_SIZE = 25;

export default function ProductosPanel() {
  const { isSidebarOpen, showSystemModal } = React.useContext(AppContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [brands, setBrands] = useState<string[]>([]);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});

  // Add product
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ code: '', name: '', brand: '', measure: '', price: 0, stock: 0, alt_code: '' });

  // Upload
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [pending, setPending] = useState<any[]>([]);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('ng_products').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,measure.ilike.%${search}%`);
    }
    if (brandFilter) {
      query = query.ilike('brand', `%${brandFilter}%`);
    }

    const { data, count, error } = await query
      .order('brand', { ascending: true })
      .order('name', { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) { console.error(error); }
    setProducts(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [search, brandFilter, page]);

  const fetchBrands = async () => {
    const { data } = await supabase.from('ng_products').select('brand');
    const unique = [...new Set((data || []).map((d: any) => d.brand).filter(Boolean))].sort();
    setBrands(unique as string[]);
  };

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchBrands(); }, []);
  useEffect(() => { setPage(0); }, [search, brandFilter]);

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── CRUD ──
  const startEdit = (p: Product) => { setEditId(p.id); setEditData({ ...p }); };
  const cancelEdit = () => { setEditId(null); setEditData({}); };

  const saveEdit = async () => {
    if (!editId) return;
    const { error } = await supabase.from('ng_products').update({
      code: editData.code, name: editData.name, brand: editData.brand,
      measure: editData.measure, price: editData.price, stock: editData.stock, alt_code: editData.alt_code
    }).eq('id', editId);
    if (error) { showSystemModal('Error', error.message, 'error'); return; }
    cancelEdit();
    fetchProducts();
    showSystemModal('Guardado', 'Producto actualizado correctamente.', 'success');
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from('ng_products').delete().eq('id', deleteId);
    setDeleteId(null);
    fetchProducts();
    fetchBrands();
  };

  const addProduct = async () => {
    if (!newProduct.code || !newProduct.name) {
      showSystemModal('Error', 'Código y nombre son obligatorios.', 'error'); return;
    }
    const { error } = await supabase.from('ng_products').insert([newProduct]);
    if (error) { showSystemModal('Error', error.message, 'error'); return; }
    setNewProduct({ code: '', name: '', brand: '', measure: '', price: 0, stock: 0, alt_code: '' });
    setShowAdd(false);
    fetchProducts();
    fetchBrands();
    showSystemModal('Agregado', 'Producto creado correctamente.', 'success');
  };

  // ── Excel Upload ──
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      let headerRow = 0;
      for (let i = 0; i < Math.min(data.length, 5); i++) {
        const row = data[i];
        if (row && row.some((cell: any) => String(cell || '').toLowerCase().includes('art') || String(cell || '').toLowerCase().includes('cód'))) {
          headerRow = i; break;
        }
      }

      const prods: any[] = [];
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
        if (code && fullName) prods.push({ code, alt_code: altCode, name: fullName, brand, measure, price, stock });
      }

      if (prods.length === 0) {
        showSystemModal('Error', 'No se encontraron productos. Verificá el formato.', 'error');
      } else {
        setPreview(prods.slice(0, 8));
        setPending(prods);
      }
    } catch (err: any) {
      showSystemModal('Error', 'Error procesando archivo: ' + err.message, 'error');
    }
    setUploading(false);
    e.target.value = '';
  };

  const confirmUpload = async () => {
    if (!pending.length) return;
    setUploading(true);
    try {
      await supabase.from('ng_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      for (let i = 0; i < pending.length; i += 50) {
        await supabase.from('ng_products').insert(pending.slice(i, i + 50));
      }
      showSystemModal('Catálogo Actualizado', `Se importaron ${pending.length} productos correctamente.`, 'success');
      fetchProducts();
      fetchBrands();
    } catch (err: any) {
      showSystemModal('Error', err.message, 'error');
    }
    setUploading(false);
    setPreview(null);
    setPending([]);
  };

  const exportExcel = () => {
    const exportData = products.map(p => ({
      'Cód. Art.': p.code, 'Articulo': p.name, 'Marca': p.brand,
      'Medida': p.measure, 'Cód. Alt.': p.alt_code, 'Precio': p.price, 'Stock': p.stock
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), 'Productos');
    XLSX.writeFile(wb, `productos_gallo_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className={`flex-1 min-h-screen bg-[#F8FAFC] flex flex-col transition-[margin] duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
      <header className="h-[88px] bg-white/80 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-10">
        <div>
          <h1 className="text-[22px] text-slate-800"><span className="font-bold">Catálogo</span> de Productos</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gestión completa del inventario conectado al Bot IA</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[13px] font-bold px-4 py-2 rounded-full ${totalCount > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {totalCount} productos
          </span>
        </div>
      </header>

      <main className="px-10 py-6 w-full space-y-6">
        {/* Upload Preview Modal */}
        {preview && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center text-blue-700 font-bold text-sm">
              <Info className="w-4 h-4 mr-2" /> Vista previa: {pending.length} productos detectados
            </div>
            <div className="border border-blue-200 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-blue-100 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-bold text-blue-600">Código</th>
                    <th className="text-left px-3 py-2 font-bold text-blue-600">Producto</th>
                    <th className="text-left px-3 py-2 font-bold text-blue-600">Marca</th>
                    <th className="text-left px-3 py-2 font-bold text-blue-600">Medida</th>
                    <th className="text-right px-3 py-2 font-bold text-blue-600">Precio</th>
                    <th className="text-right px-3 py-2 font-bold text-blue-600">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {preview.map((p, i) => (
                    <tr key={i}><td className="px-3 py-2 font-mono">{p.code}</td><td className="px-3 py-2">{p.name}</td><td className="px-3 py-2">{p.brand}</td><td className="px-3 py-2">{p.measure}</td><td className="px-3 py-2 text-right font-bold">{fmt(p.price)}</td><td className="px-3 py-2 text-right">{p.stock}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setPreview(null); setPending([]); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm border border-slate-200">Cancelar</button>
              <button onClick={confirmUpload} disabled={uploading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center disabled:opacity-50">
                {uploading ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Subiendo...</> : <><CheckCircle className="w-4 h-4 mr-2" /> Confirmar ({pending.length} productos)</>}
              </button>
            </div>
            <p className="text-[10px] text-amber-600 font-medium">⚠️ Esto reemplaza TODOS los productos actuales con los del archivo.</p>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar por nombre, código o medida..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
            </div>
            <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 min-w-[160px]">
              <option value="">Todas las marcas</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <button onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Agregar
            </button>
            <label className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer transition-colors">
              <UploadCloud className="w-4 h-4" /> Subir Excel
              <input type="file" accept=".xls,.xlsx" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
            <button onClick={exportExcel} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 border border-slate-200">
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>

          {/* Column format hint */}
          <p className="text-[10px] text-slate-400 mt-3">📋 Formato Excel requerido: <span className="font-bold text-slate-500">Cód.Art | Articulo | Marca | Medida | Cód.Alt | Precio | Cantidad</span></p>
        </div>

        {/* Add Product Row */}
        {showAdd && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 animate-in fade-in">
            <h4 className="text-sm font-bold text-green-800 mb-3">Agregar producto manualmente</h4>
            <div className="grid grid-cols-7 gap-3">
              <input placeholder="Código" value={newProduct.code} onChange={e => setNewProduct({...newProduct, code: e.target.value})} className="bg-white border border-green-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Nombre / Artículo" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-white border border-green-200 rounded-lg px-3 py-2 text-sm col-span-2" />
              <input placeholder="Marca" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="bg-white border border-green-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Medida" value={newProduct.measure} onChange={e => setNewProduct({...newProduct, measure: e.target.value})} className="bg-white border border-green-200 rounded-lg px-3 py-2 text-sm" />
              <input type="number" placeholder="Precio" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})} className="bg-white border border-green-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <input type="number" placeholder="Stock" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} className="bg-white border border-green-200 rounded-lg px-3 py-2 text-sm flex-1" />
                <button onClick={addProduct} className="bg-green-600 text-white rounded-lg px-3 hover:bg-green-700"><Check className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400"><RefreshCw className="w-5 h-5 animate-spin mr-3" /> Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package className="w-12 h-12 mb-3 text-slate-300" />
              <p className="font-bold text-slate-500">No hay productos</p>
              <p className="text-sm mt-1">Subí un archivo Excel o agregá productos manualmente.</p>
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 text-[11px] uppercase">Código</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 text-[11px] uppercase">Artículo</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 text-[11px] uppercase">Marca</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 text-[11px] uppercase">Medida</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-500 text-[11px] uppercase">Precio</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-500 text-[11px] uppercase">Stock</th>
                  <th className="text-center px-4 py-3 font-bold text-slate-500 text-[11px] uppercase w-[100px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    {editId === p.id ? (
                      <>
                        <td className="px-4 py-2"><input value={editData.code || ''} onChange={e => setEditData({...editData, code: e.target.value})} className="w-full bg-blue-50 border border-blue-300 rounded px-2 py-1 text-sm font-mono" /></td>
                        <td className="px-4 py-2"><input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-blue-50 border border-blue-300 rounded px-2 py-1 text-sm" /></td>
                        <td className="px-4 py-2"><input value={editData.brand || ''} onChange={e => setEditData({...editData, brand: e.target.value})} className="w-full bg-blue-50 border border-blue-300 rounded px-2 py-1 text-sm" /></td>
                        <td className="px-4 py-2"><input value={editData.measure || ''} onChange={e => setEditData({...editData, measure: e.target.value})} className="w-full bg-blue-50 border border-blue-300 rounded px-2 py-1 text-sm" /></td>
                        <td className="px-4 py-2"><input type="number" value={editData.price || 0} onChange={e => setEditData({...editData, price: parseFloat(e.target.value) || 0})} className="w-full bg-blue-50 border border-blue-300 rounded px-2 py-1 text-sm text-right" /></td>
                        <td className="px-4 py-2"><input type="number" value={editData.stock || 0} onChange={e => setEditData({...editData, stock: parseInt(e.target.value) || 0})} className="w-full bg-blue-50 border border-blue-300 rounded px-2 py-1 text-sm text-right" /></td>
                        <td className="px-4 py-2 flex items-center justify-center gap-1">
                          <button onClick={saveEdit} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={cancelEdit} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><X className="w-3.5 h-3.5" /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-mono text-slate-500 text-[12px]">{p.code}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 max-w-[300px] truncate">{p.name}</td>
                        <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-bold">{p.brand || '—'}</span></td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[12px]">{p.measure || '—'}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800 text-right">{fmt(p.price)}</td>
                        <td className="px-4 py-3 font-bold text-right">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{p.stock}</span>
                        </td>
                        <td className="px-4 py-3 flex items-center justify-center gap-1">
                          <button onClick={() => startEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-[12px] text-slate-500">Página {page + 1} de {totalPages} ({totalCount} productos)</span>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar producto?</h3>
            <p className="text-sm text-slate-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-sm">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
