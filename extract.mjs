import fs from 'fs';
import pdf from 'pdf-parse';

let dataBuffer = fs.readFileSync('10036632_15395841_MAVANNAM_検査SS_2026-04-17.pdf');
pdf(dataBuffer).then(function(data) {
  fs.writeFileSync('pdf_text.txt', data.text);
  console.log("PDF extraction complete.");
});
