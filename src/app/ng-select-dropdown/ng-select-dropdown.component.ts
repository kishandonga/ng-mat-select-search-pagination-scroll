import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilChanged, lastValueFrom, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ng-select-dropdown',
  templateUrl: './ng-select-dropdown.component.html',
  styleUrls: ['./ng-select-dropdown.component.css']
})
export class NgSelectDropdownComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() url: string;
  @Input() placeholder: string;
  @Input() outputPattern: any[] = [];
  @Input() optionViewKey: string = 'name'
  @Input() initValueId: string = '';
  @Output() changeEvent = new EventEmitter<any>();

  onDestroy = new Subject<void>();
  input$ = new Subject<string>();
  options = new BehaviorSubject<any[]>([]);
  options$: Observable<any>;
  data = <any>[];

  selectItem: any;
  isFieldDisabled: boolean = false;

  totalPages = 0;
  currentPage = 1;
  limit = 10;
  isDataLoading: boolean = false;
  filterForm: any;

  onChange = (value: any) => { }

  onTouched = () => { };

  constructor(private http: HttpClient,
    @Self() @Optional() public control: NgControl) {
    this.control && (this.control.valueAccessor = this);
    this.observableArray();

    this.input$.pipe(takeUntil(this.onDestroy), debounceTime(500), distinctUntilChanged())
      .subscribe((search) => {
        this.onSearch(search);
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.input$.unsubscribe();
    this.options.unsubscribe();
  }

  writeValue(formValue: any): void {
    if (!formValue) {
      return
    }
    this.initValueId = formValue ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isFieldDisabled = isDisabled;
  }

  changeValues() {
    if (!this.outputPattern.length) {
      this.submitResult(this.selectItem);
      return;
    }

    const [selected] = this.data.filter((el: any) => el[this.optionViewKey] === this.selectItem);
    this.onTouched();

    if (this.outputPattern.length == 1 && this.outputPattern[0] === 'object') {
      this.submitResult(selected);
      return;
    }

    const result: any = {}
    const patternList = [...this.outputPattern]

    patternList.forEach((pattern: string) => {
      selected[pattern] && (result[pattern] = selected[pattern])
    })

    this.submitResult(result);
  }

  submitResult(value: any) {
    this.changeEvent.next(value);
    this.onChange(value);
  }

  observableArray() {
    this.options$ = this.options.asObservable();
  }

  ngOnInit() {
    this.filterForm = {
      limit: this.limit,
      skip: 0,
      searchString: ''
    };

    this.preLoading();
  }

  async preLoading() {
    if (this.initValueId) {
      await this.getApiDataById();
      const selected = this.data.find((el: any) => el.id === this.initValueId);
      this.selectItem = selected[this.optionViewKey]
      this.changeValues();
    }

    await this.getApiData();
  }

  async onSearch(term: string) {
    this.data = [];
    this.options.next(this.data);
    this.totalPages = 0;
    this.currentPage = 1;
    this.filterForm.searchString = term ?? '';
    this.filterForm.skip = 0;
    await this.getApiData();
  }

  async fetchMore() {
    if (!this.isDataLoading) {
      if (this.currentPage <= this.totalPages) {
        await this.getApiData();
      }
    }
  }

  addToArray(values: any) {
    values.forEach((e: any) => {
      const has = this.data.find((el: any) => el.id == e.id);
      if (!has) {
        this.data.push(e);
      }
    });
  }

  async getApiData() {
    try {
      this.isDataLoading = true;
      var response = await this.callApi(this.filterForm);
      this.addToArray(response.data);
      this.options.next(this.data);
      let totalItems = response.count ?? 0;
      this.totalPages = Math.ceil(totalItems / this.limit);
      this.currentPage = this.currentPage + 1;
      this.filterForm.skip = this.limit;
    } catch (error) {
      console.error(error);
    } finally {
      this.isDataLoading = false;
    }
  }

  async getApiDataById() {
    try {
      this.isDataLoading = true;
      var response = await this.callApiById();
      this.addToArray([response]);
      this.options.next(this.data);
    } catch (error) {
      console.error(error);
    } finally {
      this.isDataLoading = false;
    }
  }

  callApi(params: any): Promise<any> {
    return lastValueFrom(this.http.get<any>(this.url, { params: params }));
  }

  callApiById(): Promise<any> {
    return lastValueFrom(this.http.get<any>(this.url + '/' + this.initValueId));
  }
}
