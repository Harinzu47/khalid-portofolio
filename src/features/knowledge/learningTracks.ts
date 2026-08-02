import { LearningTrack } from './types';

/**
 * Enterprise Learning Tracks & Progression Paths
 */
export const learningTracks: LearningTrack[] = [
  {
    id: 'track-networking',
    title: 'Enterprise Networking & Routing Track',
    description: 'From fundamental IP subnets to multi-site OSPF dynamic routing & VLAN segmentation',
    domain: 'Networking',
    steps: [
      { step: 1, nodeId: 'note-networking-subnets', title: 'IPv4 Subnetting & Addressing' },
      { step: 2, nodeId: 'note-networking-vlans', title: '802.1Q VLAN Segmentation & Trunking', prerequisites: ['note-networking-subnets'] },
      { step: 3, nodeId: 'note-networking-mikrotik-ospf', title: 'MikroTik RouterOS OSPF Dynamic Routing', prerequisites: ['note-networking-vlans'] },
      { step: 4, nodeId: 'gns3-vlan-lab', title: 'GNS3 Enterprise VLAN & OSPF Multi-Site Simulation', prerequisites: ['note-networking-mikrotik-ospf'] },
    ],
  },
  {
    id: 'track-fullstack-devops',
    title: 'Fullstack App & Infrastructure Track',
    description: 'Building production-grade web apps deployed on containerized environments with CI/CD',
    domain: 'Web & Infra',
    steps: [
      { step: 1, nodeId: 'journal-docker-multistage-laravel', title: 'Multi-Stage Docker Builds for PHP/Laravel' },
      { step: 2, nodeId: 'journal-fixing-n1-query', title: 'Database Optimization & Eager Loading', prerequisites: ['journal-docker-multistage-laravel'] },
      { step: 3, nodeId: 'journal-https-lets-encrypt-cloudflare', title: 'Automated SSL/TLS with Let\'s Encrypt & Nginx', prerequisites: ['journal-docker-multistage-laravel'] },
      { step: 4, nodeId: 'flc-lms', title: 'FLC LMS Production Deployment with GitHub Actions CI/CD', prerequisites: ['journal-https-lets-encrypt-cloudflare', 'journal-fixing-n1-query'] },
    ],
  },
];

export function getLearningTrackById(id: string): LearningTrack | undefined {
  return learningTracks.find((t) => t.id === id);
}

export function getLearningTracksByDomain(domain: string): LearningTrack[] {
  return learningTracks.filter((t) => t.domain.toLowerCase().includes(domain.toLowerCase()));
}
