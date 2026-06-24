import type { CertType } from './cert-number';

export interface ComposeBodyTextInput {
  type: CertType;
  program: string;          // e.g. "Web Development"
  duration: string;         // e.g. "3-Month Internship"
  startDateLabel: string;   // e.g. "1 March 2026"
  endDateLabel: string;     // e.g. "31 May 2026"
}

// Body paragraph rendered into the certificate PDF. Mirrors the phrasing
// baked into cert-template.png (which the renderer wipes and re-renders).
//
// CRS is the course completion variant used by the LMS. The template PNG's
// baked captions ("Scan Above", "CEO", "Date of issue") are type-agnostic.
export function composeBodyText(input: ComposeBodyTextInput): string {
  switch (input.type) {
    case 'INT':
      return (
        `has successfully completed a ${input.duration} in ${input.program} ` +
        `at Fraylon Technologies from ${input.startDateLabel} to ` +
        `${input.endDateLabel}. During the internship, the candidate ` +
        `demonstrated dedication, technical skills, and excellent performance ` +
        `in ${input.program} and project development.`
      );
    case 'CRS':
      return (
        `has successfully completed the ${input.program} course ` +
        `at Fraylon Academy, demonstrating mastery of core concepts, ` +
        `practical problem-solving skills, and consistent progress ` +
        `through all coursework and assessments.`
      );
    case 'WRK':
      return (
        `has successfully completed the ${input.program} workshop ` +
        `at Fraylon Academy from ${input.startDateLabel} to ` +
        `${input.endDateLabel}, demonstrating proficiency in the ` +
        `covered topics through active participation and assessment.`
      );
  }
}
