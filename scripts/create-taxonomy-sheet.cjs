const XLSX = require("xlsx");
const { SECTIONS: taxonomy } = require("./master-taxonomy.cjs");

const wb = XLSX.utils.book_new();
const rows = [];

taxonomy.forEach((cat) => {
  rows.push([cat.section, "", "", ""]);
  rows.push(["Subcategory", "Canonical label", "Description", "Referal Link"]);
  cat.labels.forEach((label) => {
    rows.push([label[0], label[1], label[2], ""]);
  });
  rows.push(["", "", "", ""]);
});

const ws = XLSX.utils.aoa_to_sheet(rows);

ws["!cols"] = [
  { wch: 22 },
  { wch: 30 },
  { wch: 80 },
  { wch: 40 },
];

let currentRow = 0;
taxonomy.forEach((cat) => {
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 3 },
  });

  const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
  if (ws[cellRef]) {
    ws[cellRef].s = {
      font: { bold: true, sz: 14 },
      fill: { fgColor: { rgb: "D9E1F2" } },
    };
  }

  for (let c = 0; c < 4; c++) {
    const headerRef = XLSX.utils.encode_cell({ r: currentRow + 1, c });
    if (ws[headerRef]) {
      ws[headerRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E2EFDA" } },
      };
    }
  }

  currentRow += 2 + cat.labels.length + 1;
});

XLSX.utils.book_append_sheet(wb, ws, "Full Taxonomy");

const outPath = __dirname + "/../taxonomy.xlsx";
XLSX.writeFile(wb, outPath);
console.log(`Created ${outPath}`);
console.log(`Total labels: ${taxonomy.reduce((sum, c) => sum + c.labels.length, 0)}`);
