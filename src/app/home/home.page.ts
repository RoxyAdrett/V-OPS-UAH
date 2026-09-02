import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { Agent, CompositionResult, MapData } from '../composition/models/composition.types';
import { MAPS_MOCK } from '../composition/data/maps.mock';
import { AGENTS_MOCK } from '../composition/data/agents.mock';
import {
  addAgentToComposition,
  calculateCompliance,
  removeAgentFromComposition,
} from '../composition/utils/composition.utils';
import { MapSelectorComponent } from '../composition/components/map-selector/map-selector.component';
import { MapDetailsComponent } from '../composition/components/map-details/map-details.component';
import { AgentSelectorComponent } from '../composition/components/agent-selector/agent-selector.component';
import { SelectedCompositionComponent } from '../composition/components/selected-composition/selected-composition.component';
import { ComplianceResultComponent } from '../composition/components/compliance-result/compliance-result.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonContent,
    MapSelectorComponent,
    MapDetailsComponent,
    AgentSelectorComponent,
    SelectedCompositionComponent,
    ComplianceResultComponent,
  ],
})
export class HomePage {
  readonly maps = MAPS_MOCK;
  readonly agents = AGENTS_MOCK;

  // Mapa seleccionado por defecto para que la sección "Meta del Mapa" cargue de inmediato
  selectedMap: MapData | null = this.maps[0] ?? null;
  selectedAgents: Agent[] = [];
  readonly compositionSlots = [
    { name: 'Composición 1', agents: [] as Agent[] },
    { name: 'Composición 2', agents: [] as Agent[] },
    { name: 'Composición 3', agents: [] as Agent[] },
  ];
  activeCompositionIndex = 0;

  constructor(private readonly authService: AuthService) {}

  get isCoach(): boolean {
    return this.authService.currentUser?.role === 'coach';
  }

  get complianceResult(): CompositionResult {
    return calculateCompliance(this.selectedMap, this.selectedAgents);
  }

  selectMap(mapId: string): void {
    this.selectedMap = this.maps.find((map) => map.id === mapId) ?? null;
  }

  selectComposition(index: number): void {
    this.activeCompositionIndex = index;
    this.selectedAgents = this.compositionSlots[index].agents;
  }

  addAgent(agent: Agent): void {
    this.selectedAgents = addAgentToComposition(this.selectedAgents, agent);
    this.compositionSlots[this.activeCompositionIndex].agents = this.selectedAgents;
  }

  removeAgent(agentId: string): void {
    this.selectedAgents = removeAgentFromComposition(this.selectedAgents, agentId);
    this.compositionSlots[this.activeCompositionIndex].agents = this.selectedAgents;
  }
}
