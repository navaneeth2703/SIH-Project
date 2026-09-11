/**
 * Samadhan Setu — Role State Management (Prototype Session)
 *
 * Supports the four platform roles in one coordinated problem-solving lifecycle:
 * - Citizen: Report & Track Problems
 * - University / Research: Research & Validate
 * - Industry: Implement & Scale
 * - Government: Review & Govern
 */

export const SAMADHAN_ACTIVE_ROLE_KEY = 'samadhan_active_role';

export const PLATFORM_ROLES = {
  citizen: {
    id: 'citizen',
    name: 'Citizen',
    workspaceTitle: 'Citizen Workspace',
    actionTag: 'Report & Track',
    tagline: 'Report & Track',
    shortPerspective: 'Citizen Perspective',
    bannerTitle: 'CITIZEN — REPORT & TRACK',
    bannerDesc: 'Report a community problem and follow its progress.',
    contributionText: 'Report and track societal challenges.',
    loginDescription: 'Report community problems and follow progress.',
    redirectTo: '/report',
    email: 'citizen.demo@samadhansetu.in',
    nodeColor: 'indigo',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    opportunityBadge: 'Community Submission',
    perspectiveQuestion: () => 'Report and track the problem.',
  },
  university: {
    id: 'university',
    name: 'University / Research',
    workspaceTitle: 'University / Research Workspace',
    actionTag: 'Research & Validate',
    tagline: 'Research & Validate',
    shortPerspective: 'Research & Validation Perspective',
    bannerTitle: 'UNIVERSITY / RESEARCH WORKSPACE',
    bannerDesc: 'Discover societal challenges aligned with research, laboratory, and technical capabilities.',
    contributionText: 'Discover challenges aligned with research and technical capabilities.',
    loginDescription: 'Discover challenges aligned with research and technical capabilities.',
    redirectTo: '/challenges',
    email: 'research.demo@samadhansetu.in',
    nodeColor: 'violet',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    opportunityBadge: 'Research Opportunity',
    alignmentLabel: 'Potential Research Alignment',
    capabilityLabel: 'Relevant Technical Capability',
    perspectiveQuestion: (domain) => {
      switch (domain) {
        case 'traffic':
          return 'Could our transportation expertise help validate a solution?';
        case 'water':
          return 'Could our water quality & environmental engineering expertise help validate a solution?';
        case 'health':
          return 'Could our public health & biomedical expertise help validate a solution?';
        case 'agriculture':
          return 'Could our agricultural engineering & agronomy expertise help validate a solution?';
        default:
          return 'Could our research expertise and laboratory facilities help validate a solution?';
      }
    },
  },
  industry: {
    id: 'industry',
    name: 'Industry',
    workspaceTitle: 'Industry / Implementation Workspace',
    actionTag: 'Implement & Scale',
    tagline: 'Implement & Scale',
    shortPerspective: 'Implementation & Scale Perspective',
    bannerTitle: 'INDUSTRY / IMPLEMENTATION WORKSPACE',
    bannerDesc: 'Discover challenges where engineering, technology, implementation, or deployment capabilities may contribute.',
    contributionText: 'Find implementation opportunities and deployment capabilities.',
    loginDescription: 'Find implementation opportunities and deployment capabilities.',
    redirectTo: '/challenges',
    email: 'industry.demo@samadhansetu.in',
    nodeColor: 'teal',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    opportunityBadge: 'Implementation Opportunity',
    alignmentLabel: 'Potential Deployment Alignment',
    capabilityLabel: 'Relevant Industry Capability',
    perspectiveQuestion: (domain) => {
      switch (domain) {
        case 'traffic':
          return 'Could our mobility/deployment capabilities contribute?';
        case 'water':
          return 'Could our water treatment & engineering infrastructure capabilities contribute?';
        case 'health':
          return 'Could our diagnostic supply & clinical technology capabilities contribute?';
        case 'agriculture':
          return 'Could our micro-irrigation & agro-equipment capabilities contribute?';
        default:
          return 'Could our engineering, deployment, or scaling capabilities contribute?';
      }
    },
  },
  government: {
    id: 'government',
    name: 'Government',
    workspaceTitle: 'Government Review Workspace',
    actionTag: 'Review & Govern',
    tagline: 'Review & Govern',
    shortPerspective: 'Government Review Perspective',
    bannerTitle: 'GOVERNMENT REVIEW WORKSPACE',
    bannerDesc: 'Prioritize challenges, review evidence, and guide progression.',
    contributionText: 'Prioritize challenges, review evidence, and guide progression.',
    loginDescription: 'Prioritize challenges, review evidence, and guide progression.',
    redirectTo: '/government',
    email: 'admin.gov@samadhansetu.in',
    nodeColor: 'purple',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    opportunityBadge: 'Governance & Review',
    principle: 'AI recommends. Government decides.',
    perspectiveQuestion: () => 'Should this direction progress to the next stage?',
  },
};

/**
 * Get active role from sessionStorage. Returns null if not set or invalid.
 */
export function getActiveRole() {
  try {
    const role = sessionStorage.getItem(SAMADHAN_ACTIVE_ROLE_KEY);
    if (role && PLATFORM_ROLES[role]) {
      return role;
    }
  } catch {
    // sessionStorage not accessible
  }
  return null;
}

/**
 * Set active role into sessionStorage and notify subscribers via CustomEvent.
 */
export function setActiveRole(roleId) {
  try {
    if (PLATFORM_ROLES[roleId]) {
      sessionStorage.setItem(SAMADHAN_ACTIVE_ROLE_KEY, roleId);
      window.dispatchEvent(
        new CustomEvent('samadhan_active_role_change', { detail: roleId })
      );
    }
  } catch {
    // ignore
  }
}

/**
 * Clear the active role from sessionStorage and notify subscribers.
 * Does NOT clear challenge data or other prototype data.
 */
export function clearActiveRole() {
  try {
    sessionStorage.removeItem(SAMADHAN_ACTIVE_ROLE_KEY);
    window.dispatchEvent(
      new CustomEvent('samadhan_active_role_change', { detail: null })
    );
  } catch {
    // ignore
  }
}
