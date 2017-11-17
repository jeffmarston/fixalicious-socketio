import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // private connectionState$: Observable<string>;
  private session = null;
  private isNavCollapsed: boolean;
  // private showModal: boolean;

  toggleNavBar() {
    this.isNavCollapsed = !this.isNavCollapsed;
    // this.showModal = !this.showModal;
  }

  onSelected($event) {
    if ($event) {
      this.session = $event;
    }
  }
}
