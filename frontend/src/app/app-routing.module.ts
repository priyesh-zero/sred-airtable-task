import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'airtable', pathMatch: 'full' },
  {
    path: 'airtable',
    loadChildren: () =>
      import('./features/airtable/airtable.module').then((m) => m.AirtableModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
