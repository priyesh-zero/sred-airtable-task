import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ISyncStatus, IUserAuth } from '../../models/airtable.model';
import { SyncStatusService } from '../../services/sync-status.service';

@Component({
  selector: 'airtable-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() user!: IUserAuth;
  @Input() expanded = true;

  @Output() connectClicked = new EventEmitter<void>();
  @Output() disconnectClicked = new EventEmitter<void>();

  sync: ISyncStatus = {
    isSyncing: false,
    message: '',
    stats: {}
  };

  constructor(private syncStatusSvc: SyncStatusService) { }

  ngOnInit(): void {
    this.syncStatusSvc.syncStatus$.subscribe((status) => {
      if (status) {
        this.sync = status;
      }
    });
  }

  connect() {
    this.connectClicked.emit();
  }

  disconnect() {
    this.disconnectClicked.emit();
  }
}
