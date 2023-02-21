import { Component } from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  name = 'Demo';
  myarray = Array.from({length: 1000}).map((_, i) => `Option ${i}`);
  select: FormControl = new FormControl();
  private _data = new BehaviorSubject<any[]>(this.myarray);
  data$ = this._data.asObservable();

  valueChanged(e){
    console.log(`Value is: ${e}`);
    this.select.setValue(e);
  }
  
  searchChanged(e){
    console.log(`Search by: ${e}`);
        let val = e ? e.trim() : null;
        if (!val) {
            this._data.next(this.myarray);
            return;
        } else {
            val = val.toLowerCase();
        }
        this._data.next(this.getAllThatContain(val)); 
  }

  getAllThatContain(val: string): string[] {
    return this.myarray.filter((i) => i.toLowerCase().indexOf(val.toLowerCase()) > -1);
  }
}