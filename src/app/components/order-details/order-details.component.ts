import { MatDividerModule } from '@angular/material/divider';
import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  Signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';

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
  private fb = inject(FormBuilder);
  private service = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly statuses = STATUSES;
  readonly selectedOrder = computed(() => this.service.selectedOrder());
  readonly products = computed(() => this.service.products());

  readonly orderForm = signal<FormGroup | null>(null);

  private formValue!: Signal<any>;

  readonly total = computed(() => {
    const val = this.formValue ? this.formValue() : this.orderForm()?.value;
    const items = (val?.products ?? []) as Array<{
      qty?: number;
      price?: number;
    }>;
    return items.reduce(
      (sum, i) => sum + (Number(i.qty) || 0) * (Number(i.price) || 0),
      0
    );
  });

  constructor() {
    this.initOrder();
  }

  private initOrder(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate([ERoutes.PRIVATE_ORDERS]);
      return;
    }

    const id = +idParam;
    const order = this.service
      .orders()
      .find((o) => String(o.id) === String(id));

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
    });
    this.orderForm.set(form);

    this.formValue = toSignal(form.valueChanges.pipe(startWith(form.value)), {
      initialValue: form.value,
    });
  }

  private createItemGroup(item?: any): FormGroup {
    const productObj = item?.productId
      ? this.service.products().find((p) => p.id === item.productId)
      : null;

    return this.fb.group({
      productItem: [item?.productItem || '', Validators.required],
      productId: [item?.productId || '', Validators.required],
      qty: [item?.qty || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || 0, [Validators.required, Validators.min(0)]],
    });
  }

  compareProducts = (a: any, b: any): boolean =>
    a && b ? a.id === b.id : a === b;

  get productsFormArray(): FormArray {
    return this.orderForm()?.get('products') as FormArray;
  }

  addItem(): void {
    this.productsFormArray.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    this.productsFormArray.removeAt(index);
  }

  onProductChange(
    selectedProduct: { id: number; price: number },
    index: number
  ): void {
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
      updatedAt: new Date().toISOString(),
    };

    this.service.save(updatedOrder);
    this.router.navigate([ERoutes.PRIVATE_ORDERS]);
  }

  delete(): void {
    const id = this.orderForm()?.get('id')?.value;
    if (id) this.service.remove(id);
    this.router.navigate([ERoutes.PRIVATE_ORDERS]);
  }

  cancel(): void {
    this.router.navigate([ERoutes.PRIVATE_ORDERS]);
  }
}
