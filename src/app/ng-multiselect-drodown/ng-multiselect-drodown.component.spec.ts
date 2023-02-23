import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMultiselectDrodownComponent } from './ng-multiselect-drodown.component';

describe('NgMultiselectDrodownComponent', () => {
  let component: NgMultiselectDrodownComponent;
  let fixture: ComponentFixture<NgMultiselectDrodownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgMultiselectDrodownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgMultiselectDrodownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
