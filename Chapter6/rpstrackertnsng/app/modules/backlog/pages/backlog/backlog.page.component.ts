import { Component, OnInit, ViewChild, AfterViewInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { RadSideDrawerComponent } from 'nativescript-pro-ui/sidedrawer/angular';
import { RadSideDrawer, SideDrawerLocation } from 'nativescript-pro-ui/sidedrawer';

import { BacklogService } from '../../services/backlog.service';
import { Store } from '../../../../core/state/app-store';
import { PtItem } from '../../../../core/models/domain';
import { NavigationService } from '../../../../core/services/navigation.service';
import { AuthService } from '../../../../core/services';
import { PresetType } from '../../../../shared/models/ui/types/presets';
import { PtModalService } from '../../../../shared/modals/pt-modal.service';
import { NewItemModalComponent } from '../../modals/new-item/new-item.modal.component';
import { PtNewItem } from '../../../../shared/models/dto';



@Component({
    moduleId: module.id,
    selector: 'pt-backlog',
    templateUrl: 'backlog.page.component.html',
    styleUrls: ['backlog.page.component.css']
})
export class BacklogPageComponent implements AfterViewInit, OnInit {

    @ViewChild(RadSideDrawerComponent) public drawerComponent: RadSideDrawerComponent;
    private drawer: RadSideDrawer;

    public items$ = this.store.select<PtItem[]>('backlogItems');
    public selectedPreset$: Observable<PresetType> = this.store.select<PresetType>('selectedPreset');
    public isListRefreshing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private activatedRoute: ActivatedRoute,
        private navigationService: NavigationService,
        private backlogService: BacklogService,
        private store: Store,
        private ptModalService: PtModalService,
        private vcRef: ViewContainerRef
    ) { }

    public ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            const reqPreset = params['preset'];
            if (reqPreset) {
                this.store.set('selectedPreset', reqPreset);
            }
        });

        this.selectedPreset$.subscribe(next => {
            this.backlogService.fetchItems();
        });
    }

    public ngAfterViewInit() {
        this.drawer = this.drawerComponent.sideDrawer;
        this.drawer.drawerLocation = SideDrawerLocation.Right;
    }

    public showSlideout() {
        this.drawer.mainContent.className = 'drawer-content-in';
        this.drawer.showDrawer();
    }

    public onDrawerClosing() {
        this.drawer.mainContent.className = 'drawer-content-out';
    }

    public selectListItem(item: PtItem) {
        // navigate to detail page
        this.navigationService.navigate(['/detail', item.id]);
    }

    public onListRefreshRequested() {
        this.isListRefreshing$.next(true);
        this.backlogService.fetchItems()
            .then(() => {
                this.isListRefreshing$.next(false);
            })
            .catch(() => {
                this.isListRefreshing$.next(false);
            });
    }

    public onAddTap(_args) {
        const ctx = this.ptModalService.createPtModalContext<null, PtNewItem>(this.vcRef, 'Add New Item', null, null, 'Save');
        this.ptModalService.createModal(NewItemModalComponent, ctx)
            .then(result => {
                if (result) {
                    this.backlogService.addNewPtItem(result, this.store.value.currentUser);
                }
            });
    }
}
