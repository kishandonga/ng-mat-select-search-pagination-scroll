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

    let value = '63f4d278a3d21044f4c753f1';

    let valueObject = {
      "name": "Kishan11",
      "address": "string",
      "contactNumber": "1234567",
      "emailAddress": "fff@d.com",
      "createdAt": "2023-02-21T14:17:28.837Z",
      "id": "63f4d278a3d21044f4c753f1"
    };


    let multiValue = ["63ea2dd7e3a5691a495b68a5", "63f4d278a3d21044f4c753f1"];

    let multiValueObject = [{ "id": "63ea2dd7e3a5691a495b68a5", "name": "Kishan11" }, { "id": "63f4d278a3d21044f4c753f1", "name": "Kishan3" }];

    this.form = this.formBuilder.group({
      matDropDown: new FormControl(''),
      ngDropDown: new FormControl(valueObject, [Validators.required]),
      ngDropDownMulti: new FormControl(multiValue, [Validators.required])
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