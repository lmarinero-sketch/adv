import os

file_path = "src/App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

magic_buttons_html = """
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-[12px] font-bold text-slate-800 flex items-center mb-3">
                  <Zap className="w-4 h-4 mr-1.5 text-amber-500" /> Acciones Rápidas
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => {
                      setNewMessage("¡Hola! Te dejo los datos de nuestra cuenta bancaria para realizar la transferencia:\\n\\nCBU: 00000031238918239123\\nAlias: NEUMATICOS.GALLO\\nBanco: Galicia\\n\\nPor favor, enviame el comprobante por acá cuando la realices. ¡Gracias!");
                    }}
                    className="flex items-center text-left bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-[11px] font-bold text-slate-700 px-3 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2"><CheckCircle className="w-3.5 h-3.5" /></span>
                    Enviar Datos Bancarios
                  </button>

                  <button 
                    onClick={() => {
                      setNewMessage("/PRESUPUESTO");
                    }}
                    className="flex items-center text-left bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-[11px] font-bold text-slate-700 px-3 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-2"><FileText className="w-3.5 h-3.5" /></span>
                    Plantilla Presupuesto
                  </button>

                  <button 
                    onClick={() => {
                      alert("Para agendar un seguimiento automático, ve a la pestaña 'Follow Ups' / Seguimientos en el panel lateral principal.");
                    }}
                    className="flex items-center text-left bg-white border border-slate-200 hover:border-green-400 hover:bg-green-50 text-[11px] font-bold text-slate-700 px-3 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2"><Clock className="w-3.5 h-3.5" /></span>
                    Agendar Seguimiento
                  </button>
                </div>
              </div>
"""

hook = """{copilotData && ("""

if "Acciones Rápidas" not in content:
    content = content.replace(hook, magic_buttons_html + "\n" + hook)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Magic buttons added successfully!")
