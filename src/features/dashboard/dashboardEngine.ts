import { knowledgeGraph } from '../knowledge/knowledgeGraph';
import { technologyRegistry } from '../knowledge/technologyRegistry';
import { skillsRegistry } from '../knowledge/skillsRegistry';
import { learningTracks } from '../knowledge/learningTracks';
import { routeRegistry } from '../routing/routeRegistry';
import {
  ActivityFeedItem,
  DashboardState,
  LearningTrackProgress,
  NowModuleData,
  SkillRadarItem,
  SystemStatistics,
  TechnologyRadarItem,
} from './types';

/**
 * Enterprise Central Dashboard Engine
 * Assembles all Operating System home screen modules without duplicated data loading
 */
export class DashboardEngine {
  private static instance: DashboardEngine;

  private constructor() {}

  public static getInstance(): DashboardEngine {
    if (!DashboardEngine.instance) {
      DashboardEngine.instance = new DashboardEngine();
    }
    return DashboardEngine.instance;
  }

  /**
   * Assembles the complete state of the Developer OS Dashboard
   */
  public getDashboardState(): DashboardState {
    const allNodes = knowledgeGraph.getAllNodes().filter((n) => !n.draft);
    const sortedNodes = [...allNodes].sort(
      (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    );

    return {
      now: this.getNowModule(),
      statistics: this.getStatisticsModule(allNodes),
      recentlyPublished: sortedNodes.slice(0, 6),
      recentArticles: knowledgeGraph.getNodesByType('article').slice(0, 3),
      recentJournal: knowledgeGraph.getNodesByType('journal').slice(0, 4),
      recentProjects: knowledgeGraph.getNodesByType('project').slice(0, 3),
      recentNotes: knowledgeGraph.getNodesByType('note').slice(0, 4),
      learningProgress: this.getLearningProgressModule(),
      technologyRadar: this.getTechnologyRadarModule(),
      skillRadar: this.getSkillRadarModule(),
      activityFeed: this.getActivityFeedModule(sortedNodes, 8),
      pinnedContent: knowledgeGraph.getIndexStore().featured,
      quickNavigation: this.getQuickNavigationModule(),
    };
  }

  /**
   * Now Module Data Provider
   */
  public getNowModule(): NowModuleData {
    const nowPage = knowledgeGraph.getNodeBySlug('now');
    return {
      focus: ['Enterprise Next.js 16 Architecture', 'MikroTik OSPF Routing', 'Multi-Stage Docker Optimizations'],
      learning: ['Google Gemini AI APIs', 'FastAPI Microservices', 'Advanced Linux Security'],
      reading: ['Designing Data-Intensive Applications by Martin Kleppmann', 'Next.js App Router Internals'],
      location: 'Bandung / Subang, Indonesia',
      status: '🟢 Active & Building hzcode Developer OS',
      lastUpdated: nowPage?.updatedAt || nowPage?.publishedAt || '2026-08-02',
    };
  }

  /**
   * System Statistics Provider
   */
  public getStatisticsModule(nodes = knowledgeGraph.getAllNodes()): SystemStatistics {
    let totalWords = 0;
    nodes.forEach((n) => {
      totalWords += n.wordCount || 0;
    });

    return {
      totalNodes: nodes.length,
      articlesCount: knowledgeGraph.getNodesByType('article').length,
      projectsCount: knowledgeGraph.getNodesByType('project').length,
      journalEntriesCount: knowledgeGraph.getNodesByType('journal').length,
      notesCount: knowledgeGraph.getNodesByType('note').length,
      technologiesCount: technologyRegistry.length,
      skillsCount: skillsRegistry.length,
      totalWordCount: totalWords,
    };
  }

  /**
   * Learning Progress Module Provider
   */
  public getLearningProgressModule(): LearningTrackProgress[] {
    return learningTracks.map((track) => {
      const totalSteps = track.steps.length;
      // Calculate steps completed based on node availability in knowledge graph
      let completedSteps = 0;
      track.steps.forEach((step) => {
        if (knowledgeGraph.getNodeBySlug(step.nodeId)) {
          completedSteps++;
        }
      });

      return {
        id: track.id,
        title: track.title,
        domain: track.domain,
        completedSteps,
        totalSteps,
        percent: Math.round((completedSteps / totalSteps) * 100),
      };
    });
  }

  /**
   * Technology Radar Module Provider
   */
  public getTechnologyRadarModule(): TechnologyRadarItem[] {
    const indexStore = knowledgeGraph.getIndexStore();
    return technologyRegistry.map((tech) => {
      const nodes = indexStore.byTechnology.get(tech.id.toLowerCase()) || [];
      return {
        id: tech.id,
        name: tech.name,
        category: tech.category,
        usageCount: nodes.length,
      };
    }).sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * Skill Radar Module Provider
   */
  public getSkillRadarModule(): SkillRadarItem[] {
    const indexStore = knowledgeGraph.getIndexStore();
    return skillsRegistry.map((skill) => {
      const nodes = indexStore.bySkill.get(skill.id.toLowerCase()) || [];
      return {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        level: skill.level,
        nodeCount: nodes.length,
      };
    });
  }

  /**
   * Activity Feed Module Provider
   */
  public getActivityFeedModule(sortedNodes = knowledgeGraph.getAllNodes(), limit = 8): ActivityFeedItem[] {
    return sortedNodes.slice(0, limit).map((n) => ({
      id: n.id,
      title: n.title,
      type: n.type,
      slug: n.slug,
      date: n.publishedAt,
      description: n.description,
    }));
  }

  /**
   * Quick Navigation Module Provider
   */
  public getQuickNavigationModule(): { title: string; href: string; iconName: string }[] {
    return Object.values(routeRegistry)
      .filter((r) => r.showInNav)
      .map((r) => ({
        title: r.navLabel || r.title.split('|')[0].trim(),
        href: r.path,
        iconName: r.key === 'projects' ? 'folder' : r.key === 'articles' ? 'fileText' : r.key === 'notes' ? 'code' : 'terminal',
      }));
  }
}

export const dashboardEngine = DashboardEngine.getInstance();
