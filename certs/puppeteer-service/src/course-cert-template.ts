// HTML certificate template for Fraylon Academy course-completion certs.
//
// Unlike template.ts (which overlays text on a baked cert-template.png),
// this template draws the whole certificate live in CSS — border, corner
// marks, logo mark, seal. That avoids needing a new baked background image
// per brand/course, and keeps the layout flexible for variable-length
// names and course titles (the center block flows naturally instead of
// using fixed y-offsets, so a wrapped course name pushes what's below it
// down rather than overlapping it).
//
// Canvas: 1000 x 700 (landscape, ~1.43 ratio).

export interface CourseCertTemplateInput {
  recipientName: string;
  courseName: string;         // e.g. "CS50P: Introduction to Python (Capstone: journey-capstone)"
  descriptionText: string;    // e.g. "Awarded for outstanding performance with a quiz average of 85%."
  certNumber: string;
  issueDateLabel: string;     // e.g. "6 July 2026"
  qrPngBase64: string;        // raw base64, no data: prefix
  verifyUrlLabel: string;     // display text, e.g. "fraylonacademy.com/verify/ABC123"
  fontFaceCss: string;        // self-hosted @font-face blocks (data: URIs)
}

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 700;

const ACCENT = '#2563eb';
const ACCENT_LIGHT = '#60a5fa';
const INK = '#161b22';
const MUTED = '#6b7280';
const PAPER_BG = '#fdfbf6';
const HAIRLINE = '#d8d2c4';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildCourseCertHtml(input: CourseCertTemplateInput): string {
  const name = escapeHtml(input.recipientName);
  const courseName = escapeHtml(input.courseName);
  const description = escapeHtml(input.descriptionText);
  const certNumber = escapeHtml(input.certNumber);
  const issueDate = escapeHtml(input.issueDateLabel);
  const verifyLabel = escapeHtml(input.verifyUrlLabel);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Fraylon Academy Certificate</title>
<style>
  ${input.fontFaceCss}

  @page { size: ${CANVAS_WIDTH}px ${CANVAS_HEIGHT}px; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${CANVAS_WIDTH}px;
    height: ${CANVAS_HEIGHT}px;
    overflow: hidden;
    background: #fff;
    font-family: 'Inter', Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .canvas {
    position: relative;
    width: ${CANVAS_WIDTH}px;
    height: ${CANVAS_HEIGHT}px;
    background: ${PAPER_BG};
  }
  .border-outer {
    position: absolute; left: 16px; top: 16px;
    width: ${CANVAS_WIDTH - 32}px; height: ${CANVAS_HEIGHT - 32}px;
    border: 3px solid ${ACCENT};
    border-radius: 4px;
  }
  .border-inner {
    position: absolute; left: 30px; top: 30px;
    width: ${CANVAS_WIDTH - 60}px; height: ${CANVAS_HEIGHT - 60}px;
    border: 1px solid ${HAIRLINE};
    border-radius: 2px;
  }
  .corner {
    position: absolute;
    width: 32px; height: 32px;
    border: 2.5px solid ${ACCENT};
  }
  .corner.tl { left: 44px; top: 44px; border-right: none; border-bottom: none; }
  .corner.tr { right: 44px; top: 44px; border-left: none; border-bottom: none; }
  .corner.bl { left: 44px; bottom: 44px; border-right: none; border-top: none; }
  .corner.br { right: 44px; bottom: 44px; border-left: none; border-top: none; }

  .logo {
    position: absolute; left: 55px; top: 52px;
    display: flex; align-items: center; gap: 12px;
  }
  .logo-mark {
    width: 38px; height: 38px; border-radius: 9px;
    background: linear-gradient(135deg, ${ACCENT_LIGHT}, ${ACCENT});
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 18px; font-weight: 800;
  }
  .logo-text-primary { color: ${INK}; font-size: 19px; font-weight: 700; line-height: 1.15; }
  .logo-text-secondary { color: ${MUTED}; font-size: 10px; font-weight: 600; letter-spacing: 2px; }

  .verified-pill {
    position: absolute; right: 44px; top: 55px;
    padding: 6px 18px; border-radius: 14px;
    background: #fef3c7; border: 1px solid #f59e0b;
    color: #92400e; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;
  }

  /* Center content block flows naturally top-to-bottom so a wrapped
     course name pushes the description down instead of overlapping it. */
  .content {
    position: absolute; left: 130px; top: 122px; width: 740px;
    text-align: center;
  }
  .title { color: ${INK}; font-size: 32px; font-weight: 800; letter-spacing: 2px; }
  .title-underline { width: 140px; height: 2px; background: ${ACCENT}; opacity: 0.6; margin: 12px auto 0; }
  .subtitle { color: ${MUTED}; font-size: 14px; font-style: italic; margin-top: 18px; }
  .name {
    color: ${INK}; font-family: 'Playfair Display', Georgia, serif;
    font-size: 44px; font-weight: 700; line-height: 1.2; margin-top: 18px;
  }
  .name-underline { width: 260px; height: 1.5px; background: ${ACCENT}; opacity: 0.4; margin: 12px auto 0; }
  .completed-line { color: ${MUTED}; font-size: 14px; font-style: italic; margin-top: 20px; }
  .course-name { color: ${ACCENT}; font-size: 21px; font-weight: 700; line-height: 1.35; margin-top: 12px; }
  .description { color: ${MUTED}; font-size: 13px; line-height: 1.55; margin: 14px 60px 0; }
  .divider { width: 340px; height: 1px; background: ${HAIRLINE}; margin: 20px auto 0; }

  .bottom-row {
    position: absolute; left: 55px; bottom: 90px; width: 890px;
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .qr-block { width: 90px; text-align: center; }
  .qr-block img { width: 90px; height: 90px; display: block; image-rendering: pixelated; }
  .qr-caption { margin-top: 8px; color: ${MUTED}; font-size: 10.5px; font-weight: 600; }

  .signature-block { width: 300px; text-align: center; padding-top: 16px; }
  .signature-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic; font-weight: 400; font-size: 26px; color: ${INK};
  }
  .signature-line { margin: 10px auto 0; width: 180px; height: 1px; background: #9ca3af; }
  .signature-caption { margin-top: 8px; color: ${MUTED}; font-size: 10.5px; font-weight: 600; }

  .seal-block { width: 84px; text-align: center; }
  .seal-circle {
    width: 84px; height: 84px; border-radius: 50%;
    background: linear-gradient(135deg, ${ACCENT}, #0f2a3a);
    display: flex; align-items: center; justify-content: center;
    position: relative; margin: 0 auto;
  }
  .seal-ring {
    position: absolute; left: 8px; top: 8px; width: 68px; height: 68px;
    border-radius: 50%; border: 1.5px dashed rgba(255,255,255,0.7);
  }
  .seal-star { opacity: 0.95; }
  .seal-caption { margin-top: 8px; color: ${MUTED}; font-size: 10.5px; font-weight: 600; }
  .seal-date { color: ${INK}; font-size: 12px; font-weight: 700; }

  .footer-id {
    position: absolute; left: 55px; bottom: 21px;
    color: #9ca3af; font-size: 10.5px; font-family: 'Courier New', monospace;
  }
  .footer-verify {
    position: absolute; right: 55px; bottom: 21px;
    color: ${ACCENT}; font-size: 10.5px; font-family: 'Courier New', monospace;
  }
</style>
</head>
<body>
  <div class="canvas">
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <div class="logo">
      <div class="logo-mark">FA</div>
      <div>
        <div class="logo-text-primary">Fraylon</div>
        <div class="logo-text-secondary">ACADEMY</div>
      </div>
    </div>

    <div class="verified-pill">&#10003; VERIFIED</div>

    <div class="content">
      <div class="title">CERTIFICATE OF COMPLETION</div>
      <div class="title-underline"></div>
      <div class="subtitle">This certifies that</div>
      <div class="name">${name}</div>
      <div class="name-underline"></div>
      <div class="completed-line">has successfully completed the course</div>
      <div class="course-name">${courseName}</div>
      <div class="description">${description}</div>
      <div class="divider"></div>
    </div>

    <div class="bottom-row">
      <div class="qr-block">
        <img alt="" src="data:image/png;base64,${input.qrPngBase64}" />
        <div class="qr-caption">Scan to verify</div>
      </div>

      <div class="signature-block">
        <div class="signature-name">Fraylon Academy</div>
        <div class="signature-line"></div>
        <div class="signature-caption">Authorized Signatory</div>
      </div>

      <div class="seal-block">
        <div class="seal-circle">
          <div class="seal-ring"></div>
          <svg class="seal-star" width="30" height="30" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 1.5l2.9 6.6 7.2.6-5.5 4.8 1.7 7-6.3-3.8-6.3 3.8 1.7-7-5.5-4.8 7.2-.6z"/>
          </svg>
        </div>
        <div class="seal-caption">Date of issue</div>
        <div class="seal-date">${issueDate}</div>
      </div>
    </div>

    <div class="footer-id">Certificate ID: ${certNumber}</div>
    <div class="footer-verify">${verifyLabel}</div>
  </div>
</body>
</html>`;
}
