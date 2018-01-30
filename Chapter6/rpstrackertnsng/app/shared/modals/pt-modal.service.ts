import { Injectable, Type } from '@angular/core';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular';
import { PtModalContext } from '../models/ui/pt-modal-context.model';

@Injectable()
export class PtModalService {

    private modalIsShowing = false;

    constructor(
        private modalService: ModalDialogService
    ) { }

    public createModal<T, R>(
        type: Type<any>,
        context: PtModalContext<T, R>
    ): Promise<R> {
        if (this.modalIsShowing) {
            return Promise.reject<R>('A modal dialog is already showing.');
        }

        return new Promise((resolve, reject) => {
            const options: ModalDialogOptions = {
                fullscreen: true,
                context: context,
                viewContainerRef: context.vcRef
            };
            this.modalIsShowing = true;
            this.modalService.showModal(type, options)
                .then(result => {
                    resolve(result);
                    this.modalIsShowing = false;
                })
                .catch(err => {
                    reject(err);
                    this.modalIsShowing = false;
                });
        });
    }
}