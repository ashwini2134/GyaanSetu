import {
  Target, Zap, Trophy, BookOpen, GraduationCap, Crown, FlaskConical, Code,
  Laptop, Cpu, Brain, Star, Gem, Building2, Flag, Award, GitBranch, CheckCircle,
  Flame, CalendarCheck, Sparkles, Layers, Image, ShieldCheck, UserCheck,
  Sun, Moon, Sunrise,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Maps the backend catalog's string icon keys to lucide-react components.
// Adding a brand-new achievement that reuses an existing key needs no change
// here — only a genuinely new icon key needs one line added.
export const achievementIcons: Record<string, LucideIcon> = {
  target: Target,
  zap: Zap,
  trophy: Trophy,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  crown: Crown,
  "flask-conical": FlaskConical,
  code: Code,
  laptop: Laptop,
  cpu: Cpu,
  brain: Brain,
  star: Star,
  gem: Gem,
  "building-2": Building2,
  flag: Flag,
  award: Award,
  github: GitBranch,
  "check-circle": CheckCircle,
  flame: Flame,
  "calendar-check": CalendarCheck,
  sparkles: Sparkles,
  layers: Layers,
  image: Image,
  "shield-check": ShieldCheck,
  "user-check": UserCheck,
  sun: Sun,
  moon: Moon,
  sunrise: Sunrise,
};

export function getAchievementIcon(key: string): LucideIcon {
  return achievementIcons[key] ?? Award;
}
