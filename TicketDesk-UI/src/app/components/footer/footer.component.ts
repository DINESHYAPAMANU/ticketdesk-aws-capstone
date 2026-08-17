import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-white border-top py-3 text-center text-muted small mt-auto">
      <div class="container-fluid">
        <span>© 2026 TicketDesk IT Support Management. All rights reserved.</span>
      </div>
    </footer>
  `
})
export class FooterComponent {}
