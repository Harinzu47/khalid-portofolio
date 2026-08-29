import { relations } from 'drizzle-orm';
import { profiles, socialLinks } from './profile';
import {
  organizations,
  careerExperiences,
  experienceProjects,
  experienceSkills,
  experienceDomains,
  experienceTechnologies,
} from './career';
import {
  projects,
  technologies,
  projectTechnologies,
  skills,
  projectSkills,
  projectDomains,
  projectLinks,
  media,
  projectMedia,
} from './projects';
import { domains, domainSkills } from './domains';
import { projectCaseStudies } from './case-studies';
import { adrs } from './adrs';
import {
  nowEntries,
  nowProjects,
  nowDomains,
  nowTechnologies,
  nowLearningPaths,
  nowRoadmaps,
} from './now';
import {
  relationshipTypes,
  relationshipTypeCompatibility,
  knowledgeRelationships,
} from './knowledge-graph';
import {
  articles,
  journalEntries,
  notes,
  tags,
  articleTags,
  journalTags,
  articleProjects,
  journalProjects,
  journalTechnologies,
  articleDomains,
  articleSkills,
  articleTechnologies,
  journalDomains,
  journalSkills,
  noteProjects,
  noteSkills,
  noteDomains,
  noteTechnologies,
  noteTags,
  projectTags,
} from './content';
import {
  certificates,
  learningPaths,
  learningPathSkills,
  learningPathDomains,
  learningPathTechnologies,
  certificateSkills,
  certificateDomains,
  certificateTechnologies,
  roadmapItems,
} from './learning';

// 1. Profile Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  socialLinks: many(socialLinks),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  profile: one(profiles, {
    fields: [socialLinks.profileId],
    references: [profiles.id],
  }),
}));

// 2. Career Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  experiences: many(careerExperiences),
}));

export const careerExperiencesRelations = relations(careerExperiences, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [careerExperiences.organizationId],
    references: [organizations.id],
  }),
  projects: many(experienceProjects),
  skills: many(experienceSkills),
  domains: many(experienceDomains),
  technologies: many(experienceTechnologies),
}));

export const experienceProjectsRelations = relations(experienceProjects, ({ one }) => ({
  experience: one(careerExperiences, {
    fields: [experienceProjects.experienceId],
    references: [careerExperiences.id],
  }),
  project: one(projects, {
    fields: [experienceProjects.projectId],
    references: [projects.id],
  }),
}));

export const experienceSkillsRelations = relations(experienceSkills, ({ one }) => ({
  experience: one(careerExperiences, {
    fields: [experienceSkills.experienceId],
    references: [careerExperiences.id],
  }),
  skill: one(skills, {
    fields: [experienceSkills.skillId],
    references: [skills.id],
  }),
}));

export const experienceDomainsRelations = relations(experienceDomains, ({ one }) => ({
  experience: one(careerExperiences, {
    fields: [experienceDomains.experienceId],
    references: [careerExperiences.id],
  }),
  domain: one(domains, {
    fields: [experienceDomains.domainId],
    references: [domains.id],
  }),
}));

export const experienceTechnologiesRelations = relations(experienceTechnologies, ({ one }) => ({
  experience: one(careerExperiences, {
    fields: [experienceTechnologies.experienceId],
    references: [careerExperiences.id],
  }),
  technology: one(technologies, {
    fields: [experienceTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  caseStudy: one(projectCaseStudies, {
    fields: [projects.id],
    references: [projectCaseStudies.projectId],
  }),
  technologies: many(projectTechnologies),
  skills: many(projectSkills),
  domains: many(projectDomains),
  tags: many(projectTags),
  links: many(projectLinks),
  media: many(projectMedia),
  articles: many(articleProjects),
  journals: many(journalProjects),
  notes: many(noteProjects),
  adrs: many(adrs),
  nowEntries: many(nowProjects),
  experiences: many(experienceProjects),
}));

export const projectCaseStudiesRelations = relations(projectCaseStudies, ({ one }) => ({
  project: one(projects, {
    fields: [projectCaseStudies.projectId],
    references: [projects.id],
  }),
}));

export const technologiesRelations = relations(technologies, ({ many }) => ({
  projects: many(projectTechnologies),
  journals: many(journalTechnologies),
  articles: many(articleTechnologies),
  notes: many(noteTechnologies),
  experiences: many(experienceTechnologies),
  certificates: many(certificateTechnologies),
  learningPaths: many(learningPathTechnologies),
  nowEntries: many(nowTechnologies),
}));

export const projectTechnologiesRelations = relations(projectTechnologies, ({ one }) => ({
  project: one(projects, {
    fields: [projectTechnologies.projectId],
    references: [projects.id],
  }),
  technology: one(technologies, {
    fields: [projectTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  projects: many(projectSkills),
  domains: many(domainSkills),
  articles: many(articleSkills),
  journals: many(journalSkills),
  notes: many(noteSkills),
  experiences: many(experienceSkills),
  certificates: many(certificateSkills),
  learningPaths: many(learningPathSkills),
}));

export const projectSkillsRelations = relations(projectSkills, ({ one }) => ({
  project: one(projects, {
    fields: [projectSkills.projectId],
    references: [projects.id],
  }),
  skill: one(skills, {
    fields: [projectSkills.skillId],
    references: [skills.id],
  }),
}));

export const domainsRelations = relations(domains, ({ many }) => ({
  skills: many(domainSkills),
  projects: many(projectDomains),
  experiences: many(experienceDomains),
  articles: many(articleDomains),
  journals: many(journalDomains),
  notes: many(noteDomains),
  learningPaths: many(learningPathDomains),
  certificates: many(certificateDomains),
  nowEntries: many(nowDomains),
}));

export const domainSkillsRelations = relations(domainSkills, ({ one }) => ({
  domain: one(domains, {
    fields: [domainSkills.domainId],
    references: [domains.id],
  }),
  skill: one(skills, {
    fields: [domainSkills.skillId],
    references: [skills.id],
  }),
}));

export const projectDomainsRelations = relations(projectDomains, ({ one }) => ({
  project: one(projects, {
    fields: [projectDomains.projectId],
    references: [projects.id],
  }),
  domain: one(domains, {
    fields: [projectDomains.domainId],
    references: [domains.id],
  }),
}));

export const projectLinksRelations = relations(projectLinks, ({ one }) => ({
  project: one(projects, {
    fields: [projectLinks.projectId],
    references: [projects.id],
  }),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id],
  }),
  tag: one(tags, {
    fields: [projectTags.tagId],
    references: [tags.id],
  }),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  projects: many(projectMedia),
  articles: many(articles),
  certificates: many(certificates),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(projects, {
    fields: [projectMedia.projectId],
    references: [projects.id],
  }),
  media: one(media, {
    fields: [projectMedia.mediaId],
    references: [media.id],
  }),
}));

// 4. Content Relations
export const articlesRelations = relations(articles, ({ one, many }) => ({
  ogImage: one(media, {
    fields: [articles.ogImageId],
    references: [media.id],
  }),
  tags: many(articleTags),
  projects: many(articleProjects),
  domains: many(articleDomains),
  skills: many(articleSkills),
  technologies: many(articleTechnologies),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articles: many(articleTags),
  journals: many(journalTags),
  notes: many(noteTags),
  projects: many(projectTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

export const articleProjectsRelations = relations(articleProjects, ({ one }) => ({
  article: one(articles, {
    fields: [articleProjects.articleId],
    references: [articles.id],
  }),
  project: one(projects, {
    fields: [articleProjects.projectId],
    references: [projects.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  tags: many(journalTags),
  projects: many(journalProjects),
  technologies: many(journalTechnologies),
  domains: many(journalDomains),
  skills: many(journalSkills),
}));

export const journalTagsRelations = relations(journalTags, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [journalTags.journalId],
    references: [journalEntries.id],
  }),
  tag: one(tags, {
    fields: [journalTags.tagId],
    references: [tags.id],
  }),
}));

export const journalProjectsRelations = relations(journalProjects, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [journalProjects.journalId],
    references: [journalEntries.id],
  }),
  project: one(projects, {
    fields: [journalProjects.projectId],
    references: [projects.id],
  }),
}));

export const journalTechnologiesRelations = relations(journalTechnologies, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [journalTechnologies.journalId],
    references: [journalEntries.id],
  }),
  technology: one(technologies, {
    fields: [journalTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

export const articleDomainsRelations = relations(articleDomains, ({ one }) => ({
  article: one(articles, {
    fields: [articleDomains.articleId],
    references: [articles.id],
  }),
  domain: one(domains, {
    fields: [articleDomains.domainId],
    references: [domains.id],
  }),
}));

export const articleSkillsRelations = relations(articleSkills, ({ one }) => ({
  article: one(articles, {
    fields: [articleSkills.articleId],
    references: [articles.id],
  }),
  skill: one(skills, {
    fields: [articleSkills.skillId],
    references: [skills.id],
  }),
}));

export const articleTechnologiesRelations = relations(articleTechnologies, ({ one }) => ({
  article: one(articles, {
    fields: [articleTechnologies.articleId],
    references: [articles.id],
  }),
  technology: one(technologies, {
    fields: [articleTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

export const journalDomainsRelations = relations(journalDomains, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [journalDomains.journalId],
    references: [journalEntries.id],
  }),
  domain: one(domains, {
    fields: [journalDomains.domainId],
    references: [domains.id],
  }),
}));

export const journalSkillsRelations = relations(journalSkills, ({ one }) => ({
  journal: one(journalEntries, {
    fields: [journalSkills.journalId],
    references: [journalEntries.id],
  }),
  skill: one(skills, {
    fields: [journalSkills.skillId],
    references: [skills.id],
  }),
}));

export const notesRelations = relations(notes, ({ many }) => ({
  projects: many(noteProjects),
  skills: many(noteSkills),
  domains: many(noteDomains),
  technologies: many(noteTechnologies),
  tags: many(noteTags),
}));

export const noteProjectsRelations = relations(noteProjects, ({ one }) => ({
  note: one(notes, {
    fields: [noteProjects.noteId],
    references: [notes.id],
  }),
  project: one(projects, {
    fields: [noteProjects.projectId],
    references: [projects.id],
  }),
}));

export const noteSkillsRelations = relations(noteSkills, ({ one }) => ({
  note: one(notes, {
    fields: [noteSkills.noteId],
    references: [notes.id],
  }),
  skill: one(skills, {
    fields: [noteSkills.skillId],
    references: [skills.id],
  }),
}));

export const noteDomainsRelations = relations(noteDomains, ({ one }) => ({
  note: one(notes, {
    fields: [noteDomains.noteId],
    references: [notes.id],
  }),
  domain: one(domains, {
    fields: [noteDomains.domainId],
    references: [domains.id],
  }),
}));

export const noteTechnologiesRelations = relations(noteTechnologies, ({ one }) => ({
  note: one(notes, {
    fields: [noteTechnologies.noteId],
    references: [notes.id],
  }),
  technology: one(technologies, {
    fields: [noteTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, {
    fields: [noteTags.noteId],
    references: [notes.id],
  }),
  tag: one(tags, {
    fields: [noteTags.tagId],
    references: [tags.id],
  }),
}));

// 5. ADR Relations
export const adrsRelations = relations(adrs, ({ one }) => ({
  project: one(projects, {
    fields: [adrs.projectId],
    references: [projects.id],
  }),
  supersededBy: one(adrs, {
    fields: [adrs.supersededById],
    references: [adrs.id],
  }),
}));

// 6. Learning & Roadmaps Relations
export const certificatesRelations = relations(certificates, ({ one, many }) => ({
  media: one(media, {
    fields: [certificates.certificateMediaId],
    references: [media.id],
  }),
  skills: many(certificateSkills),
  domains: many(certificateDomains),
  technologies: many(certificateTechnologies),
}));

export const learningPathsRelations = relations(learningPaths, ({ many }) => ({
  skills: many(learningPathSkills),
  domains: many(learningPathDomains),
  technologies: many(learningPathTechnologies),
  nowEntries: many(nowLearningPaths),
}));

export const learningPathSkillsRelations = relations(learningPathSkills, ({ one }) => ({
  learningPath: one(learningPaths, {
    fields: [learningPathSkills.learningPathId],
    references: [learningPaths.id],
  }),
  skill: one(skills, {
    fields: [learningPathSkills.skillId],
    references: [skills.id],
  }),
}));

export const learningPathDomainsRelations = relations(learningPathDomains, ({ one }) => ({
  learningPath: one(learningPaths, {
    fields: [learningPathDomains.learningPathId],
    references: [learningPaths.id],
  }),
  domain: one(domains, {
    fields: [learningPathDomains.domainId],
    references: [domains.id],
  }),
}));

export const learningPathTechnologiesRelations = relations(learningPathTechnologies, ({ one }) => ({
  learningPath: one(learningPaths, {
    fields: [learningPathTechnologies.learningPathId],
    references: [learningPaths.id],
  }),
  technology: one(technologies, {
    fields: [learningPathTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

export const certificateSkillsRelations = relations(certificateSkills, ({ one }) => ({
  certificate: one(certificates, {
    fields: [certificateSkills.certificateId],
    references: [certificates.id],
  }),
  skill: one(skills, {
    fields: [certificateSkills.skillId],
    references: [skills.id],
  }),
}));

export const certificateDomainsRelations = relations(certificateDomains, ({ one }) => ({
  certificate: one(certificates, {
    fields: [certificateDomains.certificateId],
    references: [certificates.id],
  }),
  domain: one(domains, {
    fields: [certificateDomains.domainId],
    references: [domains.id],
  }),
}));

export const certificateTechnologiesRelations = relations(certificateTechnologies, ({ one }) => ({
  certificate: one(certificates, {
    fields: [certificateTechnologies.certificateId],
    references: [certificates.id],
  }),
  technology: one(technologies, {
    fields: [certificateTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

export const roadmapItemsRelations = relations(roadmapItems, ({ many }) => ({
  nowEntries: many(nowRoadmaps),
}));

// 7. Now Entry Relations
export const nowEntriesRelations = relations(nowEntries, ({ many }) => ({
  projects: many(nowProjects),
  domains: many(nowDomains),
  technologies: many(nowTechnologies),
  learningPaths: many(nowLearningPaths),
  roadmaps: many(nowRoadmaps),
}));

export const nowProjectsRelations = relations(nowProjects, ({ one }) => ({
  nowEntry: one(nowEntries, {
    fields: [nowProjects.nowId],
    references: [nowEntries.id],
  }),
  project: one(projects, {
    fields: [nowProjects.projectId],
    references: [projects.id],
  }),
}));

export const nowDomainsRelations = relations(nowDomains, ({ one }) => ({
  nowEntry: one(nowEntries, {
    fields: [nowDomains.nowId],
    references: [nowEntries.id],
  }),
  domain: one(domains, {
    fields: [nowDomains.domainId],
    references: [domains.id],
  }),
}));

export const nowTechnologiesRelations = relations(nowTechnologies, ({ one }) => ({
  nowEntry: one(nowEntries, {
    fields: [nowTechnologies.nowId],
    references: [nowEntries.id],
  }),
  technology: one(technologies, {
    fields: [nowTechnologies.technologyId],
    references: [technologies.id],
  }),
}));

export const nowLearningPathsRelations = relations(nowLearningPaths, ({ one }) => ({
  nowEntry: one(nowEntries, {
    fields: [nowLearningPaths.nowId],
    references: [nowEntries.id],
  }),
  learningPath: one(learningPaths, {
    fields: [nowLearningPaths.learningPathId],
    references: [learningPaths.id],
  }),
}));

export const nowRoadmapsRelations = relations(nowRoadmaps, ({ one }) => ({
  nowEntry: one(nowEntries, {
    fields: [nowRoadmaps.nowId],
    references: [nowEntries.id],
  }),
  roadmap: one(roadmapItems, {
    fields: [nowRoadmaps.roadmapId],
    references: [roadmapItems.id],
  }),
}));

// 8. Semantic Graph Relations
export const relationshipTypesRelations = relations(relationshipTypes, ({ many }) => ({
  compatibilities: many(relationshipTypeCompatibility),
  relationships: many(knowledgeRelationships),
}));

export const relationshipTypeCompatibilityRelations = relations(
  relationshipTypeCompatibility,
  ({ one }) => ({
    relationshipType: one(relationshipTypes, {
      fields: [relationshipTypeCompatibility.relationshipTypeId],
      references: [relationshipTypes.id],
    }),
  })
);

export const knowledgeRelationshipsRelations = relations(
  knowledgeRelationships,
  ({ one }) => ({
    relationshipType: one(relationshipTypes, {
      fields: [knowledgeRelationships.relationshipTypeId],
      references: [relationshipTypes.id],
    }),
  })
);
