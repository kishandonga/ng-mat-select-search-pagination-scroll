import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  name = 'Angular material mat-select with Search and Pagination Scroll';

  showValidation = false;
  form: FormGroup;
  formValue: any;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      dropDown: new FormControl(''),
      ngDropDown: new FormControl('63f4d278a3d21044f4c753f1', [Validators.required])
    });
  }

  get f(): any {
    return this.form.controls;
  }

  onSubmit() {

    if (this.form.invalid) {
      this.showValidation = true;
      return;
    }
    this.showValidation = false;


    this.formValue = JSON.stringify(this.form.value, null, 4);
  }


}