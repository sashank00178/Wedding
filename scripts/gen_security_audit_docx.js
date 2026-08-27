/**
 * Wedding Moment Nepal — Security Audit Report (Word .docx)
 * Output: /home/z/my-project/download/Wedding_Moment_Nepal_Security_Audit.docx
 *
 * Built with docx-js. Follows docx skill conventions:
 * - Cover in separate section, margin 0, 16838 outer wrapper table with allNoBorders
 * - Body uses Profile A (Formal): SimHei headings, SimSun body, line 312, indent 480
 * - HeadingLevel.HEADING_X for body chapters (so TOC could be added later)
 * - ShadingType.CLEAR only; WidthType.PERCENTAGE for table columns
 * - Page numbers: cover (none), body (Arabic, start at 1)
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Header, Footer, PageBreak,
  AlignmentType, HeadingLevel, PageNumber, NumberFormat, SectionType,
  Table, TableRow, TableCell, TableLayoutType, WidthType, BorderStyle,
  ShadingType, VerticalAlign, HeightRule, PageOrientation, LevelFormat,
  TabStopType, TabStopPosition, Break, ImageRun,
  convertInchesToTwip,
} = require("docx");

// ============================================================
// Palette — Dark Security Audit
// ============================================================
const P = {
  primary: "0F172A",      // near-black navy
  body: "1E293B",         // dark slate
  secondary: "64748B",    // muted gray
  accent: "DC2626",       // alert red
  critical: "B91C1C",
  high: "EA580C",
  medium: "CA8A04",
  low: "0891B2",
  info: "475569",
  surface: "F8FAFC",
  codeBg: "F1F5F9",
  border: "CBD5E1",
  gold: "B8860B",
  white: "FFFFFF",
  success: "15803D",
};

// ============================================================
// Helpers
// ============================================================
const safe = (v, ph = "[Please fill in]") =>
  (v === undefined || v === null || v === "" || String(v) === "NaN") ? ph : String(v);

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const ALL_NO_BORDERS = {
  top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
  insideHorizontal: NO_BORDER, insideVertical: NO_BORDER,
};
const THIN_BORDER = { style: BorderStyle.SINGLE, size: 4, color: P.border };
const THIN_ALL_BORDERS = {
  top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER,
  insideHorizontal: THIN_BORDER, insideVertical: THIN_BORDER,
};

// Body paragraph (justified, 1.3x line, 480 twip indent)
function body(text, opts = {}) {
  return new Paragraph({
    alignment: opts.alignment ?? AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: opts.after ?? 120 },
    indent: opts.noIndent ? undefined : { firstLine: 480 },
    children: parseInline(text, { size: 22, color: P.body, font: { ascii: "Calibri", eastAsia: "SimSun" } }),
  });
}

// Tight body (no indent, less space) — for bullet-like content
function bodyTight(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 40 },
    children: parseInline(text, { size: 22, color: P.body, font: { ascii: "Calibri", eastAsia: "SimSun" } }),
  });
}

// Inline parser — supports <b>...</b>, <i>...</i>, <code>...</code>
function parseInline(text, baseProps) {
  const runs = [];
  const re = /<(b|i|code)>(.*?)<\/\1>/g;
  let lastIdx = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) {
      runs.push(new TextRun({ ...baseProps, text: text.slice(lastIdx, m.index) }));
    }
    const [, tag, content] = m;
    if (tag === "b") {
      runs.push(new TextRun({ ...baseProps, text: content, bold: true }));
    } else if (tag === "i") {
      runs.push(new TextRun({ ...baseProps, text: content, italics: true }));
    } else if (tag === "code") {
      runs.push(new TextRun({
        text: content, size: 18, color: P.body,
        font: { ascii: "Consolas", eastAsia: "Consolas" },
      }));
    }
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) {
    runs.push(new TextRun({ ...baseProps, text: text.slice(lastIdx) }));
  }
  return runs;
}

// H1 — chapter heading
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180, line: 312 },
    children: [new TextRun({
      text, bold: true, size: 32, color: P.primary,
      font: { ascii: "Calibri", eastAsia: "SimHei" },
    })],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 4 },
    },
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120, line: 312 },
    children: [new TextRun({
      text, bold: true, size: 26, color: P.primary,
      font: { ascii: "Calibri", eastAsia: "SimHei" },
    })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 80, line: 312 },
    children: [new TextRun({
      text, bold: true, size: 22, color: P.primary,
      font: { ascii: "Calibri", eastAsia: "SimHei" },
    })],
  });
}

// Code block — monospace, shaded background, no indent, tight line
function codeBlock(code) {
  const lines = code.split("\n");
  return lines.map((line, idx) =>
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { line: 240, after: 0, before: 0 },
      indent: { left: 120, right: 120 },
      shading: { type: ShadingType.CLEAR, fill: P.codeBg, color: "auto" },
      border: idx === 0 ? {
        top: { style: BorderStyle.SINGLE, size: 4, color: P.border },
        left: { style: BorderStyle.SINGLE, size: 4, color: P.border },
        right: { style: BorderStyle.SINGLE, size: 4, color: P.border },
      } : idx === lines.length - 1 ? {
        bottom: { style: BorderStyle.SINGLE, size: 4, color: P.border },
        left: { style: BorderStyle.SINGLE, size: 4, color: P.border },
        right: { style: BorderStyle.SINGLE, size: 4, color: P.border },
      } : {
        left: { style: BorderStyle.SINGLE, size: 4, color: P.border },
        right: { style: BorderStyle.SINGLE, size: 4, color: P.border },
      },
      children: [new TextRun({
        text: line || " ",
        size: 18, color: P.body,
        font: { ascii: "Consolas", eastAsia: "Consolas" },
      })],
    })
  );
}

// Severity badge as a 1-cell shaded table
function severityBadge(level) {
  const colorMap = {
    CRITICAL: P.critical, HIGH: P.high, MEDIUM: P.medium,
    LOW: P.low, INFO: P.info,
  };
  const bg = colorMap[level.toUpperCase()] || P.info;
  return new Table({
    width: { size: 18, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: ALL_NO_BORDERS,
    rows: [new TableRow({
      height: { value: 280, rule: HeightRule.EXACT },
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: bg, color: "auto" },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: 240, before: 0, after: 0 },
          children: [new TextRun({
            text: level, bold: true, size: 16, color: P.white,
            font: { ascii: "Calibri", eastAsia: "SimHei" },
          })],
        })],
      })],
    })],
  });
}

// Finding block — badge + title row, then file:line, then labels and body
function findingBlock(id, severity, title, fileLine, whatsWrong, whyMatters, fixText, fixCode) {
  const out = [];
  // Title row: badge table + title paragraph in a 2-col table
  out.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: ALL_NO_BORDERS,
    columnWidths: [1500, 8500],
    rows: [new TableRow({
      children: [
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          borders: ALL_NO_BORDERS,
          children: [severityBadge(severity)],
        }),
        new TableCell({
          width: { size: 85, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          borders: ALL_NO_BORDERS,
          margins: { left: 200 },
          children: [new Paragraph({
            spacing: { line: 312, before: 0, after: 0 },
            children: [
              new TextRun({
                text: `${id}.  `, bold: true, size: 26, color: P.primary,
                font: { ascii: "Calibri", eastAsia: "SimHei" },
              }),
              new TextRun({
                text: title, bold: true, size: 26, color: P.primary,
                font: { ascii: "Calibri", eastAsia: "SimHei" },
              }),
            ],
          })],
        }),
      ],
    })],
  }));

  // File:line (mono, muted)
  out.push(new Paragraph({
    spacing: { before: 60, after: 100, line: 240 },
    children: [new TextRun({
      text: fileLine, size: 16, color: P.secondary,
      font: { ascii: "Consolas", eastAsia: "Consolas" },
    })],
  }));

  // What's wrong
  out.push(new Paragraph({
    spacing: { before: 60, after: 40, line: 312 },
    children: [new TextRun({
      text: "What's wrong", bold: true, size: 20, color: P.primary,
      font: { ascii: "Calibri", eastAsia: "SimHei" },
    })],
  }));
  out.push(body(whatsWrong));

  // Why it matters
  out.push(new Paragraph({
    spacing: { before: 60, after: 40, line: 312 },
    children: [new TextRun({
      text: "Why it matters", bold: true, size: 20, color: P.primary,
      font: { ascii: "Calibri", eastAsia: "SimHei" },
    })],
  }));
  out.push(body(whyMatters));

  // Suggested fix
  if (fixText) {
    out.push(new Paragraph({
      spacing: { before: 60, after: 40, line: 312 },
      children: [new TextRun({
        text: "Suggested fix", bold: true, size: 20, color: P.primary,
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      })],
    }));
    out.push(body(fixText));
  }
  if (fixCode) {
    out.push(new Paragraph({
      spacing: { before: 60, after: 40, line: 312 },
      children: [new TextRun({
        text: "Suggested fix (code)", bold: true, size: 20, color: P.primary,
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      })],
    }));
    out.push(...codeBlock(fixCode));
  }
  // Spacer
  out.push(new Paragraph({ spacing: { before: 120, after: 0, line: 240 }, children: [new TextRun({ text: "" })] }));
  return out;
}

// Table builder — header row + data rows
function buildTable(header, rows, colPercents) {
  const headerCells = header.map(h =>
    new TableCell({
      width: { size: colPercents[header.indexOf(h)], type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: P.primary, color: "auto" },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        spacing: { line: 240, before: 0, after: 0 },
        children: [new TextRun({
          text: h, bold: true, size: 18, color: P.white,
          font: { ascii: "Calibri", eastAsia: "SimHei" },
        })],
      })],
    })
  );
  const dataRows = rows.map((row, idx) =>
    new TableRow({
      cantSplit: true,
      children: row.map((cell, ci) =>
        new TableCell({
          width: { size: colPercents[ci], type: WidthType.PERCENTAGE },
          shading: idx % 2 === 0 ? undefined :
            { type: ShadingType.CLEAR, fill: P.surface, color: "auto" },
          verticalAlign: VerticalAlign.TOP,
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            spacing: { line: 260, before: 0, after: 0 },
            children: typeof cell === "string"
              ? [new TextRun({
                  text: cell, size: 18, color: P.body,
                  font: { ascii: "Calibri", eastAsia: "SimSun" },
                })]
              : parseInline(cell.text || String(cell), { size: 18, color: cell.color || P.body, font: { ascii: "Calibri", eastAsia: "SimSun" } }),
          })],
        })
      ),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: colPercents.map(p => Math.round(9300 * p / 100)),
    borders: THIN_ALL_BORDERS,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: headerCells }),
      ...dataRows,
    ],
  });
}

// Spacer paragraph
function spacer(twips = 200) {
  return new Paragraph({ spacing: { before: twips, after: 0, line: 240 }, children: [new TextRun({ text: "" })] });
}

// ============================================================
// Cover page — R1-style: full-page wrapper table, dark background
// ============================================================
function buildCover() {
  // Inner cell contents stacked vertically
  const coverContent = [
    // Top spacer
    new Paragraph({ spacing: { before: 1200, after: 0, line: 240 }, children: [new TextRun({ text: "" })] }),
    // Eyebrow
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 120, line: 240 },
      indent: { left: 800 },
      children: [new TextRun({
        text: "SECURITY AUDIT REPORT", bold: true, size: 18, color: "94A3B8",
        font: { ascii: "Calibri", eastAsia: "SimHei" },
        characterSpacing: 60,
      })],
    }),
    // Title (big)
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 100, line: 720, lineRule: "atLeast" },
      indent: { left: 800 },
      children: [new TextRun({
        text: "Wedding Moment Nepal", bold: true, size: 64, color: P.white,
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      })],
    }),
    // Subtitle
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 200, line: 360 },
      indent: { left: 800 },
      children: [new TextRun({
        text: "Next.js 16 Storefront — Hardening Review",
        size: 28, color: "E2E8F0",
        font: { ascii: "Calibri", eastAsia: "SimSun" },
      })],
    }),
    // Tagline
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 600, line: 280 },
      indent: { left: 800 },
      children: [new TextRun({
        text: "Code-level audit + deployment hardening plan",
        size: 20, color: "CBD5E1", italics: true,
        font: { ascii: "Calibri", eastAsia: "SimSun" },
      })],
    }),
    // Severity bar — single row table inside cover cell
    new Table({
      width: { size: 75, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      borders: ALL_NO_BORDERS,
      indent: { size: 800, type: WidthType.DXA },
      columnWidths: [1500, 1500, 1800, 1500],
      rows: [new TableRow({
        height: { value: 400, rule: HeightRule.EXACT },
        children: [
          ["8 CRITICAL", P.critical],
          ["9 HIGH", P.high],
          ["14 MEDIUM", P.medium],
          ["19 LOW", P.low],
        ].map(([label, color]) => new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: color, color: "auto" },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, before: 0, after: 0 },
            children: [new TextRun({
              text: label, bold: true, size: 16, color: P.white,
              font: { ascii: "Calibri", eastAsia: "SimHei" },
            })],
          })],
        })),
      })],
    }),
    // Verdict block
    new Paragraph({ spacing: { before: 600, after: 0, line: 240 }, indent: { left: 800 }, children: [new TextRun({ text: "" })] }),
  ];

  // Verdict block — a small sub-table
  const verdictTable = new Table({
    width: { size: 85, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: ALL_NO_BORDERS,
    indent: { size: 800, type: WidthType.DXA },
    columnWidths: [8000],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: "1E293B", color: "auto" },
        borders: {
          ...ALL_NO_BORDERS,
          left: { style: BorderStyle.SINGLE, size: 24, color: P.accent },
        },
        margins: { top: 240, bottom: 240, left: 360, right: 240 },
        children: [
          new Paragraph({
            spacing: { line: 280, before: 0, after: 80 },
            children: [new TextRun({
              text: "VERDICT", bold: true, size: 18, color: P.accent,
              font: { ascii: "Calibri", eastAsia: "SimHei" },
              characterSpacing: 40,
            })],
          }),
          new Paragraph({
            spacing: { line: 320, before: 0, after: 60 },
            children: [new TextRun({
              text: "Do not deploy to production until all 8 Critical",
              bold: true, size: 24, color: P.white,
              font: { ascii: "Calibri", eastAsia: "SimHei" },
            })],
          }),
          new Paragraph({
            spacing: { line: 320, before: 0, after: 0 },
            children: [new TextRun({
              text: "findings are closed and re-verified.",
              bold: true, size: 24, color: P.white,
              font: { ascii: "Calibri", eastAsia: "SimHei" },
            })],
          }),
        ],
      })],
    })],
  });

  // Footer meta (positioned near the bottom of the cover)
  const footerMeta = [
    new Paragraph({ spacing: { before: 3000, after: 0, line: 240 }, children: [new TextRun({ text: "" })] }),
    new Paragraph({
      spacing: { line: 260, before: 0, after: 60 },
      indent: { left: 800 },
      children: [new TextRun({
        text: "Prepared by   Z.ai Security Review",
        size: 16, color: "94A3B8",
        font: { ascii: "Calibri", eastAsia: "SimSun" },
      })],
    }),
    new Paragraph({
      spacing: { line: 260, before: 0, after: 60 },
      indent: { left: 800 },
      children: [new TextRun({
        text: "Report date     2026-07-27",
        size: 16, color: "94A3B8",
        font: { ascii: "Calibri", eastAsia: "SimSun" },
      })],
    }),
    new Paragraph({
      spacing: { line: 260, before: 0, after: 60 },
      indent: { left: 800 },
      children: [new TextRun({
        text: "Classification  Confidential — Studio Owner Use Only",
        size: 16, color: "94A3B8",
        font: { ascii: "Calibri", eastAsia: "SimSun" },
      })],
    }),
    new Paragraph({
      spacing: { line: 260, before: 0, after: 60 },
      indent: { left: 800 },
      children: [new TextRun({
        text: "Document ID   WMN-SEC-001   ·   Version 1.0",
        size: 16, color: "94A3B8",
        font: { ascii: "Calibri", eastAsia: "SimSun" },
      })],
    }),
  ];

  // Full-page outer wrapper table — dark background, 16838 height
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: [11906],
    borders: ALL_NO_BORDERS,
    rows: [new TableRow({
      height: { value: 16838, rule: HeightRule.EXACT },
      cantSplit: true,
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: P.primary, color: "auto" },
        borders: {
          ...ALL_NO_BORDERS,
          left: { style: BorderStyle.SINGLE, size: 36, color: P.accent },
        },
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        verticalAlign: VerticalAlign.TOP,
        children: [...coverContent, verdictTable, ...footerMeta],
      })],
    })],
  })];
}

// ============================================================
// BODY CONTENT
// ============================================================
const bodyContent = [];

// === 1. Executive Summary ===
bodyContent.push(h1("1. Executive Summary"));
bodyContent.push(body(
  "The Wedding Moment Nepal storefront is a custom Next.js 16 application that handles customer "
  + "personally identifiable information (PII) — names, email addresses, phone numbers, wedding "
  + "dates — and processes payment initiation through the eSewa and Khalti Nepali payment gateways. "
  + "A static code review of the entire <code>src/</code> tree, the Prisma schema, the deployment "
  + "scripts, and the Caddy reverse proxy configuration has identified <b>50 security findings</b>: "
  + "8 Critical, 9 High, 14 Medium, and 19 Low / Informational. Several of these issues are "
  + "individually critical; together they constitute a systemic security failure that would block "
  + "any responsible production deployment."
));
bodyContent.push(body(
  "The most urgent findings are: (1) the production Caddyfile contains an unauthenticated "
  + "reverse-proxy vulnerability that allows any external attacker to probe arbitrary localhost "
  + "ports on the server (<b>C-8</b>); (2) the <code>GET /api/bookings</code> endpoint has no "
  + "authentication and returns the 50 most recent customer bookings — including PII — to any "
  + "anonymous caller (<b>C-1</b>); (3) the SQLite database and the <code>.env</code> file are "
  + "both committed to git history with real customer data and configuration (<b>C-5, C-6</b>); "
  + "(4) the build script copies the development database verbatim into the production tarball "
  + "(<b>C-7</b>); and (5) when the eSewa or Khalti secret keys are unset, the application "
  + "silently enters a <i>demo mode</i> that marks orders as paid without any actual payment "
  + "occurring (<b>C-3</b>)."
));
bodyContent.push(body(
  "Beyond the Critical tier, the application lacks every baseline control expected of a "
  + "payment-handling web app: no input validation framework (Zod is installed but unused), no "
  + "rate limiting on any endpoint, no CSRF protection, no Content-Security-Policy or other "
  + "security headers, no authentication system (the <code>next-auth</code> dependency is "
  + "declared but never wired up), no audit log table, and no payment callback routes — meaning "
  + "that even after a customer pays, the order row is never updated from <i>initiated</i> to "
  + "<i>paid</i>, because the callback URLs configured in the eSewa/Khalti initiate requests "
  + "simply return a 404."
));
bodyContent.push(body(
  "<b>Verdict.</b> Do not deploy this build to a production environment. The recommended path is "
  + "to complete Tier 1 of the remediation roadmap in this report (approximately 4 hours of work) "
  + "before any further production activity, then proceed through Tier 2 and Tier 3 in the "
  + "following two weeks. Section 10 of this report contains a written incident-response plan "
  + "that should be operational before the site accepts real customer payments."
));

// === 2. Scope & Methodology ===
bodyContent.push(h1("2. Scope & Methodology"));
bodyContent.push(body(
  "<b>In scope.</b> Every source file under <code>src/</code> (API routes, components, library "
  + "code, configuration), the Prisma schema at <code>prisma/schema.prisma</code>, the public "
  + "assets directory, and all root-level configuration files including <code>next.config.ts</code>, "
  + "<code>Caddyfile</code>, <code>package.json</code>, <code>.env</code>, and the build/start "
  + "scripts under <code>.zscripts/</code>. Dependencies declared in <code>package.json</code> "
  + "were checked against current advisory databases for known vulnerabilities."
));
bodyContent.push(body(
  "<b>Out of scope.</b> The runtime container, the network layer beyond the Caddyfile, the CI/CD "
  + "pipeline (none exists at present), and the external eSewa and Khalti servers themselves. The "
  + "reviewer did not perform dynamic penetration testing, fuzzing, or runtime exploit "
  + "verification — all findings are derived from static analysis of the code as committed at "
  + "<code>7c7ffec</code> on the project's main branch."
));
bodyContent.push(body(
  "<b>Methodology.</b> Each file was read in full. API routes were assessed against the OWASP API "
  + "Security Top 10 (2023). Payment flows were compared against the official eSewa v2 and Khalti "
  + "v2 integration specifications. Configuration files were checked against the Next.js and "
  + "Caddy hardening guides. Findings were graded on a five-level severity scale (Critical / High "
  + "/ Medium / Low / Informational) based on exploitability, blast radius, and the sensitivity "
  + "of the data at risk. Every finding references its exact file path and line number to enable "
  + "rapid remediation."
));
bodyContent.push(body(
  "<b>Stack translation note.</b> The user's original request asked for a Shopify/WooCommerce "
  + "security review. The actual application is neither — it is a custom Next.js storefront. The "
  + "10 original checklist items have been translated to fit the real stack, and Appendix A "
  + "provides the inverse mapping (each Next.js finding → what it would correspond to on "
  + "Shopify/WooCommerce) in case the studio ever migrates platforms."
));

// === 3. Stack Overview ===
bodyContent.push(h1("3. Stack Overview"));
bodyContent.push(body(
  "The audited application is built on Next.js 16.1.1 with the App Router, using Turbopack as the "
  + "bundler and <code>output: \"standalone\"</code> for production builds. The database is SQLite, "
  + "accessed through Prisma ORM 6.11.1, with the database file persisted at <code>db/custom.db</code> "
  + "inside the project root. Payment integration uses the eSewa v2 HMAC-SHA256 signed flow and "
  + "the Khalti v2 server-to-server ePayment initiation API. The production runtime is Bun (not "
  + "Node.js), fronted by a Caddy 2 reverse proxy listening on port 81. The frontend uses Tailwind "
  + "CSS 4 with the shadcn/ui component library, next-themes for dark mode, and Google Fonts "
  + "(Montserrat body, Playfair Display headings)."
));
bodyContent.push(body(
  "The deployment model is unusual: the build script (<code>.zscripts/build.sh</code>) produces a "
  + "tarball that contains the standalone Next.js server, a copy of the development SQLite "
  + "database, the Caddyfile, and a start script. This tarball is uploaded to the hosting "
  + "environment and started with <code>caddy run</code> as PID 1, which in turn spawns "
  + "<code>bun server.js</code> as a child process. There is no Dockerfile, no "
  + "infrastructure-as-code, no CI/CD pipeline, and no automated backup mechanism — the SQLite "
  + "file lives in the container filesystem and is lost if the container is recreated."
));

// === 4. Checklist Mapping ===
bodyContent.push(h1("4. Original 10-Point Checklist — Translated to Actual Stack"));
bodyContent.push(body(
  "The user's original request contained 10 checklist items framed for Shopify/WooCommerce. The "
  + "table below maps each item to its equivalent concern in the actual Next.js stack and gives "
  + "the current status. Detailed findings for each failed item appear in Sections 5–8."
));

const checklistRows = [
  ["1", "HTTPS / SSL enforced site-wide", "Caddy TLS + HSTS header in next.config.ts", "FAIL — no HSTS, no security headers (H-4)"],
  ["2", "Audit installed plugins/apps", "npm dependencies + custom API routes", "FAIL — unused deps, no rate limit (H-1, H-2, L-6/7/8)"],
  ["3", "Two-factor auth on admin accounts", "No User model exists; next-auth declared but unused", "FAIL — no auth system whatsoever (C-1, M-7)"],
  ["4", "Daily off-site backups + restore test", "SQLite file + cron + S3 sync", "FAIL — no backups configured anywhere"],
  ["5", "Review user roles / remove admin access", "Prisma User model + role middleware", "FAIL — no users, no roles, no admin panel (M-7)"],
  ["6", "Rate-limiting / brute-force protection", "Middleware or Upstash Ratelimit on routes", "FAIL — zero rate limiting; no middleware.ts (H-2)"],
  ["7", "Scan for malware / injected code", "Repo scan of src/ + public/", "PARTIAL — no malware found, but Caddyfile SSRF (C-8) is worse"],
  ["8", "PCI-compliant payment provider", "eSewa + Khalti are PCI-compliant gateways", "AT RISK — gateways OK, but no callback verification (C-2, C-3, C-4)"],
  ["9", "Activity logging for admin actions", "AuditLog Prisma model + middleware", "FAIL — no audit log; Prisma logs PII to stdout (H-8, M-7)"],
  ["10", "Written incident-response plan", "This report, Section 10", "PROVIDED — see Section 10 of this report"],
];
bodyContent.push(buildTable(
  ["#", "Original Checklist Item", "Next.js Stack Equivalent", "Status"],
  checklistRows,
  [5, 30, 35, 30]
));
bodyContent.push(spacer(200));
bodyContent.push(body(
  "<b>Translation principle.</b> Three of the original items (HTTPS, plugin audit, brute-force "
  + "protection) translate almost directly: HTTPS becomes Caddy TLS plus HSTS in Next.js config; "
  + "the plugin audit becomes an npm dependency review; brute-force protection becomes "
  + "rate-limiting middleware. Three items (2FA, user roles, activity logging) cannot be addressed "
  + "at all in the current build because the application has no concept of a user account — there "
  + "is no User model, no login form, no session cookie. These items require adding NextAuth plus "
  + "a Prisma User and AuditLog model before they can even be evaluated. The remaining items "
  + "(backups, malware scan, PCI compliance, IR plan) are operational rather than code-level and "
  + "are addressed in Sections 10 and 11."
));

bodyContent.push(new Paragraph({ children: [new PageBreak()] }));

// === 5. Critical Findings ===
bodyContent.push(h1("5. Critical Findings (8)"));
bodyContent.push(body(
  "Critical findings represent issues that allow direct compromise of customer data, direct "
  + "financial loss, or remote code execution. Each must be closed before any production "
  + "deployment. Estimated remediation effort for all 8 Critical findings: approximately 6–10 "
  + "hours of developer time."
));

bodyContent.push(...findingBlock(
  "C-1", "CRITICAL",
  "Unauthenticated GET /api/bookings leaks customer PII",
  "src/app/api/bookings/route.ts:43-57",
  "The GET handler returns the 50 most recent bookings to any caller with no authentication, no "
  + "API key check, no origin check, and no auth header verification. A grep across the entire "
  + "<code>src/</code> tree confirms zero matches for <code>getServerSession</code>, "
  + "<code>signIn</code>, <code>next-auth</code>, or <code>requireAuth</code> — authentication "
  + "has never been wired up anywhere in the application.",
  "Any anonymous internet user can run <code>curl https://<prod-domain>/api/bookings</code> and "
  + "immediately receive a JSON array containing real customer names, email addresses, phone "
  + "numbers, requested service types, wedding dates, and free-text messages. This is a direct "
  + "violation of the Nepal Privacy Act 2075 and would constitute a notifiable data breach under "
  + "GDPR if any European data subjects have submitted bookings. The same exposure applies to "
  + "any future GET endpoint added to /api/contact or /api/payment.",
  "Remove the GET handler, or require an authenticated admin session before returning any data. "
  + "The next-auth dependency is already declared in package.json — it just needs to be "
  + "configured (see M-7 for the User and AuditLog schema additions).",
  `// Option A: delete the GET handler entirely if not needed.
// Option B: gate behind NextAuth admin session.
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({}, { status: 401 });
  }
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ success: true, bookings });
}`
));

bodyContent.push(...findingBlock(
  "C-2", "CRITICAL",
  "Payment callback routes do not exist — no signature verification, orders never marked paid",
  "src/app/api/payment/esewa/initiate/route.ts:83-84, src/app/api/payment/khalti/initiate/route.ts:70",
  "Both payment initiation routes configure success/failure callback URLs pointing to "
  + "<code>/api/payment/esewa/callback</code> and <code>/api/payment/khalti/callback</code>, but "
  + "no such route files exist. A filesystem search under <code>src/app/api/</code> returns only "
  + "<code>bookings</code>, <code>contact</code>, <code>payment/esewa/initiate</code>, and "
  + "<code>payment/khalti/initiate</code> — no callback directories.",
  "In production, after a customer completes payment, eSewa redirects their browser to the "
  + "callback URL with a base64-encoded data payload and an HMAC-SHA256 signature. That URL "
  + "currently returns a 404, so the customer sees a broken page immediately after paying. "
  + "Worse, the PaymentOrder row in the database is never updated from <i>initiated</i> to "
  + "<i>paid</i> — the studio has no automated record that payment occurred. Even if a callback "
  + "route is later added without proper verification, an attacker could forge a callback "
  + "request and mark any order paid, because the eSewa HMAC signature is currently never "
  + "checked server-side. Khalti has the same gap: its server-to-server lookup verification step "
  + "is also missing.",
  "Implement callback routes for both gateways. For eSewa: verify the HMAC signature using the "
  + "secret key, then mark the order paid. For Khalti: call the /api/v2/epayment/lookup/ "
  + "endpoint server-side with the pidx to verify status. Always use crypto.timingSafeEqual for "
  + "signature comparison to prevent timing attacks.",
  `// src/app/api/payment/esewa/callback/route.ts
import crypto from 'crypto';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const data = String(form.get('data') || '');
  const signature = String(form.get('signature') || '');
  const signedFieldNames = String(form.get('signed_field_names') || '');

  // Re-derive the signature from the returned fields in the order eSewa specifies.
  const fields = signedFieldNames.split(',').map(f => \`\${f}=\${form.get(f)}\`).join(',');
  const expected = crypto
    .createHmac('sha256', process.env.ESEWA_SECRET_KEY!)
    .update(fields)
    .digest('base64');

  // Constant-time comparison to prevent timing attacks.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Decode the data payload, look up the order, mark it paid.
  const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
  await db.paymentOrder.update({
    where: { transactionUuid: decoded.transaction_uuid },
    data: { status: 'paid', rawResponse: data },
  });
  return NextResponse.redirect(\`\${process.env.FRONTEND_URL}/payment/success\`);
}`
));

bodyContent.push(...findingBlock(
  "C-3", "CRITICAL",
  "Demo mode silently marks orders as paid without any payment",
  "src/app/api/payment/esewa/initiate/route.ts:45-67, src/app/api/payment/khalti/initiate/route.ts:43-66",
  "When <code>ESEWA_SECRET_KEY</code> or <code>KHALTI_SECRET_KEY</code> is unset, both routes log "
  + "a warning and then immediately persist a PaymentOrder row with <code>status: \"paid\"</code> "
  + "and <code>rawResponse: \"demo_mode\"</code>, returning a success response to the client. The "
  + "current <code>.env</code> file contains only DATABASE_URL — neither secret is set — so the "
  + "deployed app is currently in demo mode, meaning every payment is free.",
  "If this build is deployed to production without setting the env vars (and the build script "
  + "does not enforce their presence), any visitor can pay NPR 1 for a NPR 14,999 wedding package "
  + "and immediately receive a success confirmation, with the database marking the order paid. "
  + "The studio would show up to photograph a wedding that was never paid for. Even if the env "
  + "vars are correctly set in production, the demo branch remains in the code — any future "
  + "misconfiguration silently disables payment enforcement with no error or alarm.",
  "Remove the demo branch entirely. If demo mode is needed for local development, gate it behind "
  + "NODE_ENV !== 'production' AND an explicit PAYMENT_DEMO_MODE=1 flag, and never auto-set "
  + "status to 'paid' — use status: 'demo' instead. At boot, fail-fast if production env is "
  + "missing any required secret.",
  `// Remove the demo branch entirely. Fail fast in production.
// src/lib/env.ts (new file)
export function assertProdEnv() {
  if (process.env.NODE_ENV !== 'production') return;
  const required = [
    'DATABASE_URL', 'ESEWA_SECRET_KEY', 'ESEWA_PRODUCT_CODE',
    'KHALTI_SECRET_KEY', 'BACKEND_URL', 'FRONTEND_URL', 'NEXTAUTH_SECRET',
  ];
  for (const k of required) {
    if (!process.env[k]) {
      throw new Error(\`Missing required env var: \${k}\`);
    }
  }
}

// Call assertProdEnv() at the top of every payment route handler.`
));

bodyContent.push(...findingBlock(
  "C-4", "CRITICAL",
  "Server fully trusts client-supplied payment amount",
  "src/app/api/payment/esewa/initiate/route.ts:18-27, src/app/api/payment/khalti/initiate/route.ts:16-26",
  "Both payment initiation routes read <code>amount</code> from the JSON request body and use it "
  + "directly as the charge amount after only a basic <code>Number(amount) > 0</code> check. The "
  + "server never cross-references the supplied <code>packageName</code> against the canonical "
  + "SERVICES list in <code>src/lib/site.ts</code> to verify that the amount matches the actual "
  + "price.",
  "An attacker can submit a request like <code>{\"amount\":1, \"packageName\":\"Wedding "
  + "Photography\", \"customerName\":\"x\", \"customerPhone\":\"x\"}</code> and pay NPR 1 for a "
  + "NPR 14,999 wedding package. In production with real eSewa, the customer is charged NPR 1 "
  + "and the studio is contractually on the hook for a wedding. In demo mode (the current state "
  + "of the deployed app), the order is marked paid for NPR 1. The same attack applies to Khalti.",
  "Never trust client-supplied payment amounts. The server should look up the package by a "
  + "stable key (not by name) and use the canonical price from the server-side SERVICES constant. "
  + "Optionally also enforce idempotency tokens so the amount can't change between quote and charge.",
  `// Look up the package server-side; ignore client-supplied amount.
import { SERVICES } from '@/lib/site';

export async function POST(req: NextRequest) {
  const { packageKey, customerName, customerPhone } = await req.json();
  const pkg = SERVICES.find(s => s.key === packageKey);
  if (!pkg) {
    return NextResponse.json({ error: 'Unknown package' }, { status: 400 });
  }
  const totalAmount = String(pkg.priceFrom); // server-side canonical price
  // ... proceed with eSewa/Khalti initiation using totalAmount
}`
));

bodyContent.push(...findingBlock(
  "C-5", "CRITICAL",
  "SQLite database with customer PII committed to git",
  "db/custom.db (binary file, tracked since initial commit 2a64e5d)",
  "The SQLite database file <code>db/custom.db</code> is tracked in git. Running <code>strings "
  + "db/custom.db | head -80</code> reveals real-looking PII: names, emails, phone numbers, "
  + "transaction UUIDs, and payment statuses. The .gitignore rule for <code>*.log</code> and "
  + "<code>.env*</code> does not retroactively untrack files that were committed before the rule "
  + "was added.",
  "Anyone with read access to the repository — future contributors, anyone a remote is pushed "
  + "to, anyone who purchases the source code from a contractor — has the full customer PII "
  + "dataset, forever, in git history. Even if the current data is test data, the schema is "
  + "designed to hold real customer PII, and the workflow commits the DB on every change. If "
  + "real customer data is ever added and pushed, it cannot be removed without rewriting git "
  + "history and force-pushing every remote.",
  "Remove the file from tracking, add an explicit gitignore rule, purge history with git "
  + "filter-repo or BFG, force-push all remotes, and notify any affected customers. For "
  + "production, point DATABASE_URL at a path outside the repo (e.g. /var/lib/wedding-moment-"
  + "nepal/custom.db).",
  `# 1. Stop tracking the file (keeps local copy).
git rm --cached db/custom.db

# 2. Add to .gitignore (explicit, not wildcard).
echo 'db/*.db' >> .gitignore
echo 'db/*.db-journal' >> .gitignore

# 3. Purge ALL historical copies from every commit.
git filter-repo --path db/custom.db --invert-paths
# (or use BFG Repo-Cleaner: java -jar bfg.jar --delete-files custom.db)

# 4. Force-push to overwrite every remote.
git push origin --force --all
git push origin --force --tags

# 5. Rotate any real PII that was committed. Notify affected customers
#    if these are real bookings (required under Nepal Privacy Act 2075).`
));

bodyContent.push(...findingBlock(
  "C-6", "CRITICAL",
  ".env file committed to git",
  ".env (currently 1 line: DATABASE_URL=...), tracked since initial commit",
  "The <code>.env</code> file is tracked in git. It currently contains only DATABASE_URL, but "
  + "the .gitignore pattern <code>.env*</code> was added after the file was already committed, "
  + "so it remains tracked. The pattern of committing .env is already established; the moment "
  + "anyone adds ESEWA_SECRET_KEY, KHALTI_SECRET_KEY, or NEXTAUTH_SECRET to the file, those "
  + "secrets ship to the repo.",
  "This is a near-certain future secret leak. The eSewa and Khalti secret keys control real "
  + "money movement — anyone with the eSewa product code and secret could forge payment "
  + "confirmations for the studio's account. The NEXTAUTH_SECRET controls session token signing, "
  + "and its leak would allow an attacker to forge admin sessions. The current state (only "
  + "DATABASE_URL exposed) is a warning shot, not a stable situation.",
  "Untrack .env, add explicit gitignore rules, purge history, force-push. Use a secrets manager "
  + "(Doppler, Vault, AWS SSM) or at minimum an untracked .env.local for development. Document "
  + "required env vars in a committed .env.example that contains no real values.",
  `# 1. Stop tracking .env.
git rm --cached .env

# 2. Be explicit in .gitignore (don't rely on wildcard).
echo '.env' >> .gitignore
echo '.env.local' >> .gitignore
echo '.env.production' >> .gitignore

# 3. Purge from history.
git filter-repo --path .env --invert-paths
git push origin --force --all

# 4. Create .env.example (committed) with placeholder values:
#    DATABASE_URL=file:./db/custom.db
#    ESEWA_SECRET_KEY=your_esewa_secret_here
#    ESEWA_PRODUCT_CODE=your_merchant_code
#    KHALTI_SECRET_KEY=your_khalti_secret_here
#    BACKEND_URL=https://weddingmomentnepal.com
#    FRONTEND_URL=https://weddingmomentnepal.com
#    NEXTAUTH_SECRET=run \`openssl rand -base64 32\`
#    NEXTAUTH_URL=https://weddingmomentnepal.com`
));

bodyContent.push(...findingBlock(
  "C-7", "CRITICAL",
  "Build script ships the dev database to production",
  ".zscripts/build.sh:143-156",
  "The build script explicitly copies the development SQLite database (the same one committed to "
  + "git, containing test entries) into the production build tarball, then runs <code>prisma db "
  + "push --accept-data-loss</code> against the copy. The comment in the script reads \"Copy the "
  + "test environment database to the build artifact; production uses this database directly\".",
  "Production customers see a database pre-populated with dev test data (Sujan Dai, Jane Smith, "
  + "Test User, etc.). When production starts writing real bookings, those real bookings layer on "
  + "top of test data, mixing real and fake PII. Additionally, <code>db push "
  + "--accept-data-loss</code> is destructive — if the schema has changed since the dev DB was "
  + "created, columns may be dropped silently during build, losing data without warning. The "
  + "deployed production environment starts in a known-bad state.",
  "Never copy a dev database into production. The build script should create an empty production "
  + "DB at build time (prisma db push against a fresh file, no cp). Better: production should not "
  + "ship with a DB file at all — DATABASE_URL should point at a managed Postgres or a persistent "
  + "volume mounted at runtime.",
  `# In .zscripts/build.sh — REPLACE the database copy block:

# OLD (delete this):
# if [ -f './db/custom.db' ]; then
#     mkdir -p "$BUILD_DIR/db"
#     cp -r ./db/. "$BUILD_DIR/db/"
#     DATABASE_URL="file:$BUILD_DIR/db/custom.db" bun run db:push
# fi

# NEW: create an empty production database with the current schema.
mkdir -p "$BUILD_DIR/db"
DATABASE_URL="file:$BUILD_DIR/db/custom.db" bun run db:push
# The production database starts empty. Real data is added by customers.`
));

bodyContent.push(...findingBlock(
  "C-8", "CRITICAL",
  "Caddyfile has unauthenticated SSRF via XTransformPort query parameter",
  "Caddyfile:2-13",
  "The production Caddyfile contains a route that reads <code>XTransformPort</code> from the "
  + "query string and reverse-proxies the request to <code>localhost:{query.XTransformPort}</code>. "
  + "There is no allowlist, no authentication, no validation. Any external request to "
  + "<code>http://<host>:81/?XTransformPort=<port></code> causes Caddy to open a connection to "
  + "that localhost port and pipe the response back.",
  "This is a textbook server-side request forgery (SSRF) and proxy bypass. An attacker can probe "
  + "every port on localhost (1 through 65535) to map internal services; reach internal-only "
  + "admin panels, metrics endpoints (Prometheus on :9090), Docker socket proxies, Redis (:6379), "
  + "Postgres (:5432), cloud metadata services; and bounce requests through Caddy to disguise "
  + "their origin. The Caddyfile is committed to git and loaded by "
  + "<code>.zscripts/start.sh:145</code> as the production proxy. This vulnerability is remotely "
  + "exploitable by anyone who can reach the server.",
  "Remove the @transform_port_query block entirely. If port transformation is genuinely needed "
  + "(it appears to be a sandbox debugging aid), bind to 127.0.0.1 only and require an "
  + "HMAC-signed token. At minimum, restrict to a known allowlist of ports.",
  `# Caddyfile — DELETE this entire block:
@transform_port_query {
    query XTransformPort=*
}
handle @transform_port_query {
    reverse_proxy localhost:{query.XTransformPort} {
        header_up Host {host}
    }
}

# If port transformation is genuinely needed (it appears to be a sandbox
# debugging aid), bind to 127.0.0.1 only and require an HMAC-signed token:
# @allowed_port {
#     query XTransformPort=3000
#     expression {http.request.header.X-Debug-Token} eq "{env.DEBUG_TOKEN}"
# }`
));

bodyContent.push(new Paragraph({ children: [new PageBreak()] }));

// === 6. High Findings ===
bodyContent.push(h1("6. High Findings (9)"));
bodyContent.push(body(
  "High findings represent issues that materially weaken the security posture but are not "
  + "individually exploitable to the point of immediate compromise. They should be closed within "
  + "the first week of remediation work."
));

bodyContent.push(...findingBlock(
  "H-1", "HIGH",
  "No input validation framework — Zod installed but unused",
  "All four API routes (bookings/route.ts:9-16, contact/route.ts:9-16, esewa/initiate/route.ts:18-25, khalti/initiate/route.ts:16-23)",
  "The package.json declares <code>zod@^4.0.2</code>, but no route imports it. Validation is "
  + "ad-hoc: <code>if (!name || !email || !phone || !service || !date)</code>, followed by "
  + "<code>String(name)</code> coercion. No email format check, no phone normalization, no length "
  + "cap, no service enum validation, no date parsing.",
  "A booking with <code>email: \"not-an-email\"</code>, <code>phone: \"<script>alert(1)</script>"
  + "\"</code>, <code>service: \"anything-not-in-our-list\"</code>, <code>date: \"1900-13-99\""
  + "\"</code>, or <code>message: <10 MB string></code> is accepted and persisted. "
  + "<code>String(name)</code> on an object produces \"[object Object]\". A 10 MB message will be "
  + "written to SQLite, allowing trivial database bloat DoS. If any future admin UI renders the "
  + "message field without escaping, it becomes a stored XSS.",
  undefined,
  `import { z } from 'zod';

const BookingSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().regex(/^\\+?[\\d\\s-]{6,20}$/),
  service: z.enum(['portrait','wedding','commercial','event']),
  date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/)
    .refine(s => new Date(s) > new Date(), 'Date must be in the future'),
  message: z.string().max(5000).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = BookingSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 422 });
  }
  const booking = await db.booking.create({ data: parsed.data });
  // ...
}`
));

bodyContent.push(...findingBlock(
  "H-2", "HIGH",
  "No rate limiting anywhere",
  "Confirmed by grep — zero matches for 'rate.?limit|RateLimit|throttle' in src/. No middleware.ts exists.",
  "Every API route accepts unlimited requests from any origin. No in-memory token bucket, no "
  + "Redis-backed limiter, no per-IP throttling. There is no <code>middleware.ts</code> file at "
  + "all — the project has never had any request-level middleware.",
  "<code>/api/bookings</code> and <code>/api/contact</code> create a DB row on every POST. An "
  + "attacker can fill the SQLite file to disk in seconds — each row is small but the message "
  + "field is uncapped (see H-1), so 1 MB per row × 1000 requests per second = approximately 1 "
  + "GB per minute. The payment initiation routes create PaymentOrder rows on every POST; an "
  + "attacker can flood the orders table with millions of rows, breaking any future "
  + "reconciliation. In production mode, each initiate also calls out to the upstream gateway, "
  + "so an attacker can exhaust the Khalti API rate limit and get the studio's merchant account "
  + "throttled.",
  "Install @upstash/ratelimit + @upstash/redis (or use Vercel KV). Wrap each route with a "
  + "5-req-per-minute-per-IP limit. For form spam, also add Cloudflare Turnstile on the booking "
  + "and contact forms.",
  `// Install: bun add @upstash/ratelimit @upstash/redis
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 req/min per IP
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anon';
  const { success } = await limiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  // ... proceed with handler
}`
));

bodyContent.push(...findingBlock(
  "H-3", "HIGH",
  "No CSRF protection on POST routes",
  "All POST handlers in bookings/route.ts:6, contact/route.ts:6, esewa/initiate/route.ts:16, khalti/initiate/route.ts:16",
  "These are raw <code>route.ts</code> handlers (not Next.js Server Actions, which have built-in "
  + "CSRF). They accept <code>Content-Type: application/json</code> from any origin. No "
  + "Origin/Referer check, no CSRF token.",
  "Today, since there is no auth (see C-1), the worst an attacker can do is flood the DB "
  + "(covered by H-2). But the moment admin auth is added, any logged-in admin visiting an "
  + "attacker-controlled page can be CSRF-tricked into creating bookings, deleting data, or "
  + "initiating refunds. The pattern is set up wrong from day one.",
  "Either (a) convert handlers to Next.js Server Actions (which auto-emit CSRF tokens), or (b) "
  + "add an Origin check plus a double-submit cookie or JWT-bound CSRF token for auth'd routes.",
  `// Add Origin check at the top of every POST handler.
const ALLOWED_ORIGINS = new Set([
  'https://weddingmomentnepal.com',
  'http://localhost:3000',
]);

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }
  // ... proceed with handler
}`
));

bodyContent.push(...findingBlock(
  "H-4", "HIGH",
  "No security headers (CSP, HSTS, X-Frame-Options, etc.)",
  "next.config.ts:1-12 (the entire file — no headers() function)",
  "The Next.js config sets only <code>output: \"standalone\"</code>, <code>typescript."
  + "ignoreBuildErrors: true</code>, and <code>reactStrictMode: false</code>. No security headers "
  + "are configured anywhere — not in next.config.ts, not in middleware.ts (which doesn't exist), "
  + "not in the Caddyfile.",
  "Without CSP, any future stored XSS (e.g., booking message rendered without escaping) executes "
  + "unrestricted and can steal data or make authenticated requests. Without <code>X-Frame-"
  + "Options: DENY</code>, the site can be clickjacked — an attacker overlays the booking form on "
  + "top of a fake \"Win a free wedding!\" button. Without HSTS, a man-in-the-middle on HTTP can "
  + "downgrade a customer mid-session. Without <code>X-Content-Type-Options: nosniff</code>, "
  + "uploaded files can be MIME-sniffed into executable types.",
  "Add a headers() function to next.config.ts. This also fixes H-5 (poweredByHeader: false) and "
  + "H-6 (re-enable TypeScript checks and React strict mode).",
  `// next.config.ts — add a headers() function:
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false, // also fixes H-5
  reactStrictMode: true,  // also fixes H-6
  typescript: { ignoreBuildErrors: false }, // also fixes H-6
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy',
          value: "default-src 'self'; img-src 'self' data:; " +
                 "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                 "font-src 'self' https://fonts.gstatic.com; " +
                 "script-src 'self'; frame-ancestors 'none'; " +
                 "base-uri 'self'; form-action 'self'; upgrade-insecure-requests" },
        { key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
      ],
    }];
  },
};`
));

bodyContent.push(...findingBlock(
  "H-5", "HIGH",
  "X-Powered-By header not disabled — framework version leaked",
  "next.config.ts:1-12",
  "Next.js by default sends <code>X-Powered-By: Next.js</code> on every response. Bun may add "
  + "its own header. The config does not set <code>poweredByHeader: false</code>.",
  "Allows attackers to fingerprint the stack instantly and target known Next.js CVEs (the 14.x "
  + "and 15.x lines have had several SSRF and cache-poisoning advisories). Combined with the "
  + "committed package.json, attackers can confirm the exact patch level and look up matching "
  + "exploits.",
  "Add <code>poweredByHeader: false</code> to nextConfig in next.config.ts (shown in the H-4 "
  + "fix). Also strip the header at Caddy as a defense-in-depth measure."
));

bodyContent.push(...findingBlock(
  "H-6", "HIGH",
  "typescript.ignoreBuildErrors: true and reactStrictMode: false",
  "next.config.ts:6-9",
  "Type errors don't block production builds — a route could ship with a typo'd field name "
  + "(<code>booking.emial</code> instead of <code>booking.email</code>) and silently write "
  + "<code>undefined</code> to the database. Strict mode is off, disabling React's double-effect "
  + "safety check that catches impure renders leaking data between concurrent users (e.g., a "
  + "stale closure leaking one user's session into another's render).",
  "Type errors in production code can cause silent data corruption — the most insidious bug class "
  + "because nothing crashes, but the wrong data is persisted. React strict mode catches impure "
  + "effects that leak data between users; without it, a coding mistake could expose one "
  + "customer's booking data to another customer.",
  "Set <code>ignoreBuildErrors: false</code> and <code>reactStrictMode: true</code> in next.config.ts "
  + "(shown in the H-4 fix). Fix any resulting type errors before deploying — they are real bugs "
  + "hiding behind the silence flag."
));

bodyContent.push(...findingBlock(
  "H-7", "HIGH",
  "Khalti route leaks upstream error response to client",
  "src/app/api/payment/khalti/initiate/route.ts:97-102",
  "When Khalti's initiate API returns a non-OK response, the route returns <code>{ success: "
  + "false, message: 'Khalti initiation failed', details: data }</code> with status 502, where "
  + "<code>data</code> is the full Khalti API error response.",
  "Khalti's error responses may include merchant ID, internal request IDs, validation details, "
  + "or partial credential echoes — useful reconnaissance for an attacker probing the "
  + "integration. Additionally, returning 502 to the client leaves the PaymentOrder row in "
  + "<i>initiated</i> status forever, polluting the database with orders that never resolved.",
  undefined,
  `// Log full error server-side; return generic message to client.
if (!resp.ok) {
  console.error('[Khalti] initiate failed:', data);
  // Mark the order as failed so it doesn't linger in 'initiated'.
  await db.paymentOrder.update({
    where: { purchaseOrderId },
    data: { status: 'failed', rawResponse: JSON.stringify(data) },
  });
  return NextResponse.json(
    { success: false, message: 'Payment gateway unavailable' },
    { status: 502 }
  );
}`
));

bodyContent.push(...findingBlock(
  "H-8", "HIGH",
  "Prisma client logs all queries including parameter values",
  "src/lib/db.ts:9-11",
  "<code>new PrismaClient({ log: ['query'] })</code> emits every SQL statement with bound "
  + "parameter values to stdout. Every email, phone number, and message string is printed to "
  + "stdout on every request that touches the database.",
  "The start script (<code>package.json:8</code>) tees server output to <code>server.log</code> "
  + "in the project root, so all PII lands in a file in the working directory. The dev script "
  + "does the same with <code>dev.log</code>. Both files contain raw PII. If <code>NODE_ENV</code> "
  + "is unset (misconfigured production), the query logger also runs in production. Log "
  + "aggregation services (Datadog, Sentry) may ingest and retain this indefinitely.",
  "Enable query logging only in development. For production, use ['warn', 'error'] only and rely "
  + "on application-level structured logging when query tracing is needed.",
  `// src/lib/db.ts — only enable query logging in dev.
import { PrismaClient } from '@prisma/client';

const log = process.env.NODE_ENV === 'development'
  ? ['query', 'error', 'warn']
  : ['error', 'warn'];

export const db = new PrismaClient({ log });`
));

bodyContent.push(...findingBlock(
  "H-9", "HIGH",
  "start script tees everything to server.log in working directory",
  "package.json:8",
  "<code>\"start\": \"NODE_ENV=production bun .next/standalone/server.js 2>&1 | tee server.log\""
  + "</code> writes all server output (errors, stack traces, Prisma query logs if H-8 isn't "
  + "fixed, any console.log from a route that prints an email) to <code>server.log</code> in the "
  + "project root.",
  "The file persists, is not rotated, is world-readable by default, and on a containerized "
  + "deploy comes along for the ride in the image layer. <code>server.log</code> is in .gitignore "
  + "(so it won't be committed), but the runtime exposure remains: anyone with shell access to "
  + "the container can read it.",
  "Send logs to stdout only — let the container runtime or systemd journald capture them. Or "
  + "write to a properly-permissioned /var/log/wedding-moment-nepal/server.log with logrotate. "
  + "Never write logs inside the app working directory."
));

bodyContent.push(new Paragraph({ children: [new PageBreak()] }));

// === 7. Medium Findings ===
bodyContent.push(h1("7. Medium Findings (14)"));
bodyContent.push(body(
  "Medium findings are real issues that increase risk or maintainability burden but are not "
  + "immediately exploitable in isolation. They should be addressed within the first month."
));

const mediumFindings = [
  ["M-1", "Predictable eSewa transactionUuid (Math.random, 1000 suffixes per ms)",
   "src/app/api/payment/esewa/initiate/route.ts:28",
   "Use <code>crypto.randomUUID()</code>: <code>const transactionUuid = `order-${crypto.randomUUID()}`;</code>"],
  ["M-2", "Khalti purchaseOrderId is even more predictable (no random suffix)",
   "src/app/api/payment/khalti/initiate/route.ts:27",
   "Same fix as M-1: use crypto.randomUUID()."],
  ["M-3", "No honeypot / captcha on any form",
   "src/components/site/{booking,contact,payment}.tsx",
   "Add Cloudflare Turnstile (free, privacy-respecting) to each form. Verify server-side before persisting. Also add a honeypot field (hidden input named 'website') and reject submissions where it's filled."],
  ["M-4", "Booking date field is a raw string with no server-side validation",
   "src/app/api/bookings/route.ts:11, :24",
   "Parse with <code>z.string().date()</code> (ISO 8601) and <code>.refine(s => new Date(s) > new Date(), 'Date must be in the future')</code>."],
  ["M-5", "Khalti customer_info.email hardcoded to customer@example.com",
   "src/app/api/payment/khalti/initiate/route.ts:77",
   "Collect email in payment.tsx and pass it through. Validate with Zod. Khalti sends receipts to this address — currently the studio gets nothing and the customer gets nothing."],
  ["M-6", "amount stored as Float in Prisma schema",
   "prisma/schema.prisma:30",
   "Change to <code>amount Decimal @db.Decimal(10, 2)</code>. Floats cannot represent currency exactly; round-off bugs accumulate over time and break reconciliation."],
  ["M-7", "No AuditLog model — no trail of admin actions or payment transitions",
   "prisma/schema.prisma:1-47",
   "Add User, AuditLog, and WebhookEvent models (see code block below). Required for PCI-DSS audit trail and Nepal Privacy Act 2075 data subject access requests."],
  ["M-8", "No soft-delete or data retention policy",
   "prisma/schema.prisma:11-46 (no deletedAt columns)",
   "Add <code>deletedAt DateTime?</code> to each model. Use Prisma soft-delete middleware or explicit <code>where: { deletedAt: null }</code> filters. Add a cron job to hard-delete rows older than N years."],
  ["M-9", "BACKEND_URL and FRONTEND_URL default to empty string — silent breakage",
   "src/app/api/payment/esewa/initiate/route.ts:30, khalti/initiate/route.ts:44-45",
   "Fail-fast at boot if these are unset in production. See the assertProdEnv() helper in the C-3 fix."],
  ["M-10", "ESEWA_PRODUCT_CODE defaults to EPAYTEST (eSewa sandbox)",
   "src/app/api/payment/esewa/initiate/route.ts:29",
   "Require the env var in production. Never default to a sandbox code. Same fail-fast pattern as M-9."],
  ["M-11", "String(name) accepts objects and arrays — no schema coercion",
   "src/app/api/bookings/route.ts:20-25, contact/route.ts:20-23",
   "Use Zod (H-1) — it rejects non-string inputs before they reach String() coercion. <code>String({foo: 'bar'})</code> produces \"[object Object]\"."],
  ["M-12", "No request body size limit on POST routes",
   "All POST handlers (<code>await req.json()</code> with no size check)",
   "Read the body with a size cap: <code>const text = await req.text(); if (text.length > 50_000) return NextResponse.json({error:'Body too large'}, {status: 413}); const body = JSON.parse(text);</code>"],
  ["M-13", "rawResponse: 'demo_mode' is a confusing sentinel",
   "src/app/api/payment/esewa/initiate/route.ts:55, khalti/initiate/route.ts:54",
   "Use a structured value: <code>rawResponse: JSON.stringify({ demo: true, ts: Date.now() })</code>. Or add a <code>demo Boolean @default(false)</code> column."],
  ["M-14", "Production runs on Bun runtime",
   "package.json:8, .zscripts/start.sh:93",
   "Switch to <code>node .next/standalone/server.js</code>. Pin Node 20 LTS or newer. Bun is less battle-tested for production HTTP serving and has had HTTP smuggling advisories in early versions."],
];

for (const [id, title, fileLine, fix] of mediumFindings) {
  bodyContent.push(...findingBlock(id, "MEDIUM", title, fileLine, fix, "", "", null));
}

bodyContent.push(h2("M-7 detail: Add these models to prisma/schema.prisma"));
bodyContent.push(...codeBlock(
  `model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         String   @default('admin') // admin | staff
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret String?
  createdAt    DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  action     String   // e.g. 'login', 'booking.update', 'payment.refund'
  entityType String   // 'booking' | 'payment' | 'user' | 'contact'
  entityId   String?
  metadata   String?  // JSON string
  ip         String?
  userAgent  String?
  createdAt  DateTime @default(now())
}

model WebhookEvent {
  id         String   @id @default(cuid())
  gateway    String   // 'esewa' | 'khalti'
  eventType  String
  payload    String   // raw body
  signature  String?
  verified   Boolean  @default(false)
  createdAt  DateTime @default(now())
}`
));

bodyContent.push(new Paragraph({ children: [new PageBreak()] }));

// === 8. Low Findings ===
bodyContent.push(h1("8. Low & Informational Findings (19)"));
bodyContent.push(body(
  "Low and Informational findings are cleanup, hygiene, and defense-in-depth items. None is "
  + "individually exploitable to a serious outcome, but they collectively indicate an immature "
  + "security posture and should be addressed during normal maintenance."
));

const lowRows = [
  ["L-1", "examples/websocket/", "Unused websocket server code shipped in repo", "Remove or move to separate repo"],
  ["L-2", "tool-results/", "HTML dumps of unrelated site committed", "git rm --cached; add to .gitignore"],
  ["L-3", "upload/", "World-writable (0777) dir with source archives", "chmod 755; remove archives; add to .gitignore"],
  ["L-4", ".zscripts/dev.pid", "Dev server PID file committed", "git rm --cached; add *.pid to .gitignore"],
  ["L-5", "skills/", "200+ MB of unrelated ClawHub skills in project root", "Move outside project root"],
  ["L-6", "package.json:61", "next-auth@4.x unused; carries CVE-2024-4068", "Either implement auth (M-7) or remove"],
  ["L-7", "package.json:62", "next-intl unused", "Remove"],
  ["L-8", "package.json:16-78", "Many unused deps: dnd-kit, mdxeditor, recharts, framer-motion, etc.", "Run depcheck; remove unused"],
  ["L-9", "src/components/ui/chart.tsx:83", "dangerouslySetInnerHTML (unused component, dev-only config)", "No action unless wired to user input"],
  ["L-10", "public/robots.txt", "Allows all crawlers; combined with C-1, PII could be indexed", "Add Disallow: /api/ (also fix C-1)"],
  ["L-11", "eslint.config.mjs:10-44", "All safety rules disabled (no-debugger, no-undef, etc.)", "Re-enable rules; fix resulting warnings"],
  ["L-12", ".zscripts/start.sh", "NEXT_TELEMETRY_DISABLED only set in build, not in start", "Export in start.sh too, or set in .env"],
  ["L-13", "prisma/schema.prisma:14-15, :28", "Email/phone plaintext and unencrypted at rest", "Encrypt PII at app layer with KMS; min 600 perms on DB file"],
  ["L-14", "esewa/initiate/route.ts:71-73", "HMAC key length not validated", "Add: if (typeof key !== 'string' || key.length < 16) throw"],
  ["L-15", "Contact email (gmail.com)", "No SPF/DMARC on contact email; no transport encryption", "Use custom domain email with SPF/DMARC"],
  ["L-16", "dev.log, .zscripts/dev.log", "Runtime logs contain sandbox internal IP", "Ensure excluded from build tarball"],
  ["L-17", "Root directory", "No Dockerfile, no CI, no SBOM generation", "Add multi-stage Dockerfile + bun audit in CI"],
  ["L-18", "package.json:10", "prisma db push --accept-data-loss in script", "Remove --accept-data-loss; switch to prisma migrate"],
  ["L-19", "Caddyfile:1", "Caddy listens on :81 (non-standard)", "Document topology; ensure TLS at outer proxy"],
];
bodyContent.push(buildTable(
  ["ID", "File", "Issue", "Fix"],
  lowRows,
  [8, 24, 38, 30]
));
bodyContent.push(spacer(200));
bodyContent.push(body(
  "<b>Which Low findings matter most.</b> L-6 (unused next-auth with a known CSRF bypass CVE) and "
  + "L-13 (PII plaintext at rest) deserve early attention — L-6 because the dependency is in the "
  + "install graph even though nothing imports it, and L-13 because anyone with filesystem access "
  + "to the SQLite file reads every customer's email and phone number directly. L-11 (ESLint "
  + "rules disabled) and L-18 (<code>--accept-data-loss</code> in the db push script) are "
  + "operational landmines that will cause silent data loss sooner or later. The rest are cleanup "
  + "that can happen during normal maintenance."
));

bodyContent.push(new Paragraph({ children: [new PageBreak()] }));

// === 9. Remediation Roadmap ===
bodyContent.push(h1("9. Prioritized Remediation Roadmap"));
bodyContent.push(body(
  "The 50 findings have been organized into four tiers based on severity and dependency. Each "
  + "tier should be fully closed and verified before moving to the next."
));

bodyContent.push(h2("Tier 1 — Block Production Deployment (Day 0, ~4 hours)"));
bodyContent.push(body(
  "These findings are individually exploitable and have direct customer impact. No production "
  + "deployment should occur until every Tier 1 item is closed and re-tested. The total estimated "
  + "effort is approximately 4 hours for an experienced Next.js developer."
));
bodyContent.push(body(
  "<b>Findings in this tier:</b> C-1 (delete unauthenticated GET /api/bookings), C-5 (purge "
  + "SQLite DB from git history), C-6 (purge .env from git history), C-7 (rewrite build script "
  + "to not copy dev DB), C-8 (delete Caddy SSRF block)."
));
bodyContent.push(body(
  "<b>Verification:</b> (1) <code>curl https://yoursite.com/api/bookings</code> returns 404 or "
  + "401; (2) <code>git log --all --full-history -- db/custom.db</code> returns empty; (3) "
  + "<code>git log --all --full-history -- .env</code> returns empty; (4) build tarball contains "
  + "an empty <code>db/custom.db</code>; (5) <code>curl 'https://yoursite.com:81/?XTransformPort=22'</code> "
  + "returns Caddy's default 404, not an SSH banner."
));

bodyContent.push(h2("Tier 2 — Close Critical Payment & Validation Gaps (Week 1, ~2-3 days)"));
bodyContent.push(body(
  "These findings close the remaining Critical-tier payment issues and add the baseline input "
  + "validation, rate limiting, and security headers that every web app needs. Effort: 2-3 days."
));
bodyContent.push(body(
  "<b>Findings in this tier:</b> C-2 (implement eSewa and Khalti callback routes with signature "
  + "verification), C-3 (remove demo mode, add fail-fast env validation), C-4 (server-side price "
  + "lookup), H-1 (add Zod schemas to all routes), H-2 (add Upstash rate limiting), H-3 (add "
  + "Origin check), H-4 (add security headers)."
));
bodyContent.push(body(
  "<b>Verification:</b> (1) end-to-end test payment with eSewa sandbox — order row transitions "
  + "from <i>initiated</i> to <i>paid</i> only after the customer actually pays; (2) attempting "
  + "to submit a booking with <code>email: \"not-an-email\"</code> returns 422 with validation "
  + "errors; (3) sending 10 requests in 1 minute to <code>/api/bookings</code> from the same IP "
  + "returns 429 on the 6th; (4) browser DevTools shows Content-Security-Policy, "
  + "Strict-Transport-Security, X-Frame-Options headers on every response."
));

bodyContent.push(h2("Tier 3 — Add Auth, Audit Log, and Polish (Week 2-3, ~1 week)"));
bodyContent.push(body(
  "These findings add the user authentication system, audit logging, and the remaining High-tier "
  + "fixes. This tier requires the most new code — adding NextAuth configuration, a User model, "
  + "an AuditLog model, and wiring up admin routes. Effort: approximately 1 week."
));
bodyContent.push(body(
  "<b>Findings in this tier:</b> M-7 (User, AuditLog, WebhookEvent Prisma models + NextAuth "
  + "configuration), H-5 (disable X-Powered-By), H-6 (re-enable TypeScript checks and React "
  + "strict mode), H-7 (sanitize Khalti error responses), H-8 (restrict Prisma query logging to "
  + "dev), H-9 (remove server.log tee), M-1, M-2 (use crypto.randomUUID for order IDs), M-5 "
  + "(collect customer email in payment flow), M-6 (Decimal instead of Float for amounts)."
));
bodyContent.push(body(
  "<b>Verification:</b> (1) admin login flow works with 2FA enabled; (2) every admin action "
  + "(login, booking update, payment refund) creates an AuditLog row; (3) X-Powered-By header "
  + "absent from all responses; (4) running <code>bun run build</code> with a deliberate type "
  + "error fails the build; (5) <code>server.log</code> is not created in the working directory."
));

bodyContent.push(h2("Tier 4 — Hygiene and Cleanup (Month 2, ongoing)"));
bodyContent.push(body(
  "All remaining Medium and Low findings. These are quality-of-life improvements that harden the "
  + "codebase but don't block any specific feature. Schedule them as a dedicated cleanup sprint "
  + "or address opportunistically during related work."
));
bodyContent.push(body(
  "<b>Findings in this tier:</b> all remaining M-3, M-4, M-8 through M-14, and all L-1 through "
  + "L-19. Priority within this tier: L-6 (remove unused next-auth or implement it), L-13 (encrypt "
  + "PII at rest), L-11 (re-enable ESLint rules), L-18 (switch from db push to migrate)."
));

bodyContent.push(new Paragraph({ children: [new PageBreak()] }));

// === 10. Incident Response Plan ===
bodyContent.push(h1("10. Incident Response Plan"));
bodyContent.push(body(
  "This section addresses the user's checklist item #10: a written incident-response plan with "
  + "concrete steps to take if a breach or data loss occurs. The plan follows the standard "
  + "SANS/NIST six-phase lifecycle (Preparation → Identification → Containment → Eradication → "
  + "Recovery → Lessons Learned) adapted to a small e-commerce storefront operated by a "
  + "photography studio."
));

bodyContent.push(h2("Phase 1 — Preparation (do this now, before any incident)"));
bodyContent.push(body(
  "Designate an Incident Response Lead (default: the studio owner). Compile a contact list with "
  + "the following entries and store both a digital copy (in a password manager) and a printed "
  + "copy off-site. Enable Sentry error tracking (free tier covers a small storefront). Configure "
  + "automated daily off-site backups of <code>db/custom.db</code> to an S3-compatible bucket "
  + "with a 30-day retention. Test a restore once per quarter. Pre-draft the customer notification "
  + "email template (below) so it can be sent within hours rather than days."
));

bodyContent.push(h3("Contact List Template"));
const contactRows = [
  ["Studio Owner / IR Lead", "[Owner name]", "[Phone], [Email]", "Decision authority"],
  ["Hosting Provider Support", "[Provider name]", "[Support phone/ticket URL]", "Server access, snapshots"],
  ["eSewa Merchant Support", "eSewa", "merchantsupport@esewa.com.np, 9801-571111", "Pause/inspect payments"],
  ["Khalti Merchant Support", "Khalti", "merchantcare@khalti.com, 9801-671111", "Pause/inspect payments"],
  ["Nepal Cyber Bureau", "Nepal Police", "cyberbureau@nepalpolice.gov.np, 01-4215100", "Report cybercrime"],
  ["Legal Counsel", "[Lawyer name]", "[Phone], [Email]", "Breach notification law"],
  ["PR / Communications", "[Name or agency]", "[Phone], [Email]", "Customer comms"],
  ["Insurance Broker", "[Broker name]", "[Phone], [Email]", "Cyber-liability claim"],
];
bodyContent.push(buildTable(
  ["Role", "Organization", "Contact", "Purpose"],
  contactRows,
  [22, 18, 32, 28]
));

bodyContent.push(h2("Phase 2 — Identification (the first hour)"));
bodyContent.push(body(
  "Trigger an investigation if any of these occur: Sentry reports a spike in 5xx errors or a "
  + "specific payment-related error; a customer reports they were charged but saw no "
  + "confirmation; the studio receives a booking or payment that doesn't match customer "
  + "communication; an unfamiliar IP appears in access logs hitting <code>/api/*</code> routes "
  + "repeatedly; the database file grows unusually fast (sign of H-2 attack). Begin a written "
  + "incident log immediately — timestamp every observation, decision, and action. Assign the "
  + "incident a severity using the matrix below."
));

bodyContent.push(h3("Severity Matrix"));
const sevRows = [
  ["SEV-1 Critical", "Confirmed PII exfiltration OR forged payments OR DB deletion", "All-hands response, invoke Phase 3 immediately"],
  ["SEV-2 High", "Suspected breach, gateway abuse, or sustained DDoS", "IR Lead convenes within 1 hour"],
  ["SEV-3 Medium", "Single customer impact, isolated bug, no PII exposure", "Resolve within 1 business day"],
  ["SEV-4 Low", "Cosmetic issue, near-miss, hardening opportunity", "Track and batch-resolve"],
];
bodyContent.push(buildTable(
  ["Severity", "Trigger Examples", "Response SLA"],
  sevRows,
  [18, 50, 32]
));

bodyContent.push(h2("Phase 3 — Containment (first 60 minutes of a confirmed SEV-1/SEV-2)"));
bodyContent.push(body(
  "Take the site offline immediately by stopping Caddy: <code>caddy stop</code> (or <code>"
  + "systemctl stop caddy</code>). Snapshot the current database file before any changes: "
  + "<code>cp db/custom.db /tmp/incident-$(date +%s).db</code>. Preserve all logs: <code>"
  + "journalctl -u caddy --since '24 hours ago' > /tmp/incident-caddy.log</code> and copy "
  + "<code>server.log</code> to a secure location. Rotate all secrets immediately: eSewa secret "
  + "key, Khalti secret key, NEXTAUTH_SECRET, any DB credentials. Disable the affected payment "
  + "gateway in the eSewa/Khalti merchant dashboards until eradication is complete. Notify the "
  + "IR Lead and legal counsel — do NOT notify customers yet (that's Phase 5)."
));

bodyContent.push(h2("Phase 4 — Eradication (hours to days)"));
bodyContent.push(body(
  "Identify the root cause by correlating logs with the findings in this audit report. Most "
  + "likely scenarios given the current codebase: (a) the Caddy SSRF (C-8) was used to reach an "
  + "internal service; (b) the unauthenticated GET /api/bookings (C-1) was scraped; (c) a forged "
  + "payment callback (C-2) marked orders paid without payment; (d) the demo-mode (C-3) was "
  + "triggered by an env var being unset. Patch the specific vulnerability using the fix code in "
  + "this report. Re-deploy from a clean build (after Tier 1 of the remediation roadmap is "
  + "complete). Verify the fix with the test in the relevant finding's 'Suggested fix' section. "
  + "Do not bring the site back online until the root cause is patched and verified."
));

bodyContent.push(h2("Phase 5 — Recovery and Notification"));
bodyContent.push(body(
  "Restore the database from the most recent clean backup if data was modified. Bring the site "
  + "back online behind a fresh Caddy config and rotated secrets. Monitor Sentry and access logs "
  + "for 72 hours for re-infection or follow-on attacks. Notify affected customers within 72 "
  + "hours of confirmation (Nepal Privacy Act 2075 requires notification; GDPR requires 72 hours "
  + "if any EU data subjects are involved). Use the template below. Notify eSewa and Khalti "
  + "merchant support if payment data was involved. Notify the Nepal Cyber Bureau if the "
  + "incident involves active attack rather than misconfiguration. Notify your cyber-liability "
  + "insurer within the policy's reporting window."
));

bodyContent.push(h3("Customer Notification Email Template"));
bodyContent.push(...codeBlock(
`Subject: Security Incident Affecting Your Wedding Moment Nepal Account

Dear [Customer Name],

We are writing to inform you of a security incident that may have affected your
personal information. On [date], we discovered that [brief description of incident,
e.g., 'an unauthorized party accessed our booking database']. Based on our investigation,
the following information of yours may have been exposed: [list specific fields —
name, email, phone, wedding date, etc.].

We have taken the following steps: [list actions — site taken offline, vulnerability
patched, secrets rotated, etc.]. We recommend that you: [list customer actions —
change password if you have an account, be alert for phishing, etc.].

We deeply regret this incident and have implemented additional controls to prevent
recurrence. If you have questions, please reply to this email or call [studio phone].

Sincerely,
[Owner name]
Wedding Moment Nepal`
));

bodyContent.push(h2("Phase 6 — Post-Mortem (within 7 days of recovery)"));
bodyContent.push(body(
  "Within 7 days of returning to normal operations, complete a written post-mortem covering: "
  + "(1) timeline of the incident from first detection to recovery; (2) root cause analysis — "
  + "which finding in this audit report was exploited, and why wasn't it closed; (3) what worked "
  + "and what didn't in the IR process; (4) specific action items with owners and due dates to "
  + "prevent recurrence. Share the post-mortem with the IR Lead, legal counsel, and any affected "
  + "team members. Update this incident-response plan based on lessons learned. File the "
  + "post-mortem with the incident log for future reference and for any regulatory audit."
));

bodyContent.push(new Paragraph({ children: [new PageBreak()] }));

// === 11. Deployment Hardening ===
bodyContent.push(h1("11. Deployment Hardening Checklist"));
bodyContent.push(body(
  "Operational hardening that should be in place before the site accepts real customer payments. "
  + "Each area has a brief explanation and a checklist of concrete items."
));

bodyContent.push(h2("Environment Variables"));
bodyContent.push(body(
  "All secrets must be set in the production environment before the application boots. The "
  + "assertProdEnv() helper (see C-3 fix) should fail-fast at startup if any required variable "
  + "is missing. Never ship secrets in the git repo or in the build tarball."
));
[
  ["[ ]", "DATABASE_URL points to a path outside the repo"],
  ["[ ]", "ESEWA_SECRET_KEY set (production value, not EPAYTEST)"],
  ["[ ]", "ESEWA_PRODUCT_CODE set (production merchant code)"],
  ["[ ]", "KHALTI_SECRET_KEY set (production live key)"],
  ["[ ]", "BACKEND_URL = https://weddingmomentnepal.com"],
  ["[ ]", "FRONTEND_URL = https://weddingmomentnepal.com"],
  ["[ ]", "NEXTAUTH_SECRET = output of openssl rand -base64 32"],
  ["[ ]", "NEXTAUTH_URL = https://weddingmomentnepal.com"],
  ["[ ]", "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for rate limiting"],
  ["[ ]", "SENTRY_DSN for error tracking"],
  ["[ ]", "NODE_ENV = production"],
].forEach(([box, item]) => bodyContent.push(bodyTight(`${box}  ${item}`)));

bodyContent.push(h2("Backups"));
bodyContent.push(body(
  "Automated daily off-site backups of the SQLite database, with monthly restore tests. Backups "
  + "must be encrypted at rest in the off-site location and access-controlled. A backup that has "
  + "never been restored is not a backup — it's a hope."
));
[
  ["[ ]", "Daily cron job: sqlite3 db/custom.db '.backup /tmp/backup.db' then upload to S3-compatible storage"],
  ["[ ]", "Backup retention: 30 days daily, 12 months monthly"],
  ["[ ]", "Backups encrypted with AES-256 (S3 server-side encryption or GPG)"],
  ["[ ]", "Restore test: monthly, restore to a staging DB and run a query"],
  ["[ ]", "Off-site: backups stored in a different region/account than production"],
  ["[ ]", "Access: backup bucket is read-only for the production IAM user"],
  ["[ ]", "Documented: restore procedure is written down and tested by a second person"],
].forEach(([box, item]) => bodyContent.push(bodyTight(`${box}  ${item}`)));

bodyContent.push(h2("Monitoring"));
bodyContent.push(body(
  "Three layers of monitoring: errors (Sentry), access logs (Better Stack or Logtail), and "
  + "transactional email (Postmark or Resend) so the studio knows when bookings/payments occur "
  + "even if they don't check the admin panel."
));
[
  ["[ ]", "Sentry: @sentry/nextjs installed and configured; DSN in env"],
  ["[ ]", "Sentry alert on any 5xx error in production"],
  ["[ ]", "Access logs: Caddy access log shipped to log aggregator"],
  ["[ ]", "Alert on >100 requests/min from a single IP"],
  ["[ ]", "Alert on any POST to /api/payment/*/callback with invalid signature"],
  ["[ ]", "Transactional email: new booking, new contact, new payment — email to studio"],
  ["[ ]", "Uptime monitor: external ping every 5 minutes; alert on 3 consecutive failures"],
].forEach(([box, item]) => bodyContent.push(bodyTight(`${box}  ${item}`)));

bodyContent.push(h2("Dependency Updates"));
bodyContent.push(body(
  "Next.js has had multiple CVEs in 14.x and 15.x (cache poisoning, SSRF, prototype pollution). "
  + "Establish a monthly cadence for reviewing and applying updates."
));
[
  ["[ ]", "Weekly: bun audit in CI; fail build on high or critical"],
  ["[ ]", "Monthly: review and apply non-security updates"],
  ["[ ]", "Next.js patch releases: upgrade within 7 days of release"],
  ["[ ]", "Next.js minor releases: upgrade within 30 days"],
  ["[ ]", "Subscribe to the Next.js security advisory RSS feed"],
  ["[ ]", "Subscribe to Prisma security advisories"],
  ["[ ]", "Quarterly: run depcheck and remove unused dependencies"],
].forEach(([box, item]) => bodyContent.push(bodyTight(`${box}  ${item}`)));

bodyContent.push(new Paragraph({ children: [new PageBreak()] }));

// === Appendix A ===
bodyContent.push(h1("Appendix A — Shopify / WooCommerce Mapping"));
bodyContent.push(body(
  "The user's original request was framed for a Shopify or WooCommerce store. This appendix maps "
  + "every finding in this report to its equivalent on Shopify and WooCommerce, in case the "
  + "studio ever migrates platforms. The takeaway: Shopify handles items 1, 4, and 8 essentially "
  + "for free (TLS, backups, PCI compliance are built-in); WooCommerce handles them with "
  + "configuration and plugins. The remaining items (2FA, rate limiting, audit logging, incident "
  + "response) require configuration on both platforms but are easier on Shopify because the "
  + "admin surface is smaller."
));

const mapRows = [
  ["1", "HTTPS / TLS", "Automatic on all plans; HSTS managed by Shopify", "Requires Let's Encrypt + really-simple-ssl plugin"],
  ["2", "Plugin/app audit", "Apps installed via Shopify App Store; review in Admin → Apps", "Plugins via WP admin; use Wordfence Scan"],
  ["3", "2FA on admin", "Enable in Settings → Users → Two-step authentication", "Use Wordfence Login Security or 2FA plugin"],
  ["4", "Daily backups", "Automatic; export via Admin → Products → Export", "Use UpdraftPlus or Jetpack Backup"],
  ["5", "User roles", "Staff accounts with granular permissions; default roles limited", "WordPress roles: Subscriber → Super Admin; use Members plugin"],
  ["6", "Rate limiting", "Built-in at edge; no configuration needed", "Use Wordfence or Cloudflare WAF rule"],
  ["7", "Malware scan", "Automatic; Shopify monitors theme files", "Use Wordfence Scan or Sucuri"],
  ["8", "PCI compliance", "Shopify Payments is PCI-DSS Level 1; no card data on your store", "Use Stripe or WooCommerce Payments; never store PANs"],
  ["9", "Activity logging", "Limited in core; use Shopify Audit Log (Shopify Plus) or an app", "Use WP Activity Log or Wordfence Audit"],
  ["10", "Incident-response plan", "Shopify handles infra incidents; you handle store config incidents", "Same IR plan as this report; just for WordPress layer"],
];
bodyContent.push(buildTable(
  ["#", "Concern", "Shopify Equivalent", "WooCommerce Equivalent"],
  mapRows,
  [5, 18, 38, 39]
));
bodyContent.push(spacer(200));
bodyContent.push(body(
  "<b>Migration recommendation.</b> If the studio migrates to Shopify, items 1, 4, and 8 are "
  + "essentially solved by the platform — TLS is automatic, backups are managed, and Shopify "
  + "Payments is PCI-DSS Level 1 certified. Items 2, 3, and 9 need app installs but are "
  + "straightforward. Items 5, 6, and 7 still require configuration but are easier because the "
  + "attack surface is smaller (Shopify admin vs. WordPress + WooCommerce + plugins). Item 10 "
  + "(incident response) still requires the studio's own plan — this report's Section 10 applies "
  + "regardless of platform. On WooCommerce, the situation is roughly inverted: the studio gets "
  + "more control but inherits responsibility for almost every item on the list."
));
bodyContent.push(body(
  "<b>Cost tradeoff.</b> Shopify Basic is approximately USD 39/month plus payment processing "
  + "fees. WooCommerce is free but requires hosting (USD 10–30/month for a small VPS), an SSL "
  + "certificate (free with Let's Encrypt), backup plugin (USD 0–15/month), security plugin (USD "
  + "0–15/month), and the studio's time to maintain updates. For a small photography studio that "
  + "does not want to operate infrastructure, Shopify is the lower-risk choice. For a studio "
  + "that wants full control and has technical capacity, the current Next.js build (after the "
  + "fixes in this report) is also a reasonable choice — but only after the fixes."
));

// === Appendix B ===
bodyContent.push(h1("Appendix B — Verification Checklist"));
bodyContent.push(body(
  "A printable checklist the studio owner or a security reviewer can use to confirm each fix is "
  + "applied. Grouped by finding ID. After all items are checked, complete the Final Go-Live Gate."
));

bodyContent.push(h2("Critical Findings"));
[
  ["[ ]", "C-1: curl https://yoursite.com/api/bookings returns 401 or 404"],
  ["[ ]", "C-2: End-to-end sandbox payment transitions order from initiated to paid"],
  ["[ ]", "C-2: Forged callback with wrong signature returns 400"],
  ["[ ]", "C-3: grep -r 'demo_mode' src/ returns no matches"],
  ["[ ]", "C-3: Boot fails fast if ESEWA_SECRET_KEY unset in production"],
  ["[ ]", "C-4: Submitting {amount:1, packageKey:'wedding'} charges NPR 14999"],
  ["[ ]", "C-5: git log --all -- db/custom.db returns empty"],
  ["[ ]", "C-6: git log --all -- .env returns empty"],
  ["[ ]", "C-7: Build tarball's db/custom.db is empty (0 rows in each table)"],
  ["[ ]", "C-8: curl 'https://yoursite.com:81/?XTransformPort=22' returns 404, not SSH banner"],
].forEach(([box, item]) => bodyContent.push(bodyTight(`<b>${box}  ${item.split(":")[0]}:</b>  ${item.split(":").slice(1).join(":").trim()}`)));

bodyContent.push(h2("High Findings"));
[
  ["[ ]", "H-1: Submitting booking with email: 'not-an-email' returns 422"],
  ["[ ]", "H-2: 10 POST requests in 1 minute to /api/bookings returns 429 on 6th"],
  ["[ ]", "H-3: POST from Origin: https://evil.com returns 403"],
  ["[ ]", "H-4: Response headers include CSP, HSTS, X-Frame-Options, X-Content-Type-Options"],
  ["[ ]", "H-5: curl -I https://yoursite.com shows no X-Powered-By"],
  ["[ ]", "H-6: bun run build fails when a type error is introduced"],
  ["[ ]", "H-7: Khalti error response in browser shows generic message, no details field"],
  ["[ ]", "H-8: Production stdout does not show SQL queries with parameter values"],
  ["[ ]", "H-9: server.log does not exist in working directory after start"],
].forEach(([box, item]) => bodyContent.push(bodyTight(`<b>${box}  ${item.split(":")[0]}:</b>  ${item.split(":").slice(1).join(":").trim()}`)));

bodyContent.push(h2("Medium Findings (spot-check)"));
[
  ["[ ]", "M-1, M-2: grep 'Math.random' src/app/api/payment/ returns empty"],
  ["[ ]", "M-5: Payment form collects email; Khalti receipt goes to customer"],
  ["[ ]", "M-6: prisma/schema.prisma uses Decimal @db.Decimal(10, 2)"],
  ["[ ]", "M-7: prisma/schema.prisma has User, AuditLog, WebhookEvent models"],
  ["[ ]", "M-12: POST with 100 KB body returns 413"],
].forEach(([box, item]) => bodyContent.push(bodyTight(`<b>${box}  ${item.split(":")[0]}:</b>  ${item.split(":").slice(1).join(":").trim()}`)));

bodyContent.push(h2("Final Go-Live Gate"));
bodyContent.push(body(
  "Before accepting real customer payments, the following five items must all be confirmed. If "
  + "any is unchecked, do not go live."
));
[
  ["[ ]", "1. All 8 Critical findings closed and verified per the tests above"],
  ["[ ]", "2. End-to-end sandbox payment with both eSewa and Khalti succeeds (customer pays, order row transitions to paid, customer sees thank-you page)"],
  ["[ ]", "3. Daily backup configured and a test restore has been performed successfully"],
  ["[ ]", "4. Sentry error monitoring is live and receiving events"],
  ["[ ]", "5. The incident-response plan in Section 10 has been read by the studio owner and the contact list (Section 10, Phase 1) has been filled in"],
].forEach(([box, item]) => bodyContent.push(bodyTight(`${box}  ${item}`)));

// ============================================================
// Document assembly
// ============================================================
const doc = new Document({
  creator: "Z.ai Security Review",
  title: "Wedding Moment Nepal — Security Audit Report",
  subject: "Security audit of Next.js 16 storefront",
  description: "Code-level audit + deployment hardening plan",
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Calibri", eastAsia: "SimSun" },
          size: 22, color: P.body,
        },
        paragraph: { spacing: { line: 312 } },
      },
    },
  },
  sections: [
    // Section 1: Cover — margin 0, no header/footer
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: buildCover(),
    },
    // Section 2: Body — standard margins, Arabic page numbers starting at 1
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { line: 240, after: 60 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 4, color: P.border, space: 4 },
            },
            children: [
              new TextRun({
                text: "Wedding Moment Nepal  ·  Security Audit Report",
                size: 16, color: P.secondary,
                font: { ascii: "Calibri", eastAsia: "SimSun" },
              }),
              new TextRun({
                text: "\t\tConfidential",
                size: 16, color: P.secondary,
                font: { ascii: "Calibri", eastAsia: "SimSun" },
              }),
            ],
            tabStops: [
              { type: TabStopType.RIGHT, position: 9300 },
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, before: 60 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 4, color: P.border, space: 4 },
            },
            children: [
              new TextRun({
                text: "Z.ai Security Review  ·  2026-07-27  ·  Page ",
                size: 16, color: P.secondary,
                font: { ascii: "Calibri", eastAsia: "SimSun" },
              }),
              new TextRun({
                children: [PageNumber.CURRENT],
                size: 16, color: P.secondary,
                font: { ascii: "Calibri", eastAsia: "SimSun" },
              }),
            ],
          })],
        }),
      },
      children: bodyContent,
    },
  ],
});

// ============================================================
// Write to file
// ============================================================
const OUTPUT = "/home/z/my-project/download/Wedding_Moment_Nepal_Security_Audit.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUTPUT, buf);
  const stats = fs.statSync(OUTPUT);
  console.log(`OK — wrote ${OUTPUT}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
}).catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
