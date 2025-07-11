import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AirtableService } from './services/airtable.service';
import {
  IUserAuth,
  IAirtableAuthResponse,
  ISyncStatus
} from './models/airtable.model';
import { SyncService } from './services/sync.service';

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

  sync: ISyncStatus = {
    isSyncing: false,
    message: '',
    stats: {},
  };

  expanded = true;

  constructor(
    private ngZone: NgZone,
    private airtableSvc: AirtableService,
    private syncSvc: SyncService,
  ) { }

  ngOnInit(): void {
    const isToBeSync = new URLSearchParams(window.location.search).get('sync');
    this.user.isLoading = true;
    this.airtableSvc.getAuthStatus().subscribe((user: IUserAuth) => {
      this.user = user;
      if (user.isConnected) {
        if (isToBeSync === 'true') {
          this.cleanupURL();
          this.listenToSyncProgress(true);
        }
        else {
          this.listenToSyncProgress()
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

  listenToSyncProgress(triggerSync: boolean = false): void {
    this.expanded = false;

    if (triggerSync) {
      this.syncSvc.startUserSync().subscribe();
    }

    const eventSource = this.syncSvc.connectToSyncStatus();

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as ISyncStatus;
      this.sync = data;
      this.ngZone.run(() => {
        if (!this.sync.isSyncing) {
          eventSource.close();
          this.sync.isSyncing = false;
        }
      });
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
      // this.sync.isSyncing = false;
    };
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
