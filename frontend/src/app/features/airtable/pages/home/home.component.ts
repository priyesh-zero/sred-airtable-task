import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AirtableService } from '../../services/airtable.service';
import { MfaDialogComponent } from '../../components/mfa-dialog/mfa-dialog.component';

@Component({
  selector: 'airtable-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private dialog: MatDialog, private router: Router, private airtableSvc: AirtableService) { }

  ngOnInit(): void { }

  get isLoggedIn() {
    return this.airtableSvc.isLoggedIn();
  }

  triggerScraping(): void {
    this.airtableSvc.startScraping().subscribe((response) => {
      if (response.status === 'MFA_REQUIRED') {
        this.openMfaDialog();
      }
      if (response.status === 'READY_TO_SCRAPE') {
        this.airtableSvc.performScraping().subscribe((response) => {
          console.log('-----scaper response', response)
        });
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

  sendToBackend(code: string): void {
    this.airtableSvc.verifyMfaCode(code).subscribe((response) => {
      if (response.status === 'MFA_VERIFIED') {
        this.airtableSvc.performScraping().subscribe((response) => {
          console.log('-----scaper response', response)
        });
      }
    })
  }
}
