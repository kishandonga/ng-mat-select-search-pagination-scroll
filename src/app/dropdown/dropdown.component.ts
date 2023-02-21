import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { scan } from 'rxjs/operators';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
})
export class DropdownComponent implements OnInit {
  @Input('data') data$;
  @Input() value;
  @Output() changeValue = new EventEmitter();
  @Output() changeSearch = new EventEmitter();

  ctrl: FormControl = new FormControl();
  searchCtrl: FormControl = new FormControl();

  subscriptions: Subscription[] = [];
  _options = new BehaviorSubject([]);
  options$ = this._options.asObservable().pipe(
    scan((acc, curr) => {
      if (!acc || !curr) return [];
      return [...acc, ...curr];
    }, [])
  );
  offset = 0;
  limit = 20;
  data = [];

  constructor() {}

  ngOnInit() {
    this.subscriptions.push(
      this.data$.subscribe({
        next: (data) => {
          console.log('Ingested data changed');
          this.data = data;
          this.offset = 0;
          this._options.next(null);
          this.getNextBatch();
        },
      })
    );
    this.subscriptions.push(
      this.searchCtrl.valueChanges.subscribe((val) => this.onSearchChange(val))
    );

    this.subscriptions.push(
      this.options$.subscribe((val) =>
        console.log(`New view array contains ${val.length} items`)
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onChange(e): void {
    console.log(`Value Changed: ${e}`);
    this.changeValue.emit(e);
  }

  onSearchChange(e): void {
    console.log(`Search Changed: ${e}`);
    this.changeSearch.emit(e);
  }

  async getNextBatch() {
    await this.delay(5000);
    const results = this.data.slice(this.offset, this.offset + this.limit);
    this._options.next(results);
    this.offset += this.limit;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
