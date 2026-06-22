import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the sidebar condition inside Messenger
# The condition is: {activeContact && (activeContactInfo?.invoices?.length > 0 || copilotData) && (
old_cond = "{activeContact && (activeContactInfo?.invoices?.length > 0 || copilotData) && ("
new_cond = "{activeContact && ("
content = content.replace(old_cond, new_cond)

# 2. Add state and function
# In Messenger, the states start somewhere around:
# function Messenger({ isSidebarOpen, userRole }: { isSidebarOpen: boolean, userRole: string | null }) {
#   const [activeContact, setActiveContact] = useState<string | null>(null);

messenger_pattern = r"(function Messenger\(\{[^\}]+\}\s*\{\n\s*const \[activeContact, setActiveContact\] = useState<string \| null>\(null\);)"

new_states = """
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
      alert('Seguimiento programado correctamente.');
      setShowFollowUpModal(false);
      setFuReason('Seguimiento general');
      setFuDate('');
      setFuObservations('');
    } catch(err: any) {
      console.error(err);
      alert('Error: No se pudo agendar el seguimiento.');
    }
  };
"""

content = re.sub(messenger_pattern, r"\1" + new_states, content, count=1)

# 3. Update the button onClick
old_btn_onclick = """onClick={() => {
                      alert("Para agendar un seguimiento automático, ve a la pestaña 'Follow Ups' / Seguimientos en el panel lateral principal.");
                    }}"""
new_btn_onclick = """onClick={() => setShowFollowUpModal(true)}"""
content = content.replace(old_btn_onclick, new_btn_onclick)


modal_jsx = """      {/* Follow-up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => setShowFollowUpModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-600" /> Agendar Seguimiento
              </h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleFollowUp} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Motivo / Acción</label>
                <select value={fuReason} onChange={e => setFuReason(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-green-400 bg-slate-50">
                  <option value="Seguimiento general">Seguimiento general</option>
                  <option value="Consulta por presupuesto">Consulta por presupuesto</option>
                  <option value="Enviar catálogo/fotos">Enviar catálogo/fotos</option>
                  <option value="Confirmar turno">Confirmar turno</option>
                  <option value="Aviso de stock ingresado">Aviso de stock ingresado</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Fecha Programada</label>
                <input required type="date" value={fuDate} onChange={e => setFuDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-green-400 bg-slate-50" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Observaciones (Opcional)</label>
                <textarea rows={3} value={fuObservations} onChange={e => setFuObservations(e.target.value)} placeholder="Ej: Preguntar si ya cobró para cerrar la venta..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-green-400 bg-slate-50 resize-none"></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowFollowUpModal(false)} className="px-4 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-700">Cancelar</button>
                <button type="submit" disabled={!fuDate} className="px-5 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white text-[12px] font-bold rounded-lg transition-colors">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

end_messenger = """        </div>
      )}
    </div>
  );
}

function FollowUps() {"""

content = content.replace(end_messenger, """        </div>
      )}
""" + modal_jsx + """    </div>
  );
}

function FollowUps() {""")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Script executed!")
