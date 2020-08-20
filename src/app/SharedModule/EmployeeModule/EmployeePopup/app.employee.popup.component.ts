import { GraphQLService } from './../../Services/app.graphql.service';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
@Component({
    selector: 'app-employee-popup',
    templateUrl: 'app.employee.popup.component.html',
    styleUrls: ['app.employee.popup.component.scss']
})
export class EmployeePopupComponent {
    @Output() onUpdate = new EventEmitter<string>();

    employeeForm = new FormGroup({
        employeeId: new FormControl(''),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        dateOfBirth: new FormControl(''),
        email: new FormControl(''),
        phoneNumber: new FormControl(''),
    });

    onSubmit() {
        this.onUpdate.emit(this.employeeForm.value);
        return;
    }

    onClose() {
        this.onUpdate.emit(null);
    }
}