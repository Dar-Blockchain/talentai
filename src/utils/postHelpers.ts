import { softSkillLevels } from "@/constants/skills";
import { Edge, Node } from "reactflow";

export interface Skill {
  name: string;
  level?: number;
  type: 'technical' | 'soft';
  importance?: string;
}
export const getJobSkills = (job: any): string[] => {
  if (!job?.skillAnalysis) return [];

  const skills: string[] = [];

  if (job.skillAnalysis.requiredSkills) {
    skills.push(
      ...job.skillAnalysis.requiredSkills.map((skill: any) => skill.name)
    );
  }

  if (job.skillAnalysis.softSkills) {
    skills.push(
      ...job.skillAnalysis.softSkills.map((skill: any) => skill.name)
    );
  }

  return [...new Set(skills)];
};

export const getLevelFromNumber = (level: number): string => {
  const levelMap: { [key: number]: string } = {
    1: "Entry Level",
    2: "Junior",
    3: "Mid Level",
    4: "Senior",
    5: "Expert",
  };
  return levelMap[level] || "Entry Level";
};

export const getSoftSkillLevelLabel = (value?: number) => {
  const level = softSkillLevels.find(l => l.value === value);
  return level ? level.label : "";
};

export const validatePipelineNodes = (nodes: any[]) => {
  const configuredNodes = nodes.filter(
    node => node.data?.config?.configured
  );

  const unconfiguredNodes = nodes.filter(
    node => !node.data?.config?.configured
  );

  return {
    isValid: unconfiguredNodes.length === 0,
    configuredNodes,
    unconfiguredNodes,
  };
};

export const formatSalary = (salary: any) => {
  if (!salary) return "";

  // Map of currency codes to symbols
  const currencyMap: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    // add more if needed
  };

  const symbol = currencyMap[salary.currency] || salary.currency;

  return `${symbol}${salary.min.toLocaleString()} - ${symbol}${salary.max.toLocaleString()}`;
};


export const getHardSkills = (job: any): Skill[] => {
  if (!job) return [];

  // Pipeline jobs
  if (job.creationType === 'pipeline' && Array.isArray(job.post_Steps)) {
    return job.post_Steps
      .filter((step: any) => step.data?.type === 'technical')
      .flatMap((step: any) =>
        (step.data?.config?.skills || []).map((skill: any) => ({
          name: skill.name,
          level: skill.requiredLevel,
          type: 'technical',
          importance: 'Required',
        }))
      );
  }

  // AI / Manual jobs
  return (job.skillAnalysis?.requiredSkills || []).map((skill: any) => ({
    name: skill.name,
    level: skill.level,
    type: 'technical',
    importance: skill.percentage || 0,
  }));
};

export const getSoftSkills = (job: any): Skill[] => {
  if (!job) return [];

  // Pipeline jobs
  if (job.creationType === 'pipeline' && Array.isArray(job.post_Steps)) {
    return job.post_Steps
      .filter((step: any) => step.data?.type === 'soft')
      .flatMap((step: any) =>
        (step.data?.config?.softSkills || []).map((name: string) => ({
          name,
          type: 'soft',
          importance: 'Required',
        }))
      );
  }

  // AI / Manual jobs
  return (job.skillAnalysis?.softSkills || []).map((skill: any) => ({
    name: skill.name,
    level: skill.level,
    type: 'soft',
    importance: skill.percentage || 0,
  }));
};

export const getPostSkills = (job: any): Skill[] => [
  ...getHardSkills(job),
  ...getSoftSkills(job),
];


export const extractNodesAndEdges = (steps: any) => {
  const extractedNodes = steps.map((step) => {
    const { connections, ...nodeData } = step; // remove connections if not needed
    return nodeData;
  });

  const extractedEdges = steps.flatMap((step) =>
    step.connections.map((conn: any) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      type: conn.type,
      sourceHandle: conn.sourceHandle,
    }))
  );

  return { nodes: extractedNodes, edges: extractedEdges };
};

// Function to generate default pipeline nodes with unique IDs
export const generateDefaultPipelineNodes = (): { nodes: Node[]; edges: Edge[] } => {
  const timestamp = Date.now();
  const randomSuffix1 = Math.random().toString(36).substr(2, 9);
  const randomSuffix2 = Math.random().toString(36).substr(2, 9);
  const randomSuffix3 = Math.random().toString(36).substr(2, 9);

  const technicalId = `technical_${timestamp}_${randomSuffix1}`;
  const softId = `soft_${timestamp}_${randomSuffix2}`;
  const interviewId = `interview_${timestamp}_${randomSuffix3}`;

  const nodes: Node[] = [
    {
      id: technicalId,
      type: "custom",
      position: { x: 250, y: 50 },
      data: {
        label: "Technical Skills 1",
        type: "technical",
        subtitle: "Validate technical skills",
        config: {
          nodeNumber: 1,
          title: "Technical Skills 1",
          configured: false,
        },
      },
    },
    {
      id: softId,
      type: "custom",
      position: { x: 250, y: 180 },
      data: {
        label: "Soft Skills 1",
        type: "soft",
        subtitle: "Assess soft skills",
        config: {
          nodeNumber: 2,
          title: "Soft Skills 1",
          configured: false,
        },
      },
    },
    {
      id: interviewId,
      type: "custom",
      position: { x: 250, y: 310 },
      data: {
        label: "HR Interview 1",
        type: "interview",
        subtitle: "Conduct HR interview",
        config: {
          nodeNumber: 3,
          title: "HR Interview 1",
          configured: false,
        },
      },
    },
  ];

  const edges: Edge[] = [
    {
      id: `edge-${technicalId}-${softId}`,
      source: technicalId,
      target: softId,
      type: "default",
    },
    {
      id: `edge-${softId}-${interviewId}`,
      source: softId,
      target: interviewId,
      type: "default",
    },
  ];

  return { nodes, edges };
};

export const buildRecruitmentSteps = (nodes: Node[], edges: Edge[]) =>
  nodes.map((node, index) => {
    // Get outgoing edges only
    const outgoingEdges = edges.filter((edge) => edge.source === node.id);

    return {
      ...node,
      order: index,
      connections: outgoingEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "outgoing",
        // Only include sourceHandle if present (yes/no for condition nodes)
        ...(edge.sourceHandle ? { sourceHandle: edge.sourceHandle } : {}),
      })),
    };
  });
