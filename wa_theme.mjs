import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/App.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Divide the file to only process the Mensajería section
// The section starts around line 1368: <div className={`flex-1 transition-[margin]... h-screen bg-zinc-800
const startPattern = "h-screen bg-zinc-800 flex overflow-hidden`}>";
const startIndex = content.indexOf(startPattern);

if (startIndex === -1) {
  console.error("Could not find start of Mensajería section");
  process.exit(1);
}

const beforeContent = content.substring(0, startIndex);
let chatContent = content.substring(startIndex);

const replacements = [
  // Container backgrounds
  { regex: /h-screen bg-zinc-800 flex overflow-hidden`\}/g, replacement: "h-screen bg-[#f0f2f5] flex overflow-hidden`}" },
  
  // Left Sidebar
  { regex: /w-\[340px\] bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0/g, replacement: "w-[340px] bg-white border-r border-slate-200 flex flex-col shrink-0" },
  { regex: /p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-800\/50/g, replacement: "p-4 flex items-center justify-between bg-[#f0f2f5] text-slate-800" },
  { regex: /text-lg font-bold text-white flex items-center/g, replacement: "text-lg font-bold text-[#111b21] flex items-center" },
  { regex: /text-zinc-500/g, replacement: "text-[#54656f]" }, // General subtle text
  { regex: /hover:text-orange-600 transition-colors/g, replacement: "hover:text-[#111b21] transition-colors" },
  
  // Search Bar
  { regex: /p-3 border-b border-zinc-800/g, replacement: "p-3 border-b border-slate-200 bg-white" },
  { regex: /bg-zinc-800 rounded-lg flex items-center px-3 py-2 border border-zinc-800/g, replacement: "bg-[#f0f2f5] rounded-lg flex items-center px-3 py-2 border border-transparent" },
  { regex: /text-white/g, replacement: "text-[#111b21]" }, // Global text-white to dark in this block (handled carefully below)

  // Chat list items
  { regex: /bg-orange-50/g, replacement: "bg-[#f0f2f5]" },
  { regex: /hover:bg-zinc-800\/50/g, replacement: "hover:bg-[#f5f6f6]" },
  { regex: /border-zinc-800/g, replacement: "border-slate-200" },
  { regex: /text-zinc-400/g, replacement: "text-[#54656f]" },
  { regex: /text-blue-800/g, replacement: "text-[#111b21]" },
  { regex: /text-orange-600/g, replacement: "text-[#111b21]" },

  // Chat window main area
  { regex: /bg-\[\#E5EAEF\]/g, replacement: "bg-[#efeae2]" },
  { regex: /radial-gradient\(circle at center, rgba\(30,58,138,0\.2\) 0%, rgba\(6,95,70,0\.15\) 100%\)/g, replacement: "none" },
  
  // Topbar of Chat Window
  { regex: /h-16 bg-zinc-900 border-b border-zinc-800/g, replacement: "h-16 bg-[#f0f2f5] border-b border-slate-200" },
  { regex: /text-white/g, replacement: "text-[#111b21]" },
  
  // Chat Bubbles
  { regex: /bg-orange-600 text-white rounded-tr-sm/g, replacement: "bg-[#d9fdd3] text-[#111b21] rounded-tr-sm shadow-sm" },
  { regex: /bg-zinc-900 border border-zinc-800 text-white rounded-tl-sm/g, replacement: "bg-white border border-transparent text-[#111b21] rounded-tl-sm shadow-sm" },
  { regex: /text-orange-100/g, replacement: "text-[#667781]" }, // Outgoing time text
  
  // Input area bottom
  { regex: /bg-zinc-900 p-4 shrink-0 flex items-center shadow-\[0_-2px_10px_-4px_rgba\(0,0,0,0\.05\)\] border-t border-zinc-800/g, replacement: "bg-[#f0f2f5] p-3 shrink-0 flex items-center border-t border-slate-200" },
  { regex: /bg-zinc-800 border-transparent text-white focus:bg-zinc-900/g, replacement: "bg-white border-transparent text-[#111b21] focus:bg-white focus:shadow-sm" },
  
  // Right side panel (Facturas)
  { regex: /w-\[320px\] bg-zinc-900 text-white flex flex-col shrink-0 overflow-y-auto border-l border-zinc-800/g, replacement: "w-[320px] bg-slate-50 text-[#111b21] flex flex-col shrink-0 overflow-y-auto border-l border-slate-200" },
  { regex: /bg-zinc-800\/50/g, replacement: "bg-white" },
  { regex: /border border-zinc-800/g, replacement: "border border-slate-200 shadow-sm" },
  { regex: /text-white/g, replacement: "text-[#111b21]" }, // Any remaining
];

for (const { regex, replacement } of replacements) {
  chatContent = chatContent.replace(regex, replacement);
}

fs.writeFileSync(filePath, beforeContent + chatContent, 'utf-8');
console.log("WhatsApp theme applied to chat section.");
