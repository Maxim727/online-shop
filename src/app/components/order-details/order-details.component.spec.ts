import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderDetailsComponent } from './order-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ProductService } from '../../shared/data-access/product.service';
import { ERoutes } from 'src/app/routing/routes.constants';
import { Order } from 'src/app/shared/interfaces/order';
import { ReactiveFormsModule } from '@angular/forms';
import { DestroyRef } from '@angular/core';

// Mock Order
const mockOrder: Order = {
  id: 1,
  customerName: 'John Doe',
  status: 'pending',
  createdAt: new Date(),
  products: [
    { productItem: 'Item 1', productId: 1, qty: 2, price: 50 },
    { productItem: 'Item 2', productId: 2, qty: 1, price: 100 },
  ],
};

// Mock ProductService
class MockProductService {
  private selected = mockOrder;
  selectOrder(order: Order) {}
  save(order: Order) {}
  remove(id: number) {}
  selectedOrder = () => this.selected;
  orders = () => [mockOrder];
  products = () => [
    { id: 1, title: 'Item 1', price: 50 },
    { id: 2, title: 'Item 2', price: 100 },
  ];
}

// Mock ActivatedRoute
const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (key: string) => '1',
    },
  },
};

// Mock Router
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

describe('OrderDetailsComponent', () => {
  let component: OrderDetailsComponent;
  let fixture: ComponentFixture<OrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailsComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useClass: MockProductService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: DestroyRef, useValue: { onDestroy: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should build form correctly when valid order is found', () => {
    const form = component.orderForm();
    expect(form).toBeTruthy();
    expect(form?.get('customerName')?.value).toBe('John Doe');
    expect(component.productsFormArray.length).toBe(2);
  });

  it('should add a new product item to the form array', () => {
    const initialLength = component.productsFormArray.length;
    component.addItem();
    expect(component.productsFormArray.length).toBe(initialLength + 1);
  });

  it('should correctly compute total from product list', () => {
    // total = (2 x 50) + (1 x 100) = 200
    expect(component.total()).toBe(200);
  });
});
