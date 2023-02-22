import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, lastValueFrom, Observable, scan, Subject } from 'rxjs';

@Component({
  selector: 'app-ng-select-dropdown',
  templateUrl: './ng-select-dropdown.component.html',
  styleUrls: ['./ng-select-dropdown.component.css']
})
export class NgSelectDropdownComponent implements OnInit, OnDestroy {

  photos = [];
  photosBuffer = [];
  bufferSize = 50;
  loading = false;
  input$ = new Subject<string>();

  @Input() optionViewKey: string = 'name'

  onDestroy = new Subject<void>();

  options = new BehaviorSubject<any[]>([]);
  options$: Observable<any>;
  data = <any>[];

  selectItem: any = '';
  totalPages = 0;
  currentPage = 1;
  limit = 10;
  paginationData: any;
  isDataLoading: boolean = false;
  filterForm: any;

  userQuestionUpdate = new Subject<string>();


  constructor(private http: HttpClient) {
    this.observableArray();

    this.userQuestionUpdate.pipe(
      debounceTime(400),
      distinctUntilChanged())
      .subscribe(value => {
        console.log(value);
      });
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

  ngOnInit() {
    this.filterForm = {
      limit: this.limit,
      skip: 0,
      searchString: ''
    };

    this.getApiData();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  onSearch(term: string) {
    this.userQuestionUpdate.next(term);
  }

  async fetchMore() {
    if (!this.isDataLoading) {
      if (this.currentPage <= this.totalPages) {
        await this.getApiData();
      }
    }
  }

  async getApiData() {
    try {
      this.isDataLoading = true;
      var response = await this.callApi(this.filterForm);
      this.data = [...this.data, ...response.data];
      this.options.next(response.data);
      let totalItems = response.count ?? 0;
      this.totalPages = Math.ceil(totalItems / this.limit);
      this.currentPage = this.currentPage + 1;
      this.filterForm.skip = this.limit;
    } catch (error) {
      this.options.next([]);
      console.error(error);
    } finally {
      this.isDataLoading = false;
    }
  }

  callApi(params: any): Promise<any> {
    return lastValueFrom(this.http.get<any>('https://ucreate-api-dev.nunoerin.com/client', { params: params }));
  }

}
