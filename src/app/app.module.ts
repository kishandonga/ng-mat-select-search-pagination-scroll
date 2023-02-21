import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AppComponent } from './app.component';
import { INTERCEPTOR_PROVIDER } from './interceptors';
import { PaginatedDropdownComponent } from './paginated-dropdown/paginated-dropdown.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    MatSelectInfiniteScrollModule,
    MatSnackBarModule,
    HttpClientModule
  ],
  providers: [
    INTERCEPTOR_PROVIDER
  ],
  declarations: [
    AppComponent,
    PaginatedDropdownComponent
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
