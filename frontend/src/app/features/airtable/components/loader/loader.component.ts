import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
    selector: 'airtable-loader',
    standalone: false,
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
    constructor(public loaderService: LoaderService) { }
}
