import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Agent, FeatureKey, Features } from '../../models/composition.types';
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import {
  FEATURE_KEYS,
  FEATURE_LABELS,
  MAX_AGENTS,
} from '../../utils/composition.utils';

@Component({
  selector: 'app-agent-selector',
  standalone: true,
  imports: [CommonModule, IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar],
  templateUrl: './agent-selector.component.html',
  styleUrl: './agent-selector.component.scss',
})
export class AgentSelectorComponent {
  @Input({ required: true }) agents: Agent[] = [];
  @Input({ required: true }) selectedAgents: Agent[] = [];
  @Input() hasSelectedMap = false;
  @Input() canEdit = false;

  @Output() addAgent = new EventEmitter<Agent>();

  detailsAgent: Agent | null = null;

  selectedRoleFilter = 'todos';
  readonly rolesList = ['todos', 'duelista', 'iniciador', 'controlador', 'centinela'];

  readonly maxAgents = MAX_AGENTS;
  readonly featureKeys = FEATURE_KEYS;
  readonly featureLabels = FEATURE_LABELS;

  get filteredAgents(): Agent[] {
    if (this.selectedRoleFilter === 'todos') {
      return this.agents;
    }
    return this.agents.filter(
      (agent) => agent.role.toLowerCase() === this.selectedRoleFilter.toLowerCase()
    );
  }

  setRoleFilter(role: string): void {
    this.selectedRoleFilter = role;
  }

  isSelected(agentId: string): boolean {
    return this.selectedAgents.some((agent) => agent.id === agentId);
  }

  isDisabled(agentId: string): boolean {
    const selected = this.isSelected(agentId);
    return !this.hasSelectedMap || (!selected && this.selectedAgents.length >= this.maxAgents);
  }

  onSelect(agent: Agent): void {
    if (!this.canEdit || this.isDisabled(agent.id) || this.isSelected(agent.id)) return;
    this.addAgent.emit(agent);
  }

  openDetails(agent: Agent): void {
    this.detailsAgent = agent;
  }

  closeDetails(): void {
    this.detailsAgent = null;
  }

  getFeatureValue(features: Features, key: FeatureKey): number {
    return features[key];
  }
}
