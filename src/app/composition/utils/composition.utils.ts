import {
  Agent,
  CompositionResult,
  FeatureKey,
  Features,
  MapData,
} from '../models/composition.types';

export const MAX_AGENTS = 5;

export const FEATURE_KEYS: FeatureKey[] = [
  'feature1',
  'feature2',
  'feature3',
  'feature4',
  'feature5',
];

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  feature1: 'Caracteristica 1',
  feature2: 'Caracteristica 2',
  feature3: 'Caracteristica 3',
  feature4: 'Caracteristica 4',
  feature5: 'Caracteristica 5',
};

const EMPTY_FEATURES: Features = {
  feature1: 0,
  feature2: 0,
  feature3: 0,
  feature4: 0,
  feature5: 0,
};

export function addAgentToComposition(
  selectedAgents: Agent[],
  agent: Agent,
  maxAgents = MAX_AGENTS,
): Agent[] {
  const alreadySelected = selectedAgents.some((selected) => selected.id === agent.id);
  if (alreadySelected || selectedAgents.length >= maxAgents) {
    return selectedAgents;
  }

  return [...selectedAgents, agent];
}

export function removeAgentFromComposition(
  selectedAgents: Agent[],
  agentId: string,
): Agent[] {
  return selectedAgents.filter((agent) => agent.id !== agentId);
}

export function calculateCompliance(
  map: MapData | null,
  selectedAgents: Agent[],
): CompositionResult {
  if (!map || selectedAgents.length === 0) {
    return {
      overallCompliance: 0,
      featureCompliance: { ...EMPTY_FEATURES },
      strengths: [],
      weaknesses: [],
    };
  }

  const complianceEntries = FEATURE_KEYS.map((featureKey) => {
    const requiredValue = map.features[featureKey];
    const providedValue = selectedAgents.reduce(
      (total, agent) => total + agent.features[featureKey],
      0,
    );

    const rawCompliance =
      requiredValue === 0 ? 100 : Math.min(100, (providedValue / requiredValue) * 100);

    return {
      key: featureKey,
      compliance: Math.round(rawCompliance),
    };
  });

  const featureCompliance = complianceEntries.reduce(
    (acc, entry) => ({
      ...acc,
      [entry.key]: entry.compliance,
    }),
    { ...EMPTY_FEATURES },
  );

  const overallCompliance = Math.round(
    complianceEntries.reduce((sum, entry) => sum + entry.compliance, 0) /
      complianceEntries.length,
  );

  const sortedByCoverage = [...complianceEntries].sort(
    (a, b) => b.compliance - a.compliance,
  );

  const strengths = sortedByCoverage
    .slice(0, 2)
    .map((item) => FEATURE_LABELS[item.key]);

  const weaknesses = [...sortedByCoverage]
    .reverse()
    .slice(0, 2)
    .map((item) => FEATURE_LABELS[item.key]);

  return {
    overallCompliance,
    featureCompliance,
    strengths,
    weaknesses,
  };
}

export function getComplianceStatusLabel(overallCompliance: number): string {
  if (overallCompliance <= 39) {
    return 'Muy bajo';
  }

  if (overallCompliance <= 69) {
    return 'Bajo';
  }

  if (overallCompliance <= 89) {
    return 'Bueno';
  }

  return 'Excelente';
}

export function getComplianceStatusClass(overallCompliance: number): string {
  if (overallCompliance <= 39) {
    return 'status-very-low';
  }

  if (overallCompliance <= 69) {
    return 'status-low';
  }

  if (overallCompliance <= 89) {
    return 'status-good';
  }

  return 'status-excellent';
}
