import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ISyncStatus, IUserAuth } from '../../models/airtable.model';
@Component({
  selector: 'airtable-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() user!: IUserAuth;
  @Input() sync!: ISyncStatus;
  @Input() expanded = true;

  @Output() connectClicked = new EventEmitter<void>();
  @Output() disconnectClicked = new EventEmitter<void>();

  constructor() { }

  connect() {
    this.connectClicked.emit();
  }

  disconnect() {
    this.disconnectClicked.emit();
  }

}
