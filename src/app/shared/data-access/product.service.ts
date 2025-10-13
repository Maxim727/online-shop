import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, Subject, merge, of, defer, switchMap, tap, catchError, map } from 'rxjs';
import { connect } from 'ngxtension/connect';
import { HttpClient } from '@angular/common/http';
import { Order, OrderState, Product } from '../interfaces/order';


@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3001'; // json-server endpoint

  // --- Reactive sources ---
  refreshOrders$ = new Subject<void>();
  refreshProducts$ = new Subject<void>();
  saveOrder$ = new Subject<Order>();
  deleteOrder$ = new Subject<number>();

  // --- Initial state ---
  private state = signal<OrderState>({
    orders: [],
    products: [],
    selectedOrder: null,
    loading: false,
    error: null,
    filters: { page: 1, pageSize: 10 },
  });

  // --- Selectors ---
  orders = computed(() => this.state().orders);
  products = computed(() => this.state().products);
  selectedOrder = computed(() => this.state().selectedOrder);
  loading = computed(() => this.state().loading);
  filters = computed(() => this.state().filters);
  error = computed(() => this.state().error);

  constructor() {
    const nextState$ = merge(
      this.refreshOrders$.pipe(
        switchMap(() => this.loadOrders()),
        map((orders) => ({ orders, loading: false, error: null })),
        catchError((err) => of({ error: err.message, loading: false }))
      ),
      this.refreshProducts$.pipe(
        switchMap(() => this.loadProducts()),
        map((products) => ({ products, error: null })),
        catchError((err) => of({ error: err.message }))
      ),
      this.saveOrder$.pipe(
        switchMap((order) => this.saveOrder(order)),
        map((saved) => ({
          orders: this.replaceOrder(this.state().orders, saved),
          selectedOrder: saved,
          error: null,
        })),
        catchError((err) => of({ error: err.message }))
      ),
      this.deleteOrder$.pipe(
        switchMap((id) => this.deleteOrder(id)),
        map((id) => ({
          orders: this.state().orders.filter((o) => o.id !== id),
          selectedOrder: null,
          error: null,
        })),
        catchError((err) => of({ error: err.message }))
      )
    );

    connect(this.state).with(nextState$);

    // Load initial data
    this.refreshProducts$.next();
    this.refreshOrders$.next();
  }

  // --- API methods ---
  private loadProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  private loadOrders(): Observable<Order[]> {
    const { page, pageSize, client, status, sort } = this.state().filters;
    const params = new URLSearchParams();
    params.set('_page', page.toString());
    params.set('_limit', pageSize.toString());
    if (client) params.set('client_like', client);
    if (status) params.set('status', status);
    if (sort === 'date') params.set('_sort', 'createdAt');
    if (sort === 'total') params.set('_sort', 'total');
    params.set('_order', 'desc');
    return this.http.get<Order[]>(`${this.baseUrl}/orders?${params.toString()}`);
  }

  private saveOrder(order: Order): Observable<Order> {
    // Optimistic update
    const existing = this.state().orders.find((o) => o.id === order.id);
    if (existing) {
      this.state.update((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === order.id ? order : o)),
      }));
      return this.http.put<Order>(`${this.baseUrl}/orders/${order.id}`, order).pipe(
        catchError((err) => {
          // rollback
          this.state.update((s) => ({
            ...s,
            orders: s.orders.map((o) => (o.id === order.id ? existing : o)),
          }));
          throw err;
        })
      );
    } else {
      // new order
      return this.http.post<Order>(`${this.baseUrl}/orders`, order);
    }
  }

  private deleteOrder(id: number): Observable<number> {
    // Optimistic removal
    const oldOrders = this.state().orders;
    this.state.update((s) => ({
      ...s,
      orders: s.orders.filter((o) => o.id !== id),
    }));
    return this.http.delete(`${this.baseUrl}/orders/${id}`).pipe(
      map(() => id),
      catchError((err) => {
        // rollback
        this.state.update((s) => ({ ...s, orders: oldOrders }));
        throw err;
      })
    );
  }

  // --- Helper for replacing updated order ---
  private replaceOrder(orders: Order[], updated: Order): Order[] {
    const index = orders.findIndex((o) => o.id === updated.id);
    if (index === -1) return [...orders, updated];
    const newOrders = [...orders];
    newOrders[index] = updated;
    return newOrders;
  }

  // --- UI interaction helpers ---
  setFilter(partial: Partial<OrderState['filters']>) {
    this.state.update((s) => ({
      ...s,
      filters: { ...s.filters, ...partial },
    }));
    this.refreshOrders$.next();
  }

  selectOrder(order: Order | null) {
    this.state.update((s) => ({ ...s, selectedOrder: order }));
  }

  save(order: Order) {
    this.saveOrder$.next(order);
  }

  remove(id: number) {
    this.deleteOrder$.next(id);
  }
}
