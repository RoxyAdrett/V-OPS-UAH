export type FeatureKey =
  | 'feature1'
  | 'feature2'
  | 'feature3'
  | 'feature4'
  | 'feature5';

export type Features = {
  feature1: number;
  feature2: number;
  feature3: number;
  feature4: number;
  feature5: number;
};

export type MapData = {
  id: string;
  name: string;
  description: string;
  imagePlaceholder: string;
  features: Features;
};

export type Agent = {
  id: string;
  name: string;
  role: string;
  subroles: string[];
  description: string;
  features: Features;
};

export type CompositionResult = {
  overallCompliance: number;
  featureCompliance: Features;
  strengths: string[];
  weaknesses: string[];
};
