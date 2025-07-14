import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mfa-dialog',
  standalone: false,
  templateUrl: './mfa-dialog.component.html',
  styleUrls: ['../../styles/dialog.scss']
})
export class MfaDialogComponent {
  mfaCode: string = '';
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<MfaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  submitCode(): void {
    if (!/^[0-9]{6}$/.test(this.mfaCode)) {
      this.errorMessage = 'Please enter a valid 6-digit code.';
      return;
    }

    this.dialogRef.close(this.mfaCode);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
