import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Agent, FeatureKey, Features } from '../../models/composition.types';
import {
  FEATURE_KEYS,
  FEATURE_LABELS,
  MAX_AGENTS,
} from '../../utils/composition.utils';

@Component({
  selector: 'app-agent-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-selector.component.html',
  styleUrl: './agent-selector.component.scss',
})
export class AgentSelectorComponent {
  @Input({ required: true }) agents: Agent[] = [];
  @Input({ required: true }) selectedAgents: Agent[] = [];
  @Input() hasSelectedMap = false;

  @Output() addAgent = new EventEmitter<Agent>();

  readonly maxAgents = MAX_AGENTS;
  readonly featureKeys = FEATURE_KEYS;
  readonly featureLabels = FEATURE_LABELS;

  isSelected(agentId: string): boolean {
    return this.selectedAgents.some((agent) => agent.id === agentId);
  }

  isDisabled(agentId: string): boolean {
    const selected = this.isSelected(agentId);
    return !this.hasSelectedMap || (!selected && this.selectedAgents.length >= this.maxAgents);
  }

  onSelect(agent: Agent): void {
    this.addAgent.emit(agent);
  }

  getFeatureValue(features: Features, key: FeatureKey): number {
    return features[key];
  }
}
