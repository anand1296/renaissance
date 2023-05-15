import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss']
})
export class InsightsComponent {

  // @Input() public type: string = '';
  // @Input() public data: any;
  // @Input() public options: any;
  @Input() public chartHeader: string = '';
  @Input() public chartData: any; 

}
