import pdf from "npm:pdf-parse";
import * as fs from "node:fs";

const dataBuffer = fs.readFileSync("c:\\\\Users\\\\lucas\\\\Desktop\\\\Proyectos\\\\Neumaticos gallo\\\\FCA_0021_00026556_(30717281948 CELMART).PDF");
pdf(dataBuffer).then(function(data: any) {
    console.log("=== INICIO PDF ===");
    console.log(data.text);
    console.log("=== FIN PDF ===");
}).catch(console.error);
