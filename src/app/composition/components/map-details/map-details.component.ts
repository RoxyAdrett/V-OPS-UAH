import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FeatureKey, Features, MapData } from '../../models/composition.types';
import { FEATURE_KEYS, FEATURE_LABELS } from '../../utils/composition.utils';

@Component({
  selector: 'app-map-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-details.component.html',
  styleUrl: './map-details.component.scss',
})
export class MapDetailsComponent {
  @Input() selectedMap: MapData | null = null;

  readonly featureKeys = FEATURE_KEYS;
  readonly featureLabels = FEATURE_LABELS;

  getFeatureValue(features: Features, key: FeatureKey): number {
    return features[key];
  }
}
