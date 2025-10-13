import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ProductService } from 'src/app/shared/data-access/product.service';
import { ERoutes } from 'src/app/routing/routes.constants';
import { Order } from 'src/app/shared/interfaces/order';
import { STATUSES } from 'src/app/shared/constants/statues';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCardModule,
    TranslatePipe,
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
})
export class OrdersListComponent {
  public service = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly statuses = STATUSES;

  readonly clientCtrl = new FormControl('');
  readonly statusCtrl = new FormControl('');
  readonly sortCtrl = new FormControl('date');

  readonly filters = computed(() => this.service.filters());
  readonly orders = computed(() => this.service.orders());

  readonly displayedColumns = [
    'id',
    'client',
    'status',
    'total',
    'createdAt',
    'actions',
  ];

  constructor() {
    effect(() => {
      const query = this.route.snapshot.queryParams;
      this.clientCtrl.setValue(query['client'] || '', { emitEvent: false });
      this.statusCtrl.setValue(query['status'] || '', { emitEvent: false });
      this.sortCtrl.setValue(query['sort'] || 'date', { emitEvent: false });
    });

    this.clientCtrl.valueChanges.pipe(debounceTime(300)).subscribe((client) => {
      this.updateFilters({ client: client ?? '' });
    });

    this.statusCtrl.valueChanges.subscribe((status) => {
      this.updateFilters({ status: status ?? '' });
    });

    this.sortCtrl.valueChanges.subscribe((val) => {
      this.updateFilters({
        sort: val === 'date' || val === 'total' ? val : 'date',
      });
    });
  }

  updateFilters(partial: Partial<ReturnType<typeof this.service.filters>>) {
    const newFilters = { ...this.service.filters(), ...partial, page: 1 };
    this.service.setFilter(newFilters);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newFilters,
      queryParamsHandling: 'merge',
    });
  }

  onPageChange(e: PageEvent) {
    this.service.setFilter({ page: e.pageIndex + 1, pageSize: e.pageSize });
  }

  openOrder(order: Order) {
    this.service.selectOrder(order);
    this.router.navigate([`${ERoutes.PRIVATE_ORDERS}/${order.id}`]);
  }

  delete(id: number) {
    this.service.remove(id);
  }
}
