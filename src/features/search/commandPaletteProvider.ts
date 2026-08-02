import { routeRegistry } from '../routing/routeRegistry';
import { technologyRegistry } from '../knowledge/technologyRegistry';
import { skillsRegistry } from '../knowledge/skillsRegistry';
import { CommandAction } from './types';

/**
 * Enterprise Command Palette Provider
 * Powers Ctrl+K navigation actions, technology jump links, and quick commands
 */
export class CommandPaletteProvider {
  /**
   * Generates default command palette actions
   */
  public static getDefaultActions(): CommandAction[] {
    const actions: CommandAction[] = [];

    // 1. Navigation Routes
    Object.values(routeRegistry).forEach((r) => {
      if (r.showInNav || r.key === 'about' || r.key === 'resume' || r.key === 'uses' || r.key === 'now') {
        actions.push({
          id: `nav-${r.key}`,
          title: `Go to ${r.navLabel || r.title.split('|')[0].trim()}`,
          subtitle: r.description,
          category: 'Navigation',
          iconName: r.key === 'projects' ? 'folder' : r.key === 'articles' ? 'fileText' : r.key === 'notes' ? 'code' : 'terminal',
          href: r.path,
        });
      }
    });

    // 2. Technology Jump Actions
    technologyRegistry.slice(0, 8).forEach((tech) => {
      actions.push({
        id: `tech-${tech.id}`,
        title: `Filter content by #${tech.name}`,
        subtitle: `Technology in ${tech.category}`,
        category: 'Technology',
        iconName: 'server',
        href: `/projects?tech=${tech.id}`,
      });
    });

    // 3. Skill Actions
    skillsRegistry.slice(0, 6).forEach((skill) => {
      actions.push({
        id: `skill-${skill.id}`,
        title: `Explore skill: ${skill.name}`,
        subtitle: `${skill.level} level in ${skill.category}`,
        category: 'Skill',
        iconName: 'cpu',
        href: `/projects?skill=${skill.id}`,
      });
    });

    return actions;
  }
}
