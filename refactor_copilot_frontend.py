import os
import sys

file_path = "src/App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports
if "BrainCircuit" not in content:
    content = content.replace("Sparkles,", "Sparkles,\n  BrainCircuit,\n  Zap,")

# 2. Add states to Messenger
if "const [copilotData, setCopilotData] = useState<any>(null);" not in content:
    states_hook = "const [page, setPage] = useState(0);"
    new_states = """const [page, setPage] = useState(0);
  const [copilotData, setCopilotData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);"""
    content = content.replace(states_hook, new_states)

# 3. Add analyzeChat function
if "const analyzeChat = async () =>" not in content:
    fetchMessages_hook = "const fetchMessages = async (isLoadMore = false) => {"
    analyze_func = """const analyzeChat = async () => {
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

  const fetchMessages = async (isLoadMore = false) => {"""
    content = content.replace(fetchMessages_hook, analyze_func)

# 4. Clear copilotData when activeContact changes
if "setCopilotData(null);" not in content:
    use_effect_hook = """  useEffect(() => {
    if (activeContact) {
      loadContactInfo(activeContact);
    }
  }, [activeContact]);"""
    new_use_effect = """  useEffect(() => {
    if (activeContact) {
      loadContactInfo(activeContact);
      setCopilotData(null);
    }
  }, [activeContact]);"""
    content = content.replace(use_effect_hook, new_use_effect)

# 5. Add Copilot button next to Resumir con IA
if "Copiloto IA" not in content:
    resumir_btn = """className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-colors flex items-center border border-purple-200"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Resumir con IA
                </button>"""
    
    copilot_btn = """className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm transition-colors flex items-center border border-purple-200"
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
                </button>"""
    content = content.replace(resumir_btn, copilot_btn)

# 6. Change Right Sidebar rendering condition
if "activeContactInfo?.invoices?.length > 0 || copilotData" not in content:
    sidebar_hook = """{activeContact && activeContactInfo?.invoices && activeContactInfo.invoices.length > 0 && ("""
    new_sidebar_hook = """{activeContact && (activeContactInfo?.invoices?.length > 0 || copilotData) && ("""
    content = content.replace(sidebar_hook, new_sidebar_hook)

# 7. Add Copilot UI inside Sidebar
if "Termómetro de Venta" not in content:
    facturas_title_hook = """<h4 className="text-[11px] font-bold text-slate-400 tracking-[0.2em] flex items-center mb-5 uppercase">
              <Package className="w-3.5 h-3.5 mr-2" />
              Facturas ({activeContactInfo.invoices.length})
            </h4>"""
    copilot_ui = """{copilotData && (
              <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[12px] font-bold text-indigo-800 flex items-center">
                    <BrainCircuit className="w-4 h-4 mr-1.5 text-indigo-600" /> Copiloto de Ventas
                  </h4>
                  <div className="flex items-center bg-white px-2 py-1 rounded-md border border-indigo-100 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-500 mr-1.5">Termómetro:</span>
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${copilotData.lead_score > 70 ? 'bg-green-500' : copilotData.lead_score > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${copilotData.lead_score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {copilotData.extracted_data && (
                  <div className="mb-4 bg-white rounded-lg p-3 border border-indigo-100 text-[11px]">
                    <p className="font-bold text-slate-700 mb-1 flex items-center"><Zap className="w-3 h-3 mr-1 text-amber-500" /> Datos Extraídos:</p>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div><span className="text-slate-400">Auto:</span> {copilotData.extracted_data.vehicle_model || '-'}</div>
                      <div><span className="text-slate-400">Medida:</span> {copilotData.extracted_data.tire_size || '-'}</div>
                      <div className="col-span-2"><span className="text-slate-400">Interés:</span> {copilotData.extracted_data.intent_summary || '-'}</div>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-2">Sugerencias de respuesta:</p>
                  <div className="space-y-1.5">
                    {copilotData.suggested_replies?.map((reply: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setNewMessage(reply)}
                        className="w-full text-left bg-white hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-slate-700 text-[11px] p-2 rounded-lg border border-slate-200 transition-colors shadow-sm"
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
                <h4 className="text-[11px] font-bold text-slate-400 tracking-[0.2em] flex items-center mb-5 uppercase">
                  <Package className="w-3.5 h-3.5 mr-2" />
                  Facturas ({activeContactInfo.invoices.length})
                </h4>"""
    content = content.replace(facturas_title_hook, copilot_ui)
    
    # Also we need to close the Fragment for Facturas if it was conditionally wrapped
    # The original is:
    # <div className="space-y-4">
    #   {activeContactInfo.invoices.map((inv: any, idx: number) => (
    # ...
    #   ))}
    # </div>
    # Let's close the Fragment after the Facturas div
    facturas_end_hook = """                </div>
              ))}
            </div>"""
    new_facturas_end_hook = """                </div>
              ))}
            </div>
            </>
            )}"""
    content = content.replace(facturas_end_hook, new_facturas_end_hook)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("App.tsx updated successfully!")
