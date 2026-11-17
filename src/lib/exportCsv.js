export function exportToCsv(filename, rows, headers) {
  if (!rows || rows.length === 0) {
    const empty = headers.map((h) => h.label).join(",");
    triggerDownload(filename, empty + "\n");
    return;
  }
  const escape = (val) => {
    if (val == null) return "";
    const s = String(val).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const headerLine = headers.map((h) => escape(h.label)).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escape(h.get(row))).join(",")
  );
  const csv = [headerLine, ...dataLines].join("\n");
  triggerDownload(filename, csv);
}

function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}