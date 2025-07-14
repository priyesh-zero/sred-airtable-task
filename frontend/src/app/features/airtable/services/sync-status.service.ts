import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISyncStatus } from '../models/airtable.model';
import { SyncService } from './sync.service';

@Injectable({ providedIn: 'root' })
export class SyncStatusService implements OnDestroy {
  private eventSource: EventSource | null = null;
  private syncStatusSubject = new BehaviorSubject<ISyncStatus | null>(null);
  public syncStatus$ = this.syncStatusSubject.asObservable();

  constructor(private ngZone: NgZone, private syncService: SyncService) { }

  initSyncListener(triggerSync = false): void {
    if (this.eventSource) return;

    if (triggerSync) {
      this.syncService.startUserSync().subscribe();
    }

    this.eventSource = this.syncService.connectToSyncStatus();

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as ISyncStatus;

      this.ngZone.run(() => {
        this.syncStatusSubject.next(data);

        if (!data.isSyncing) {
          this.cleanup();
        }
      });
    };

    this.eventSource.onerror = (err) => {
      console.error('[SSE Error]', err);
      this.ngZone.run(() => this.cleanup());
    };
  }

  private cleanup(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
