import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  Tag,
  Folder,
  FileText,
  Terminal,
  ExternalLink,
  Github,
  Mail,
  Linkedin,
  Server,
  Network,
  Cpu,
  Wifi,
  Router,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Search,
  Menu,
  X,
  Code2,
} from 'lucide-react';

export const iconMap = {
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  calendar: Calendar,
  clock: Clock,
  tag: Tag,
  folder: Folder,
  fileText: FileText,
  terminal: Terminal,
  externalLink: ExternalLink,
  github: Github,
  mail: Mail,
  linkedin: Linkedin,
  server: Server,
  network: Network,
  cpu: Cpu,
  wifi: Wifi,
  router: Router,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
  tip: Lightbulb,
  search: Search,
  menu: Menu,
  close: X,
  code: Code2,
};

export type IconName = keyof typeof iconMap;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
}

/**
 * Centralized Icon primitive
 */
export function Icon({ name, size = 16, className = '', ...props }: IconProps) {
  const Component = iconMap[name] || iconMap.fileText;
  return <Component size={size} className={`inline-block flex-shrink-0 ${className}`} {...props} />;
}
