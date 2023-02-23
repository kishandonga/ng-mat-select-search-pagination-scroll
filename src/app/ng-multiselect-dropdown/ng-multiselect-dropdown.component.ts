import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilChanged, lastValueFrom, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ng-multiselect-dropdown',
  templateUrl: './ng-multiselect-dropdown.component.html',
  styleUrls: ['./ng-multiselect-dropdown.component.css']
})
export class NgMultiselectDropdownComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() url: string;
  @Input() placeholder: string;
  @Input() outputPattern: any[] = [];
  @Input() bindLabel: string = 'name'
  @Input() uniqueKey: string = 'id'
  @Input() initIdArray: string[] = [];
  @Input() initObjectArray: any[] = [];
  @Output() changeEvent = new EventEmitter<any>();

  onDestroy = new Subject<void>();
  input$ = new Subject<string>();
  options = new BehaviorSubject<any[]>([]);
  options$: Observable<any>;
  data = <any>[];

  multiple: boolean = true;
  selectItem: any = [];
  isFieldDisabled: boolean = false;
  valueType: ValueType = ValueType.noArrayType;

  totalPages = 0;
  currentPage = 1;
  limit = 10;
  isDataLoading: boolean = false;
  reqParam: any;

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
    if (formValue == undefined || formValue == null || formValue == '') {
      return
    }

    if (Array.isArray(formValue)) {
      const isStringArray =
        formValue.length > 0 &&
        formValue.every((value) => {
          return typeof value === 'string';
        });

      if (isStringArray) {
        this.initIdArray = formValue ?? [];
        this.valueType = ValueType.hasArrayOfString;
      }

      const isObjectArray =
        formValue.length > 0 &&
        formValue.every((value) => {
          return typeof value === 'object';
        });

      if (isObjectArray) {
        this.initObjectArray = formValue;
        this.valueType = ValueType.hasArrayOfObject;
      }
    }
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

    let selected = [];
    this.selectItem.forEach((it: any) => {
      let item = this.data.find((el: any) => el[this.uniqueKey] === it);
      selected.push(item);
    });

    this.onTouched();

    if (this.outputPattern.length == 1 && this.outputPattern[0] === 'object') {
      this.submitResult(selected);
      return;
    }


    let resultArray = [];
    selected.forEach((it) => {
      let result: any = {};
      this.outputPattern.forEach((pattern) => {
        it[pattern] && (result[pattern] = it[pattern])
      });
      resultArray.push(result);
    });

    this.submitResult(resultArray);
  }

  submitResult(value: any) {
    this.changeEvent.next(value);
    this.onChange(value);
  }

  observableArray() {
    this.options$ = this.options.asObservable();
  }

  ngOnInit() {
    this.reqParam = {
      limit: this.limit,
      skip: 0,
      searchString: ''
    };

    this.preLoading();
  }

  async preLoading() {
    if (this.valueType == ValueType.hasArrayOfString) {
      if (this.initIdArray) {
        await this.getApiDataById();
        this.selectItem = this.initIdArray;
        this.changeValues();
      }
    } else if (this.valueType == ValueType.hasArrayOfObject) {
      if (this.initObjectArray) {
        this.addToArray(this.initObjectArray);
        this.options.next(this.data);
        this.selectItem = this.initObjectArray.map((it) => it[this.uniqueKey]);
        this.changeValues();
      }
    }

    await this.getApiData();
  }

  async onSearch(term: string) {
    this.data = [];
    this.options.next(this.data);
    this.totalPages = 0;
    this.currentPage = 1;
    this.reqParam.searchString = term ?? '';
    this.reqParam.skip = 0;
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
      const has = this.data.find((el: any) => el[this.uniqueKey] == e[this.uniqueKey]);
      if (!has) {
        this.data.push(e);
      }
    });
  }

  async getApiData() {
    try {
      this.isDataLoading = true;
      var response = await this.callApi(this.reqParam);
      this.addToArray(response.data);
      this.options.next(this.data);
      let totalItems = response.count ?? 0;
      this.totalPages = Math.ceil(totalItems / this.limit);
      this.currentPage = this.currentPage + 1;
      this.reqParam.skip = this.limit;
    } catch (error) {
      console.error(error);
    } finally {
      this.isDataLoading = false;
    }
  }

  async getApiDataById() {
    try {
      this.isDataLoading = true;
      await this.asyncForEach(this.initIdArray, async (id: string, index: number) => {
        var response = await this.callApiById(id);
        this.addToArray([response]);
      });
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

  callApiById(id: string): Promise<any> {
    return lastValueFrom(this.http.get<any>(this.url + '/' + id));
  }

  async asyncForEach(array: any, callback: any) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

enum ValueType { noArrayType, hasArrayOfString, hasArrayOfObject }
