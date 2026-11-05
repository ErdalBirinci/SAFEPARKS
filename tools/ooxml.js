/* Minimal, dependency-free OOXML writers for the SAFE-PARKS decision table.
   Produces real .docx and .xlsx packages (stored ZIP entries) that Word and Excel open directly.
   The output is bilingual: one Word document with TR and EN tables, one workbook with TR and EN sheets. */
"use strict";

const fs = require("fs");

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const S_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";

function xml(value) {
  return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c];
  });
}

function textRuns(value) {
  return String(value === null || value === undefined ? "" : value).split(/\r?\n/).map(function (line, i) {
    return (i ? "<w:br/>" : "") + '<w:t xml:space="preserve">' + xml(line) + "</w:t>";
  }).join("");
}

function docxParagraph(value, style) {
  return "<w:p>" + (style ? '<w:pPr><w:pStyle w:val="' + style + '"/></w:pPr>' : "") +
    "<w:r>" + textRuns(value) + "</w:r></w:p>";
}

function docxCell(value, width, header) {
  const shade = header ? '<w:shd w:val="clear" w:color="auto" w:fill="E8F1EF"/>' : "";
  const bold = header ? "<w:b/>" : "";
  return "<w:tc><w:tcPr><w:tcW w:w=\"" + width + '" w:type="dxa"/>' + shade +
    '<w:vAlign w:val="top"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>' +
    "<w:r><w:rPr>" + bold + '<w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr>' + textRuns(value) + "</w:r></w:p></w:tc>";
}

function docxTable(columns, rows, widths) {
  const grid = widths && widths.length === columns.length ? widths : columns.map(function () { return 2800; });
  const header = "<w:tr><w:trPr><w:tblHeader/></w:trPr>" +
    columns.map(function (c, i) { return docxCell(c, grid[i], true); }).join("") + "</w:tr>";
  const body = rows.map(function (row) {
    return "<w:tr>" + columns.map(function (_, i) { return docxCell(row[i] || "", grid[i], false); }).join("") + "</w:tr>";
  }).join("");
  return "<w:tbl><w:tblPr><w:tblStyle w:val=\"TableGrid\"/><w:tblW w:w=\"5000\" w:type=\"pct\"/>" +
    '<w:tblLayout w:type="fixed"/><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" ' +
    'w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>' +
    grid.map(function (w) { return '<w:gridCol w:w="' + w + '"/>'; }).join("") + "</w:tblGrid>" + header + body + "</w:tbl>";
}

function docxStyles() {
  const borders = '<w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="D7DEE6"/>' +
    '<w:left w:val="single" w:sz="4" w:space="0" w:color="D7DEE6"/>' +
    '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="D7DEE6"/>' +
    '<w:right w:val="single" w:sz="4" w:space="0" w:color="D7DEE6"/>' +
    '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="D7DEE6"/>' +
    '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="D7DEE6"/></w:tblBorders>';
  return XML_HEAD + '<w:styles xmlns:w="' + W_NS + '">' +
    "<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii=\"Calibri\" w:hAnsi=\"Calibri\" " +
    'w:eastAsia="Calibri" w:cs="Calibri"/><w:sz w:val="20"/><w:szCs w:val="20"/>' +
    '<w:lang w:val="tr-TR" w:eastAsia="tr-TR" w:bidi="ar-SA"/></w:rPr></w:rPrDefault>' +
    '<w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/>' +
    '<w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/>' +
    '<w:color w:val="12202B"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/>' +
    '<w:next w:val="Normal"/><w:qFormat/><w:rPr><w:color w:val="5D6B7A"/><w:sz w:val="19"/>' +
    '<w:szCs w:val="19"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/>' +
    '<w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/></w:pPr>' +
    '<w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/><w:color w:val="0F766E"/></w:rPr></w:style>' +
    '<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr>' + borders +
    '<w:tblCellMar><w:top w:w="70" w:type="dxa"/><w:left w:w="90" w:type="dxa"/>' +
    '<w:bottom w:w="70" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>' +
    "</w:styles>";
}

function docxDocument(opts) {
  const sections = opts.sections || [];
  const body = [
    docxParagraph(opts.title || "SAFE-PARKS — Karar tablosu / Decision table", "Title"),
    opts.subtitle ? docxParagraph(opts.subtitle, "Subtitle") : "",
    opts.source ? docxParagraph(opts.source, "Subtitle") : ""
  ];
  sections.forEach(function (section, index) {
    if (index) body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    body.push(docxParagraph(section.heading, "Heading1"));
    body.push(docxTable(section.columns, section.rows, section.widths || [3500, 7000, 1800, 1200, 1100]));
  });
  body.push('<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>' +
    '<w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/>' +
    '<w:cols w:space="720"/><w:docGrid w:linePitch="360"/></w:sectPr>');
  return XML_HEAD + '<w:document xmlns:w="' + W_NS + '"><w:body>' + body.join("") + "</w:body></w:document>";
}

function docxFiles(opts) {
  const now = new Date().toISOString();
  const contentTypes = XML_HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
    "</Types>";
  const rels = XML_HEAD + '<Relationships xmlns="' + PKG_REL_NS + '">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
    "</Relationships>";
  const docRels = XML_HEAD + '<Relationships xmlns="' + PKG_REL_NS + '">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    "</Relationships>";
  const core = XML_HEAD + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
    'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    "<dc:title>" + xml(opts.title || "SAFE-PARKS decision table") + "</dc:title>" +
    "<dc:creator>SAFE-PARKS CISO function</dc:creator><cp:lastModifiedBy>SAFE-PARKS build</cp:lastModifiedBy>" +
    '<dcterms:created xsi:type="dcterms:W3CDTF">' + now + "</dcterms:created>" +
    '<dcterms:modified xsi:type="dcterms:W3CDTF">' + now + "</dcterms:modified></cp:coreProperties>";
  const app = XML_HEAD + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" ' +
    'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
    "<Application>SAFE-PARKS build</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop>" +
    "<Company>Lotus Sirius</Company><AppVersion>1.0</AppVersion></Properties>";
  return [
    { name: "[Content_Types].xml", data: contentTypes },
    { name: "_rels/.rels", data: rels },
    { name: "word/document.xml", data: docxDocument(opts) },
    { name: "word/styles.xml", data: docxStyles() },
    { name: "word/_rels/document.xml.rels", data: docRels },
    { name: "docProps/core.xml", data: core },
    { name: "docProps/app.xml", data: app }
  ];
}

function colName(index) {
  let n = index + 1, out = "";
  while (n) {
    const r = (n - 1) % 26;
    out = String.fromCharCode(65 + r) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function xlsxSheet(sheet, index) {
  const rows = [sheet.columns || []].concat(sheet.rows || []);
  const lastCol = colName((sheet.columns || []).length - 1);
  const lastRow = rows.length;
  const widths = sheet.widths || [];
  const cols = (sheet.columns || []).map(function (_, i) {
    return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + (widths[i] || 22) + '" customWidth="1"/>';
  }).join("");
  const sheetData = rows.map(function (row, r) {
    const cells = row.map(function (value, c) {
      return '<c r="' + colName(c) + (r + 1) + '" s="' + (r === 0 ? 1 : 2) + '" t="inlineStr"><is>' +
        '<t xml:space="preserve">' + xml(value) + "</t></is></c>";
    }).join("");
    return '<row r="' + (r + 1) + '" ht="' + (r === 0 ? 30 : 54) + '" customHeight="1">' + cells + "</row>";
  }).join("");
  return XML_HEAD + '<worksheet xmlns="' + S_NS + '" xmlns:r="' + R_NS + '">' +
    '<dimension ref="A1:' + lastCol + lastRow + '"/>' +
    '<sheetViews><sheetView' + (index === 0 ? ' tabSelected="1"' : "") + ' workbookViewId="0">' +
    '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="15"/><cols>' + cols + "</cols><sheetData>" + sheetData + "</sheetData>" +
    '<autoFilter ref="A1:' + lastCol + lastRow + '"/>' +
    '<pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>' +
    '<pageSetup orientation="landscape" paperSize="9" fitToWidth="1" fitToHeight="0"/></worksheet>';
}

function xlsxStyles() {
  return XML_HEAD + '<styleSheet xmlns="' + S_NS + '">' +
    '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>' +
    '<font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts>' +
    '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill></fills>' +
    '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>' +
    '<border><left style="thin"><color rgb="FFD7DEE6"/></left><right style="thin"><color rgb="FFD7DEE6"/></right>' +
    '<top style="thin"><color rgb="FFD7DEE6"/></top><bottom style="thin"><color rgb="FFD7DEE6"/></bottom><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">' +
    '<alignment vertical="center" wrapText="1"/></xf>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">' +
    '<alignment vertical="top" wrapText="1"/></xf></cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '<dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleLight16"/>' +
    "</styleSheet>";
}

function xlsxFiles(opts) {
  const sheets = opts.sheets || [];
  const now = new Date().toISOString();
  const sheetOverrides = sheets.map(function (_, i) {
    return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
  }).join("");
  const contentTypes = XML_HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    sheetOverrides +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
    "</Types>";
  const rels = XML_HEAD + '<Relationships xmlns="' + PKG_REL_NS + '">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
    "</Relationships>";
  const sheetTags = sheets.map(function (sheet, i) {
    return '<sheet name="' + xml(sheet.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>';
  }).join("");
  const workbook = XML_HEAD + '<workbook xmlns="' + S_NS + '" xmlns:r="' + R_NS + '">' +
    '<fileVersion appName="xl" lastEdited="7" lowestEdited="7" rupBuild="24317"/><workbookPr/>' +
    '<bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews>' +
    "<sheets>" + sheetTags + "</sheets><calcPr calcId=\"191029\"/></workbook>";
  const wbRels = XML_HEAD + '<Relationships xmlns="' + PKG_REL_NS + '">' +
    sheets.map(function (_, i) {
      return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>';
    }).join("") +
    '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    "</Relationships>";
  const core = XML_HEAD + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
    'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    "<dc:title>" + xml(opts.title || "SAFE-PARKS decision table") + "</dc:title>" +
    "<dc:creator>SAFE-PARKS CISO function</dc:creator><cp:lastModifiedBy>SAFE-PARKS build</cp:lastModifiedBy>" +
    '<dcterms:created xsi:type="dcterms:W3CDTF">' + now + "</dcterms:created>" +
    '<dcterms:modified xsi:type="dcterms:W3CDTF">' + now + "</dcterms:modified></cp:coreProperties>";
  const titles = sheets.map(function (s) { return "<vt:lpstr>" + xml(s.name) + "</vt:lpstr>"; }).join("");
  const app = XML_HEAD + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" ' +
    'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
    "<Application>SAFE-PARKS build</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop>" +
    "<HeadingPairs><vt:vector size=\"2\" baseType=\"variant\"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant>" +
    "<vt:variant><vt:i4>" + sheets.length + "</vt:i4></vt:variant></vt:vector></HeadingPairs>" +
    '<TitlesOfParts><vt:vector size="' + sheets.length + '" baseType="lpstr">' + titles + "</vt:vector></TitlesOfParts>" +
    "<Company>Lotus Sirius</Company><AppVersion>16.0300</AppVersion></Properties>";
  const files = [
    { name: "[Content_Types].xml", data: contentTypes },
    { name: "_rels/.rels", data: rels },
    { name: "xl/workbook.xml", data: workbook },
    { name: "xl/_rels/workbook.xml.rels", data: wbRels },
    { name: "xl/styles.xml", data: xlsxStyles() },
    { name: "docProps/core.xml", data: core },
    { name: "docProps/app.xml", data: app }
  ];
  sheets.forEach(function (sheet, i) {
    files.push({ name: "xl/worksheets/sheet" + (i + 1) + ".xml", data: xlsxSheet(sheet, i) });
  });
  return files;
}

/* ---------- ZIP (store method; Office accepts uncompressed package parts) ---------- */
const CRC_TABLE = (function () {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zipStore(files) {
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  files.forEach(function (file) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(String(file.data), "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(Buffer.concat([central, name]));
    offset += local.length + name.length + data.length;
  });
  const centralDir = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat(localParts.concat([centralDir, end]));
}

function writeDocx(filePath, opts) {
  fs.writeFileSync(filePath, zipStore(docxFiles(opts)));
}

function writeXlsx(filePath, opts) {
  fs.writeFileSync(filePath, zipStore(xlsxFiles(opts)));
}

module.exports = { writeDocx: writeDocx, writeXlsx: writeXlsx, zipStore: zipStore };
