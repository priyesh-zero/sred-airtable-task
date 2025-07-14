import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
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

  // AG Grid configuration with master-detail support and dynamic detail grid generation
  gridOptions: GridOptions = {
    masterDetail: true, // Enable master-detail row expansion
    detailRowHeight: 500,
    // Define custom parameters for rendering detail rows
    detailCellRendererParams: (params: any) => {
      // Safely extract and normalize the `fields` data from the main row
      const detailData = Array.isArray(params.data?.fields)
        // If `fields` is already an array, use it directly
        ? params.data.fields
        : typeof params.data?.fields === 'object' && params.data?.fields !== null
          // If `fields` is an object, convert its values to an array
          ? [params.data.fields]
          // If `fields` is missing, null, or not an object/array, fallback to empty array
          : [];
      const flattenedData = detailData.map((item: any) => flattenObject(item)); // Flatten nested objects
      const generatedCols = generateFlatColumnDefs(flattenedData); // Generate dynamic column definitions

      // Use generated columns if available, otherwise fall back to empty
      const dynamicCols = generatedCols.length > 0
        ? generatedCols
        : [];

      return {
        // Configuration for the inner detail grid
        detailGridOptions: {
          columnDefs: dynamicCols,  // Dynamic columns for the detail grid
          defaultColDef: {          // Default column behavior
            resizable: true,
            sortable: true,
            filter: true,
            flex: 1,
            minWidth: 220
          }
        },
        // Provide the data for the detail grid when a row is expanded
        getDetailRowData: (detailParams: any) => {
          detailParams.successCallback(flattenedData);  // Send data to the inner grid
        }
      };
    }
  };

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
          const flattenedData = res.data.map(item => flattenObject(item, '', {}, ['fields']));
          // Generate columns using flattened data
          const generatedCols = generateFlatColumnDefs(flattenedData, ['fields']);

          // If columns are generated, set the first one to show the expand icon for detail view
          if (generatedCols.length > 0) {
            generatedCols[0] = {
              ...generatedCols[0],
              cellRenderer: 'agGroupCellRenderer', // This adds the expand icon
            };
          }

          // Set the generated columns and row data for the grid
          this.columnDefs = generatedCols;
          this.rowData = flattenedData;

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
