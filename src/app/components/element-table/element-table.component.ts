import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ElementService } from '../../services/elements.service';


export interface PeriodicElement {
  position: number;
  name: string;
  weight: number;
  symbol: string;
}
@Component({
  selector: 'app-element-table',
  templateUrl: './element-table.component.html',
  styleUrls: ['./element-table.component.scss']
})
export class ElementTableComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource: PeriodicElement[] = [];
  filteredData: PeriodicElement[] = [];
  filterControl = new FormControl('');
  
  editing: { [key: number]: { [key: string]: boolean } } = {};

  constructor(private elementService: ElementService) {}

  ngOnInit(): void {
    this.filterControl.valueChanges
      .pipe(debounceTime(2000))
      .subscribe(value => this.applyFilter(value || ''));

    this.elementService.getElements().subscribe(data => {
      this.dataSource = data;
      this.filteredData = data;
    });
  }

  applyFilter(filterValue: string): void {
    const filter = filterValue.toLowerCase();
    this.filteredData = this.dataSource.filter(element => 
      element.name.toLowerCase().includes(filter) ||
      element.symbol.toLowerCase().includes(filter) ||
      element.position.toString().includes(filter) ||
      element.weight.toString().includes(filter)
    );
  }

  enableEditing(element: PeriodicElement, field: keyof PeriodicElement): void {
    if (!this.editing[element.position]) {
      this.editing[element.position] = {};
    }
    this.editing[element.position][field] = true;
  }

  disableEditing(element: PeriodicElement, field: keyof PeriodicElement): void {
    this.editing[element.position][field] = false;
  }

  saveEdit(element: PeriodicElement, field: keyof PeriodicElement, event: any): void {
    const newValue = event.target.value;

    const updatedElement = { ...element };

    if (field === 'position') {
      updatedElement['position'] = parseInt(newValue, 10);
    } else if (field === 'weight') {
      updatedElement['weight'] = parseFloat(newValue);
    } else if (field === 'name') {
      updatedElement['name'] = newValue;
    } else if (field === 'symbol') {
      updatedElement['symbol'] = newValue;
    }

    this.dataSource = this.dataSource.map(item =>
      item.position === element.position ? updatedElement : item
    );

    this.filteredData = this.dataSource;

    this.disableEditing(element, field);
  }
}
