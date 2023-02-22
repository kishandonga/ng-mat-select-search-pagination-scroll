import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  name = 'Angular material mat-select with Search and Pagination Scroll';

  form: FormGroup;
  formValue: any;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      dropDown: new FormControl('')
    });
  }

  onSubmit() {
    this.formValue = JSON.stringify(this.form.value, null, 4);
  }


}