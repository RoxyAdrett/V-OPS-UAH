export type AgentRole = 'duelistas' | 'iniciadores' | 'humos' | 'centinelas';
export type ViabilityTier = 'obligado' | 'bueno' | 'jugable' | 'secundario' | 'trollpick';

export type FeatureKey = string;
export type Features = Record<string, number>;

export interface Agent {
  id: string;
  name: string;
  role: string;
  iconPath: string;
  subroles: string[];
  description: string;
  features: Features;
}

export interface TierList {
  obligado: string[];
  bueno: string[];
  jugable: string[];
  secundario: string[];
  trollpick: string[];
}

export interface MapData {
  id: string;
  name: string;
  mapName: string;
  roles: {
    duelistas: TierList;
    iniciadores: TierList;
    humos: TierList;
    centinelas: TierList;
  };
  description: string;
  imagePlaceholder: string;
  features: Features;
  imagePath?: string; 
}

export interface CompositionResult {
  overallCompliance: number;
  featureCompliance: Features;
  strengths: string[];
  weaknesses: string[];
}