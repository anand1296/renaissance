import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  public tabItems = [
    { label: 'Map', icon: 'pi pi-fw pi-home' },
    { label: 'Insights', icon: 'pi pi-fw pi-calendar' }
  ]

}
