import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, Subject, merge, of } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { connect } from 'ngxtension/connect';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Order, OrderState, Product } from '../interfaces/order';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001';

  private readonly refreshOrders$ = new Subject<void>();
  private readonly refreshProducts$ = new Subject<void>();
  private readonly saveOrder$ = new Subject<Order>();
  private readonly deleteOrder$ = new Subject<number>();

  private readonly state = signal<OrderState>({
    orders: [],
    products: [],
    selectedOrder: null,
    loading: false,
    error: null,
    filters: { page: 1, pageSize: 10 },
  });

  readonly orders = computed(() => this.state().orders);
  readonly products = computed(() => this.state().products);
  readonly selectedOrder = computed(() => this.state().selectedOrder);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly filters = computed(() => this.state().filters);

  constructor() {
    const stateUpdates$ = merge(
      this.refreshOrders$.pipe(
        tap(() => this.setLoading(true)),
        switchMap(() => this.loadOrders()),
        map((orders) => ({ orders, loading: false, error: null })),
        catchError((err) =>
          of({ error: err.message, loading: false } as Partial<OrderState>)
        )
      ),
      this.refreshProducts$.pipe(
        switchMap(() => this.loadProducts()),
        map((products) => ({ products, error: null })),
        catchError((err) => of({ error: err.message } as Partial<OrderState>))
      ),
      this.saveOrder$.pipe(
        switchMap((order) => this.saveOrder(order)),
        map((saved) => ({
          orders: this.replaceOrder(this.state().orders, saved),
          selectedOrder: saved,
          error: null,
        })),
        catchError((err) => of({ error: err.message } as Partial<OrderState>))
      ),
      this.deleteOrder$.pipe(
        switchMap((id) => this.deleteOrder(id)),
        map((id) => ({
          orders: this.state().orders.filter((o) => o.id !== id),
          selectedOrder: null,
          error: null,
        })),
        catchError((err) => of({ error: err.message } as Partial<OrderState>))
      )
    );

    connect(this.state).with(stateUpdates$);

    this.refreshProducts$.next();
    this.refreshOrders$.next();
  }

  private loadProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  private loadOrders(): Observable<Order[]> {
    const { page, pageSize, client, status, sort } = this.state().filters;

    let params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', pageSize.toString())
      .set('_order', 'desc');

    if (client) params = params.set('client_like', client);
    if (status) params = params.set('status', status);
    if (sort === 'date') params = params.set('_sort', 'createdAt');
    if (sort === 'total') params = params.set('_sort', 'total');

    return this.http.get<Order[]>(`${this.baseUrl}/orders`, { params });
  }

  private saveOrder(order: Order): Observable<Order> {
    const existing = this.state().orders.find((o) => o.id === order.id);

    if (existing) {
      this.state.update((s) => ({
        ...s,
        orders: s.orders.map((o) => (o.id === order.id ? order : o)),
      }));

      return this.http
        .put<Order>(`${this.baseUrl}/orders/${order.id}`, order)
        .pipe(
          catchError((err) => {
            this.state.update((s) => ({
              ...s,
              orders: s.orders.map((o) => (o.id === order.id ? existing : o)),
            }));
            throw err;
          })
        );
    } else {
      return this.http.post<Order>(`${this.baseUrl}/orders`, order);
    }
  }

  private deleteOrder(id: number): Observable<number> {
    const previousOrders = this.state().orders;

    this.state.update((s) => ({
      ...s,
      orders: s.orders.filter((o) => o.id !== id),
    }));

    return this.http.delete(`${this.baseUrl}/orders/${id}`).pipe(
      map(() => id),
      catchError((err) => {
        this.state.update((s) => ({ ...s, orders: previousOrders }));
        throw err;
      })
    );
  }

  private replaceOrder(orders: Order[], updated: Order): Order[] {
    const index = orders.findIndex((o) => o.id === updated.id);
    if (index === -1) return [...orders, updated];
    const next = [...orders];
    next[index] = updated;
    return next;
  }

  private setLoading(isLoading: boolean) {
    this.state.update((s) => ({ ...s, loading: isLoading }));
  }

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
