import { MatDividerModule } from '@angular/material/divider';
import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import {
//   MatFormFieldModule,
//   MatInputModule,
//   MatSelectModule,
//   MatButtonModule,
//   MatCardModule,
//   MatProgressSpinnerModule,
//   MatIconModule,
//   MatDividerModule,
// } from '@angular/material';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductService } from '../../shared/data-access/product.service';
import { ERoutes } from 'src/app/routing/routes.constants';
import { Order } from 'src/app/shared/interfaces/order';
import { STATUSES } from 'src/app/shared/constants/statues';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    MatDividerModule,
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent {
  private fb = inject(NonNullableFormBuilder);
  private service = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly statuses = STATUSES;
  readonly selectedOrder = computed(() => this.service.selectedOrder());
  readonly products = computed(() => this.service.products());

  readonly orderForm = signal<FormGroup | null>(null);

  // total is derived reactively from the form
  readonly total = computed(() => {
    const form = this.orderForm();
    if (!form) return 0;

    const items = (form.get('products') as FormArray)?.value || [];
    return items.reduce(
      (sum: number, i: any) => sum + (i.qty || 0) * (i.price || 0),
      0
    );
  });

  constructor() {
    this.initOrder();
  }

  private initOrder() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate([ERoutes.PRIVATE_ORDERS]);
      return;
    }

    const id = +idParam;
    const order = this.service.orders().find((o) => o.id === id);

    if (!order) {
      this.router.navigate([ERoutes.PRIVATE_ORDERS]);
      return;
    }

    this.service.selectOrder(order);
    this.buildForm(order);
  }

  private buildForm(order: Order): void {
    const form = this.fb.group({
      id: [order.id],
      customerName: [order.customerName, Validators.required],
      status: [order.status, Validators.required],
      products: this.fb.array(
        order.products.map((i) => this.createItemGroup(i))
      ),
      createdAt: [order.createdAt],
    });

    // subscribe safely to changes
    form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    this.orderForm.set(form);
  }

  private createItemGroup(item?: any): FormGroup {
    return this.fb.group({
      productItem: [item?.productItem || '', Validators.required],
      productId: [item?.productId || '', Validators.required],
      qty: [item?.qty || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || 0, [Validators.required, Validators.min(0)]],
    });
  }

  get productsFormArray(): FormArray {
    return this.orderForm()?.get('products') as FormArray;
  }

  addItem(): void {
    this.productsFormArray.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    this.productsFormArray.removeAt(index);
  }

  onProductChange(selectedProduct: any, index: number): void {
    // use microtask to avoid ExpressionChangedAfterItHasBeenCheckedError
    queueMicrotask(() => {
      const group = this.productsFormArray.at(index) as FormGroup;
      group.patchValue({
        productId: selectedProduct.id,
        price: selectedProduct.price,
      });
    });
  }

  save(): void {
    const form = this.orderForm();
    if (!form || form.invalid) return;

    const updatedOrder: Order = {
      ...form.value,
      total: this.total(),
    };

    this.service.save(updatedOrder);
    this.router.navigate([ERoutes.PRIVATE_ORDERS]);
  }

  delete(): void {
    const id = this.orderForm()?.get('id')?.value;
    if (id) {
      this.service.remove(id);
    }
    this.router.navigate([ERoutes.PRIVATE_ORDERS]);
  }

  cancel(): void {
    this.router.navigate([ERoutes.PRIVATE_ORDERS]);
  }
}
