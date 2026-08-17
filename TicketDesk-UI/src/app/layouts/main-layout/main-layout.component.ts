import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="d-flex flex-column min-vh-100 bg-light">
      <app-header (toggleSidebar)="collapsed.set(!collapsed())"></app-header>
      
      <div class="d-flex flex-grow-1 overflow-hidden">
        <app-sidebar [collapsed]="collapsed()"></app-sidebar>
        
        <main class="flex-grow-1 p-3 p-md-4 overflow-auto">
          <div class="container-fluid">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <app-footer></app-footer>
    </div>
  `
})
export class MainLayoutComponent {
  collapsed = signal<boolean>(false);
}
