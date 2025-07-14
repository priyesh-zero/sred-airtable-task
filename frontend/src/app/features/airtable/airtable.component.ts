import { Component } from '@angular/core';
import { AirtableService } from './services/airtable.service';
import {
  IUserAuth
} from './models/airtable.model';
import { SyncStatusService } from './services/sync-status.service';

@Component({
  selector: 'app-airtable',
  standalone: false,
  templateUrl: './airtable.component.html',
  styleUrls: ['./airtable.component.scss'],
})
export class AirtableComponent {
  user: IUserAuth = {
    isConnected: false,
    isLoading: true,
    email: '',
    connectedAt: null,
    errorMessage: '',
  };

  constructor(
    private airtableSvc: AirtableService,
    private syncStatusSvc: SyncStatusService
  ) { }

  ngOnInit(): void {
    const isToBeSync = new URLSearchParams(window.location.search).get('sync');
    this.user.isLoading = true;
    this.airtableSvc.getAuthStatus().subscribe((user: IUserAuth) => {
      this.user = user;
      if (user.isConnected) {
        if (isToBeSync === 'true') {
          this.cleanupURL();
          this.syncStatusSvc.initSyncListener(true);
        }
        else {
          this.syncStatusSvc.initSyncListener();
        }
      }
    });
  }

  connect(): void {
    this.airtableSvc.initiateAirtableLogin();
  }

  disconnect(): void {
    this.airtableSvc.disconnectAirtable().subscribe({
      next: () => {
        this.resetAuthState();
        this.airtableSvc.removeUser();
      },
      error: (err: Error) => {
        this.user.errorMessage = err.message;
      },
    });
  }

  private resetAuthState(): void {
    this.user = {
      isConnected: false,
      isLoading: false,
      email: '',
      connectedAt: null,
      errorMessage: '',
    };
  }

  private cleanupURL(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('sync');
    window.history.replaceState({}, '', url.toString());
  }
}
