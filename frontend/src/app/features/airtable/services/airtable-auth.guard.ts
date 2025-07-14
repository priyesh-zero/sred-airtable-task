import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AirtableService } from './airtable.service';

@Injectable({
  providedIn: 'root'
})
export class AirtableAuthGuard implements CanActivate {
  constructor(
    private airtableSvc: AirtableService,
    private router: Router
  ) { }

  canActivate(): boolean {
    const isLoggedIn = this.airtableSvc.isLoggedIn();
    if (isLoggedIn) {
      return true;
    } else {
      this.router.navigate(['/airtable']);
      return false;
    }
  }
}
