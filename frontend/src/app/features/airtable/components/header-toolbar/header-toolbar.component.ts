import { Component, Input } from '@angular/core';
@Component({
  selector: 'header-toolbar',
  standalone: false,
  templateUrl: './header-toolbar.component.html',
  styleUrls: ['./header-toolbar.component.scss']
})
export class HeaderToolbarComponent {
  @Input() expanded = true;

  isMenuOpen = false;

  constructor() { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
