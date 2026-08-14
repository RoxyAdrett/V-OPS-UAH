import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CompositionResult, FeatureKey, Features } from '../../models/composition.types';
import {
  FEATURE_KEYS,
  FEATURE_LABELS,
  getComplianceStatusClass,
  getComplianceStatusLabel,
} from '../../utils/composition.utils';

@Component({
  selector: 'app-compliance-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compliance-result.component.html',
  styleUrl: './compliance-result.component.scss',
})
export class ComplianceResultComponent {
  @Input() hasSelectedMap = false;
  @Input() result: CompositionResult | null = null;

  readonly featureKeys = FEATURE_KEYS;
  readonly featureLabels = FEATURE_LABELS;

  readonly emptyResult: CompositionResult = {
    overallCompliance: 0,
    featureCompliance: {
      feature1: 0,
      feature2: 0,
      feature3: 0,
      feature4: 0,
      feature5: 0,
    },
    strengths: [],
    weaknesses: [],
  };

  get effectiveResult(): CompositionResult {
    return this.result ?? this.emptyResult;
  }

  get statusLabel(): string {
    return getComplianceStatusLabel(this.effectiveResult.overallCompliance);
  }

  get statusClass(): string {
    return getComplianceStatusClass(this.effectiveResult.overallCompliance);
  }

  getFeatureValue(features: Features, key: FeatureKey): number {
    return features[key];
  }
}
