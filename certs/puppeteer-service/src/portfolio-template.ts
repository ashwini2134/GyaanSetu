// HTML template for a student's downloadable Portfolio PDF.
//
// Unlike course-cert-template.ts (a fixed-size single "card"), this renders
// as a normal flowing document — content length varies a lot per student
// (0 to dozens of projects/certs/skills), so pagination is left to
// Puppeteer's page.pdf({ format: 'A4' }) rather than a fixed canvas size.

export interface PortfolioProjectInput {
  name: string;
  techStack?: string;
  difficulty?: string;
  completedDateLabel?: string;
}

export interface PortfolioCertInput {
  title: string;
  issuedDateLabel?: string;
}

export interface PortfolioTemplateInput {
  studentName: string;
  tagline?: string;
  generatedDateLabel: string;
  accentHex?: string;
  stats: {
    coursesCompleted: number;
    problemsSolved: number;
    projectsBuilt: number;
    practiceAccuracy: number | null;
  };
  problemsByDifficulty: { easy: number; medium: number; hard: number };
  skills: string[];
  certificates: PortfolioCertInput[];
  projects: PortfolioProjectInput[];
  qrPngBase64?: string;
  verifyUrlLabel?: string;
  fontFaceCss: string;
}

const INK = '#161b22';
const MUTED = '#6b7280';
const HAIRLINE = '#e5e7eb';
const PAPER_BG = '#ffffff';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function statBlock(value: number | string, label: string): string {
  return `<div class="stat">
    <div class="stat-value">${value}</div>
    <div class="stat-label">${escapeHtml(label)}</div>
  </div>`;
}

export function buildPortfolioHtml(input: PortfolioTemplateInput): string {
  const accent = input.accentHex && /^#[0-9a-fA-F]{6}$/.test(input.accentHex) ? input.accentHex : '#00BFB3';
  const name = escapeHtml(input.studentName);
  const tagline = escapeHtml(input.tagline || 'A living record of everything built and learned at Fraylon Academy.');
  const generatedDate = escapeHtml(input.generatedDateLabel);

  const skillsHtml = input.skills.length
    ? input.skills.map((s) => `<span class="pill">${escapeHtml(s)}</span>`).join('')
    : `<p class="empty">No skills recorded yet.</p>`;

  const projectsHtml = input.projects.length
    ? input.projects.map((p) => `
      <div class="row-card">
        <div class="row-card-head">
          <span class="row-card-title">${escapeHtml(p.name)}</span>
          ${p.difficulty ? `<span class="tag">${escapeHtml(p.difficulty)}</span>` : ''}
        </div>
        ${p.techStack ? `<div class="row-card-sub">${escapeHtml(p.techStack)}</div>` : ''}
        ${p.completedDateLabel ? `<div class="row-card-date">${escapeHtml(p.completedDateLabel)}</div>` : ''}
      </div>`).join('')
    : `<p class="empty">No projects completed yet.</p>`;

  const certsHtml = input.certificates.length
    ? input.certificates.map((c) => `
      <div class="row-card">
        <div class="row-card-head">
          <span class="row-card-title">${escapeHtml(c.title)}</span>
        </div>
        ${c.issuedDateLabel ? `<div class="row-card-date">Issued ${escapeHtml(c.issuedDateLabel)}</div>` : ''}
      </div>`).join('')
    : `<p class="empty">No certificates earned yet.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${name} — Fraylon Academy Portfolio</title>
<style>
  ${input.fontFaceCss}

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    background: ${PAPER_BG};
    font-family: 'Inter', Arial, sans-serif;
    color: ${INK};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { padding: 0 4px; }

  .header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding-bottom: 18px; border-bottom: 2px solid ${accent};
    margin-bottom: 22px;
  }
  .header-left .name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 30px; font-weight: 700; color: ${INK};
  }
  .header-left .tagline { color: ${MUTED}; font-size: 12.5px; margin-top: 6px; max-width: 420px; line-height: 1.5; }
  .header-left .badge {
    display: inline-block; margin-top: 10px; padding: 3px 12px; border-radius: 12px;
    background: ${accent}1a; color: ${accent}; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
  }
  .header-right { text-align: right; }
  .header-right .brand { font-size: 13px; font-weight: 700; color: ${INK}; }
  .header-right .generated { font-size: 10.5px; color: ${MUTED}; margin-top: 4px; }

  .stats-row { display: flex; gap: 14px; margin-bottom: 24px; }
  .stat {
    flex: 1; border: 1px solid ${HAIRLINE}; border-radius: 10px; padding: 12px 14px;
  }
  .stat-value { font-size: 22px; font-weight: 800; color: ${INK}; }
  .stat-label { font-size: 10px; color: ${MUTED}; margin-top: 3px; font-weight: 600; }

  .difficulty-row { display: flex; gap: 18px; margin-bottom: 26px; font-size: 11.5px; color: ${INK}; }
  .difficulty-row .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; }

  .section { margin-bottom: 24px; }
  .section-title {
    font-size: 13px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;
    color: ${INK}; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid ${HAIRLINE};
  }

  .pill {
    display: inline-block; padding: 4px 12px; margin: 0 6px 6px 0; border-radius: 14px;
    background: #f3f4f6; border: 1px solid ${HAIRLINE}; font-size: 11px; font-weight: 600; color: ${INK};
  }

  .row-card {
    border: 1px solid ${HAIRLINE}; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px;
    page-break-inside: avoid;
  }
  .row-card-head { display: flex; align-items: center; justify-content: space-between; }
  .row-card-title { font-size: 12.5px; font-weight: 700; color: ${INK}; }
  .row-card-sub { font-size: 10.5px; color: ${MUTED}; margin-top: 3px; }
  .row-card-date { font-size: 10px; color: ${MUTED}; margin-top: 3px; }
  .tag {
    font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
    color: ${accent}; border: 1px solid ${accent}; border-radius: 10px; padding: 2px 8px;
  }

  .empty { font-size: 11px; color: ${MUTED}; font-style: italic; }

  .footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 30px; padding-top: 16px; border-top: 1px solid ${HAIRLINE};
  }
  .footer-qr img { width: 64px; height: 64px; image-rendering: pixelated; }
  .footer-verify { font-size: 10px; color: ${MUTED}; font-family: 'Courier New', monospace; margin-top: 6px; }
  .footer-note { font-size: 10px; color: ${MUTED}; max-width: 320px; text-align: right; line-height: 1.5; }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-left">
        <div class="name">${name}</div>
        <div class="tagline">${tagline}</div>
        <div class="badge">LIVING PORTFOLIO</div>
      </div>
      <div class="header-right">
        <div class="brand">Fraylon Academy</div>
        <div class="generated">Generated ${generatedDate}</div>
      </div>
    </div>

    <div class="stats-row">
      ${statBlock(input.stats.coursesCompleted, 'Courses Completed')}
      ${statBlock(input.stats.problemsSolved, 'Problems Solved')}
      ${statBlock(input.stats.projectsBuilt, 'Projects Built')}
      ${statBlock(input.stats.practiceAccuracy != null ? `${input.stats.practiceAccuracy}%` : '—', 'Practice Accuracy')}
    </div>

    ${input.stats.problemsSolved > 0 ? `
    <div class="difficulty-row">
      <span><span class="dot" style="background:#22c55e"></span>Easy: ${input.problemsByDifficulty.easy}</span>
      <span><span class="dot" style="background:#eab308"></span>Medium: ${input.problemsByDifficulty.medium}</span>
      <span><span class="dot" style="background:#ef4444"></span>Hard: ${input.problemsByDifficulty.hard}</span>
    </div>` : ''}

    <div class="section">
      <div class="section-title">Projects</div>
      ${projectsHtml}
    </div>

    <div class="section">
      <div class="section-title">Certificates</div>
      ${certsHtml}
    </div>

    <div class="section">
      <div class="section-title">Skills</div>
      ${skillsHtml}
    </div>

    <div class="footer">
      <div>
        ${input.qrPngBase64 ? `<div class="footer-qr"><img alt="" src="data:image/png;base64,${input.qrPngBase64}" /></div>` : ''}
        ${input.verifyUrlLabel ? `<div class="footer-verify">${escapeHtml(input.verifyUrlLabel)}</div>` : ''}
      </div>
      <div class="footer-note">This document is a snapshot generated from a live, continuously-updated Fraylon Academy portfolio. Scan the code to view the current version.</div>
    </div>
  </div>
</body>
</html>`;
}
