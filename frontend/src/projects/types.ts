export interface ChecklistItem {
  id: string;
  label: string;
  check: (code: string) => boolean;
}

export interface ProjectConfig {
  title: string;
  icon: React.ReactNode;
  gradient: string;
}

export interface ProjectDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  tags: string[];
  xp: number;
  concepts: string[];
  learningGoal: string;
  config: ProjectConfig;
  checklist: ChecklistItem[];
  defaultInput: string;
}
