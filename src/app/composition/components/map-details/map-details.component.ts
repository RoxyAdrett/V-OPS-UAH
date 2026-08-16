import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureKey, Features, MapData, AgentRole, TierList } from '../../models/composition.types';
import { AGENTS_MOCK } from '../../data/agents.mock';

@Component({
  selector: 'app-map-details',
  templateUrl: './map-details.component.html',
  styleUrls: ['./map-details.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class MapDetailsComponent {
  // AQUÍ ESTABA EL ERROR: Volvemos a dejar el Input limpio para que coincida con el HTML de Seba
  @Input() selectedMap: MapData | null = null;

  featureKeys: FeatureKey[] = ['rotacion', 'verticalidad', 'controlMid', 'largasDistancias', 'flanqueo', 'controlPuertas', 'peligroCaida', 'tecnico'];
  featureLabels: Record<FeatureKey, string> = {
    rotacion: 'Rotación', verticalidad: 'Verticalidad', controlMid: 'Control de Mid',
    largasDistancias: 'Largas Distancias', flanqueo: 'Flanqueo', controlPuertas: 'Control de Puertas',
    peligroCaida: 'Peligro de Caída', tecnico: 'Técnico'
  };

  getFeatureValue(features: Features | undefined, key: FeatureKey): number {
    return features && features[key] !== undefined ? features[key] : 0;
  }

  // --- LÓGICA PARA EL META ---
  selectedRole: AgentRole = 'duelistas';
  roles: AgentRole[] = ['duelistas', 'iniciadores', 'humos', 'centinelas'];

  tiers: { key: keyof TierList; label: string; icon: string }[] = [
    { key: 'obligado', label: 'OBLIGADO', icon: '★★★★★' },
    { key: 'bueno', label: 'BUENO', icon: '★★★★' },
    { key: 'jugable', label: 'JUGABLE', icon: '★★★' },
    { key: 'secundario', label: 'SECUNDARIO', icon: '👥' },
    { key: 'trollpick', label: 'TROLLPICK', icon: '🗑️' }
  ];

  selectRole(role: AgentRole) {
    this.selectedRole = role;
  }

  getAgentIcon(agentName: string): string {
    const agent = AGENTS_MOCK.find(a => a.name === agentName);
    return agent ? agent.iconPath : '';
  }

  getAgentsForTier(tierKey: string): string[] {
    if (!this.selectedMap || !this.selectedMap.roles) return [];
    
    const roleData = this.selectedMap.roles[this.selectedRole];
    if (!roleData) return [];
    
    return roleData[tierKey as keyof TierList] || [];
  }
}