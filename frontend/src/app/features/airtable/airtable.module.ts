import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { PageNotFoundComponent } from './pages/error-pages/page-not-found/page-not-found.component';
import { HomeComponent } from './pages/home/home.component';
import { LoaderInterceptor } from './interceptors/loader.interceptor';
import { LoaderComponent } from './components/loader/loader.component';

import { AirtableRoutingModule } from './airtable-routing.module';
import { AirtableComponent } from './airtable.component';
import { HeaderComponent } from './components/header/header.component';
import { MfaDialogComponent } from './components/mfa-dialog/mfa-dialog.component';
import { PasswordDialogComponent } from './components/password-dialog/password-dialog.component';

@NgModule({
  declarations: [
    AirtableComponent,
    HeaderComponent,
    HomeComponent,
    MfaDialogComponent,
    PasswordDialogComponent,
    PageNotFoundComponent,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    AirtableRoutingModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {
        appearance: 'outline',
        subscriptSizing: 'dynamic',
      }
    },
  ],
})
export class AirtableModule { }
