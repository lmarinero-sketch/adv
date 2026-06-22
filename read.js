import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

console.log("PDF Type:", typeof pdf);
console.log("PDF Keys:", Object.keys(pdf));

const dataBuffer = fs.readFileSync('c:\\\\Users\\\\lucas\\\\Desktop\\\\Proyectos\\\\Neumaticos gallo\\\\FCA_0021_00026556_(30717281948 CELMART).PDF');

if (typeof pdf === 'function') {
  pdf(dataBuffer).then(data => console.log(data.text));
} else if (typeof pdf.default === 'function') {
  pdf.default(dataBuffer).then(data => console.log(data.text));
} else if (typeof pdf.pdf === 'function') {
  pdf.pdf(dataBuffer).then(data => console.log(data.text));
} else {
  console.log("NO FUNCTION FOUND");
}
