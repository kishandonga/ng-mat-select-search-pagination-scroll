import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NgControl, Validators } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilChanged, lastValueFrom, Observable, Subject, takeUntil } from 'rxjs';
import { scan } from 'rxjs/operators';

@Component({
  selector: 'app-paginated-dropdown',
  templateUrl: './paginated-dropdown.component.html',
  styleUrls: ['./paginated-dropdown.component.scss'],
})
export class PaginatedDropdownComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {

  @Input() url: string;
  @Input() fieldLabel: string;
  @Input() placeholder: string;
  @Input() outputPattern: any[] = [];
  @Input() optionViewKey: string = 'name'
  @Output() changeEvent = new EventEmitter<any>();
  @Input() initValue: string;

  filterForm!: FormGroup;
  onDestroy = new Subject<void>();

  options = new BehaviorSubject<any[]>([]);
  options$: Observable<any>;
  data = <any>[];

  initialValue: string;
  isFieldDisabled: boolean = false;
  isFieldRequired: boolean = false;

  totalPages = 0;
  currentPage = 1;
  limit = 10;
  paginationData: any;
  isDataLoading: boolean = false;

  updateForm = (value: any) => { }

  onTouched = () => { };

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    @Self() @Optional() public control: NgControl) {
    this.control && (this.control.valueAccessor = this);

    this.filterForm = this.fb.group({
      limit: new FormControl(this.limit),
      skip: new FormControl(0),
      searchString: new FormControl(''),
    });

    this.observableArray();
  }

  observableArray() {
    this.options$ = this.options.asObservable().pipe(
      scan((acc, curr) => {
        acc = acc ? acc : [];
        curr = curr ? curr : [];
        if (curr.length && curr[0] === 'clear') {
          return [];
        } else {
          return [...acc, ...curr];
        }
      }, [])
    );
  }

  writeValue(formValue: any): void {
    if (!formValue) {
      return
    }
    //this.initValue = formValue;
  }

  registerOnChange(fn: any): void {
    this.updateForm = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isFieldDisabled = isDisabled;
  }

  ngAfterViewInit(): void {
    const timer = setTimeout(() => {
      if (this.control) {
        this.isFieldRequired = this.control?.control?.hasValidator(Validators.required);
        clearTimeout(timer)
      }
    }, 100)
  }

  ngOnInit() {
    this.filterForm.controls['searchString'].valueChanges
      .pipe(takeUntil(this.onDestroy), debounceTime(500), distinctUntilChanged(),)
      .subscribe(async (_value) => {
        if (!this.isDataLoading) {
          this.options.next(['clear']);
          this.data = [];
          this.totalPages = 0;
          this.currentPage = 1;
          this.filterForm.patchValue({ 'skip': 0 });
          await this.getApiData();
        }
      });

    this.getApiData();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  async generateDpResult(value: any) {

    if (!this.outputPattern.length) {
      this.submitResult(value);
      return;
    }

    const [selected] = this.data.filter((el: any) => el[this.optionViewKey] === value);
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
    this.updateForm(value);
  }

  async getData() {
    if (!this.isDataLoading) {
      if (this.currentPage <= this.totalPages) {
        await this.getApiData();
      }
    }
  }

  async getApiData() {
    try {
      this.isDataLoading = true;
      var response = await this.callApi(this.filterForm.value);
      this.data = [...this.data, ...response.data];
      this.options.next(response.data);
      let totalItems = response.count ?? 0;
      this.totalPages = Math.ceil(totalItems / this.limit);
      this.currentPage = this.currentPage + 1;
      this.filterForm.patchValue({ 'skip': this.limit });
    } catch (error) {
      this.options.next([]);
      console.error(error);
    } finally {
      this.isDataLoading = false;
    }
  }

  callApi(params: any): Promise<any> {
    return lastValueFrom(this.http.get<any>(this.url, { params: params }));
  }
}
