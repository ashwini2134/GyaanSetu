import BentoTemplate from './BentoTemplate';
import MinimalTemplate from './MinimalTemplate';
import SidebarTemplate from './SidebarTemplate';
import EditorialTemplate from './EditorialTemplate';
import TerminalTemplate from './TerminalTemplate';
import StoryTemplate from './StoryTemplate';
import ResumeTemplate from './ResumeTemplate';
import LedgerTemplate from './LedgerTemplate';
import JourneyTemplate from './JourneyTemplate';
import AtelierTemplate from './AtelierTemplate';

export const TEMPLATE_COMPONENTS = {
  bento: BentoTemplate,
  minimal: MinimalTemplate,
  sidebar: SidebarTemplate,
  editorial: EditorialTemplate,
  terminal: TerminalTemplate,
  story: StoryTemplate,
  resume: ResumeTemplate,
  ledger: LedgerTemplate,
  journey: JourneyTemplate,
  atelier: AtelierTemplate,
} as const;

export type TemplateComponentId = keyof typeof TEMPLATE_COMPONENTS;
