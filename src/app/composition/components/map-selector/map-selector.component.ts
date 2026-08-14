import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapData } from '../../models/composition.types';

@Component({
  selector: 'app-map-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-selector.component.html',
  styleUrl: './map-selector.component.scss',
})
export class MapSelectorComponent {
  @Input({ required: true }) maps: MapData[] = [];
  @Input() selectedMapId: string | null = null;

  @Output() mapSelected = new EventEmitter<string>();

  selectMap(mapId: string): void {
    this.mapSelected.emit(mapId);
  }
}