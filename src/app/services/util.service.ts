import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class UtilService {

    constructor(
        private matSnackBar: MatSnackBar,
    ) { }

    showError(e: any) {
        console.error(e);
        if (e instanceof HttpErrorResponse) {
            let error = (e as any);
            if (error.error.statusCode == 400 || error.error.statusCode == 404) {
                this.showSnack(error.error.message);
            } else {
                this.showSnack(error.error.message);
            }
        }
    }

    showSnack(message: string | null | undefined) {
        if (message) {
            this.matSnackBar.open(message, undefined, { duration: 2500 });
        }
    }

    isNullOrEmpty(value: string | undefined | null): boolean {
        return (value == null || value == undefined || this.isEmpty(value));
    }

    isEmpty(value: string): boolean {
        return (!value || value.trim() === "" || (value.trim()).length === 0);
    }

    filterEmptyFields(data: any): any {
        let fields = <any>{};
        Object.keys(data).forEach(key => {
            let value = data[key];
            if (typeof value === 'string') {
                if (value != '') {
                    fields[key] = data[key];
                }
            } else {
                fields[key] = data[key];
            }
        });
        return fields;
    }

    checkFirstValue(data: string): string {
        data = data.startsWith(',') ? data.substring(1) : data;
        data = data.startsWith(' ,') ? data.substring(2) : data;
        data = data.startsWith('  ,') ? data.substring(3) : data;
        return data;
    }

    checkLastValue(data: string): string {
        data = data.endsWith(',') ? data.substring(0, data.length - 1) : data;
        data = data.endsWith(' ,') ? data.substring(0, data.length - 2) : data;
        data = data.endsWith(', ') ? data.substring(0, data.length - 2) : data;
        return data;
    }

    calDaysBetweenDates(start: string, end: string): string {
        try {
            let differenceInTime = new Date(end).getTime() - new Date(start).getTime();
            let differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
            return differenceInDays.toString();
        } catch (error) {
            console.error(error);
            return '0';
        }
    }

    substr(text: string, count: number): string {
        var lt = text.length;
        if (lt > 100) {
            return text.substring(0, count) + '...';
        } else {
            return text;
        }
    }

    formatString(str: string, ...val: string[]) {
        for (let index = 0; index < val.length; index++) {
            str = str.replace(`{${index}}`, val[index]);
        }
        return str;
    }

    paginate(
        totalItems: number,
        currentPage: number,
        pageSizeLimit: number,
        maxPages: number = 1000
    ) {
        // calculate total pages
        let totalPages = Math.ceil(totalItems / pageSizeLimit);

        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage: number, endPage: number;
        if (totalPages <= maxPages) {
            // total pages less than max so show all pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // total pages more than max so calculate start and end pages
            let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
            let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) {
                // current page near the start
                startPage = 1;
                endPage = maxPages;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                // current page near the end
                startPage = totalPages - maxPages + 1;
                endPage = totalPages;
            } else {
                // current page somewhere in the middle
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSizeLimit;
        let endIndex = Math.min(startIndex + pageSizeLimit - 1, totalItems - 1);

        // create an array of pages to ng-for in the pager control
        let pages = Array.from(Array(endPage + 1 - startPage).keys()).map(
            (i) => startPage + i
        );

        // Offset calculation
        let offset = (currentPage - 1) * pageSizeLimit;
        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSizeLimit: pageSizeLimit,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages,
            offset: offset,
        };
    }
}
