import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'airtable-password-dialog',
  standalone: false,
  templateUrl: './password-dialog.component.html',
  styleUrls: ['../../styles/dialog.scss']
})
export class PasswordDialogComponent {
  password: string = '';
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<PasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  submitPassword(): void {
    if (!this.password || this.password.trim().length === 0) {
      this.errorMessage = 'Password is required.';
      return;
    }

    this.dialogRef.close(this.password);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
