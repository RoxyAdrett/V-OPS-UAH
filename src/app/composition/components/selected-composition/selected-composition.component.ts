import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Agent } from '../../models/composition.types';
import { MAX_AGENTS } from '../../utils/composition.utils';

@Component({
  selector: 'app-selected-composition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selected-composition.component.html',
  styleUrl: './selected-composition.component.scss',
})
export class SelectedCompositionComponent {
  @Input({ required: true }) selectedAgents: Agent[] = [];
  @Input() canEdit = false;

  @Output() removeAgent = new EventEmitter<string>();

  readonly maxAgents = MAX_AGENTS;
  readonly slotIndices = [0, 1, 2, 3, 4];

  remove(agentId: string): void {
    this.removeAgent.emit(agentId);
  }
}
