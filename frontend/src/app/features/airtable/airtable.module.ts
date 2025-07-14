import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AgGridModule } from 'ag-grid-angular';
import { ModuleRegistry, PaginationModule } from 'ag-grid-community';
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  MasterDetailModule,
  RowGroupingModule,
  ServerSideRowModelApiModule,
  ServerSideRowModelModule,
} from 'ag-grid-enterprise';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';

import { PageNotFoundComponent } from './pages/error-pages/page-not-found/page-not-found.component';
import { HomeComponent } from './pages/home/home.component';
import { LoaderInterceptor } from './interceptors/loader.interceptor';
import { LoaderComponent } from './components/loader/loader.component';

import { AirtableRoutingModule } from './airtable-routing.module';
import { AirtableComponent } from './airtable.component';
import { HeaderComponent } from './components/header/header.component';
import { MfaDialogComponent } from './components/mfa-dialog/mfa-dialog.component';
import { PasswordDialogComponent } from './components/password-dialog/password-dialog.component';
import { HeaderToolbarComponent } from './components/header-toolbar/header-toolbar.component';
import { ResultComponent } from './pages/result/result.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';

// Register AG Grid modules
ModuleRegistry.registerModules([
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  MasterDetailModule,
  RowGroupingModule,
  ServerSideRowModelModule,
  ServerSideRowModelApiModule,
  PaginationModule,
]);


@NgModule({
  declarations: [
    AirtableComponent,
    HeaderComponent,
    HeaderToolbarComponent,
    HomeComponent,
    ResultComponent,
    PaginationComponent,
    MfaDialogComponent,
    PasswordDialogComponent,
    PageNotFoundComponent,
    LoaderComponent,
    LoginDialogComponent
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
    MatDialogModule,
    MatMenuModule,
    MatToolbarModule,
    MatSelectModule,
    AgGridModule
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
