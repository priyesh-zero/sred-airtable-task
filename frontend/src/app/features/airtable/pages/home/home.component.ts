import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AirtableService } from '../../services/airtable.service';
import { MfaDialogComponent } from '../../components/mfa-dialog/mfa-dialog.component';
import { PasswordDialogComponent } from '../../components/password-dialog/password-dialog.component';
import { LoginDialogComponent } from '../../components/login-dialog/login-dialog.component';
import { SyncService } from '../../services/sync.service';
import { SyncStatusService } from '../../services/sync-status.service';

@Component({
  selector: 'airtable-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  isSyncing = true
  constructor(private dialog: MatDialog, private router: Router, private airtableSvc: AirtableService, private syncService: SyncStatusService) { }

  ngOnInit(): void { 
    this.syncService.syncStatus$.subscribe(response => {
      this.isSyncing = response?.isSyncing ?? true

      if (response?.message === "LOGIN_REQUIRED") {
        this.openLoginDialog()
      }

      if (response?.message.includes("Something went wrong")) {
        alert(response.message)
      }


    })
  }

  get isLoggedIn() {
    return this.airtableSvc.isLoggedIn();
  }

  triggerScraping(): void {
    this.airtableSvc.performScraping().subscribe(response => {
      if (response.status === "LOGIN_REQUIRED") {
        this.openLoginDialog()
      }
    })
  }

  openMfaDialog(): void {
    const dialogRef = this.dialog.open(MfaDialogComponent, {
      width: '350px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(code => {
      if (code) {
        this.sendToBackend(code);
      } else {
        console.log('MFA entry cancelled');
      }
    });
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '350px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(creds => {
      if (!creds) {
        console.log("Login was cancelled!")
        return
      }
      if (creds.email && creds.password) {
        this.airtableSvc.startScraping(creds).subscribe((response) => {
      if (response.status === 'MFA_REQUIRED') {
        this.openMfaDialog();
      }
      if (response.status === 'READY_TO_SCRAPE') {
        this.airtableSvc.performScraping().subscribe((response) => {
          console.log('-----scaper response', response)
        });
      }
    })
      } else {
        console.log('Invalid Login');
      }
    });
  }

  sendToBackend(code: string): void {
    this.airtableSvc.verifyMfaCode(code).subscribe((response) => {
      if (response.status === 'MFA_VERIFIED') {
        this.airtableSvc.performScraping().subscribe((response) => {
          console.log('-----scaper response', response)
        });
      }
    })
  }

  openPasswordDialog(): void {
    const dialogRef = this.dialog.open(PasswordDialogComponent, {
      width: '450px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(password => {
      if (password) {
        // use password for verification
        console.log('Password entered:', password);
      }
    });
  }

}
