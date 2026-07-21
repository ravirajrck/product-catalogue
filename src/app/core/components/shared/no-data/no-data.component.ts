import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-data',
  imports: [],
  templateUrl: './no-data.component.html',
  styleUrl: './no-data.component.css'
})
export class NoDataComponent {
@Input() title: string = 'No Data Found';
  @Input() subtitle: string = 'Try adjusting your search or filter.';
}
