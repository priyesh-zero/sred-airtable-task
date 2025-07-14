import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { flattenObject, generateFlatColumnDefs } from '../../utils/data-flattener';

import {
  ENTITIES,
  ENTITY,
  EntityOption,
  EntityType,
} from '../../constants/entity.constants';
import {
  INTEGRATION,
  IntegrationOption,
  INTEGRATIONS,
  IntegrationType,
} from '../../constants/integration.constants';

import { AirtableService } from '../../services/airtable.service';

@Component({
  selector: 'airtable-result',
  standalone: false,
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit, OnDestroy {
  integrations: IntegrationOption[] = INTEGRATIONS;
  selectedIntegration: IntegrationType = INTEGRATION.AIRTABLE;

  entities: EntityOption[] = ENTITIES;
  selectedEntity: EntityType = ENTITY.PROJECTS;

  searchText = '';

  columnDefs: ColDef[] = [];

  rowData: any[] = [];
  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private dialog: MatDialog,
    private airtableSvc: AirtableService,
  ) { }

  ngOnInit(): void {
    this.fetchCollectionData();
    this.searchSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((text) => {
        this.searchText = text;
        this.currentPage = 1;
        this.fetchCollectionData();
      });
  }

  onIntegrationChange(): void {
    this.currentPage = 1;
    this.fetchCollectionData();
  }

  onEntityChange(): void {
    this.currentPage = 1;
    this.fetchCollectionData();

  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchText = '';
    this.searchSubject.next('');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchCollectionData();
  }

  fetchCollectionData(): void {
    this.airtableSvc
      .getCollectionData(this.selectedEntity, this.currentPage, this.pageSize, this.searchText)
      .subscribe({
        next: (res) => {
          // Flatten each row of the response
          const flattenedData = res.data.map(item => flattenObject(item));
          // Generate columns using flattened data
          this.columnDefs = generateFlatColumnDefs(flattenedData);
          // Assign the flattened data to rowData
          this.rowData = flattenedData;
          console.log('Flattened row sample:', flattenedData[0]);
          this.totalRecords = res.total;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        },
        error: (err) => {
          console.error(`Failed to fetch data for ${this.selectedEntity}`, err);
          this.rowData = [];
          this.totalRecords = 0;
          this.totalPages = 0;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
