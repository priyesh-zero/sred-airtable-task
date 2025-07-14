import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AirtableService } from '../../services/airtable.service';

@Component({
  selector: 'app-login-dialog',
  standalone: false,
  templateUrl: './login-dialog.component.html',
  styleUrls: ['../../styles/dialog.scss']
})
export class LoginDialogComponent {
  email: string = '';
  password: string = '';
  passwordErrorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private airtableSvc: AirtableService
  ) { }

  ngOnInit() {
    const user = this.airtableSvc.getUserInfo()
    if (user) {
      this.email = user.email
    }
  }

  submitCode(): void {
    

    if (this.password.length <= 3) {
      this.passwordErrorMessage = "Password should be atleast 3 letters"
      return
    }

    this.dialogRef.close({ email: this.email, password: this.password});
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
