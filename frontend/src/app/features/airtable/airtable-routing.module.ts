import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './pages/error-pages/page-not-found/page-not-found.component';
import { HomeComponent } from './pages/home/home.component';
import { AirtableComponent } from './airtable.component';
import { ResultComponent } from './pages/result/result.component';

const routes: Routes = [
  {
    path: '',
    component: AirtableComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'result', component: ResultComponent },
      { path: '**', component: PageNotFoundComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AirtableRoutingModule { }
