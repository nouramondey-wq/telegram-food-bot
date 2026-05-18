export declare class OrderService {
    private db;
    getCustomerOrders(customerId: string, limit?: number): Promise<any[]>;
    getOrder(orderId: string): Promise<any | null>;
    getOrderByNumber(orderNumber: number): Promise<any | null>;
    cancelOrder(orderId: string, customerId: string): Promise<boolean>;
    /**
     * Reorder: returns a pre-built cart structure from a previous order
     */
    prepareReorder(orderId: string, customerId: string): Promise<ReorderPrep | null>;
    formatOrderForBot(order: any): string;
    formatOrdersList(orders: any[]): string;
}
interface ReorderPrep {
    originalOrderNumber: number;
    items: ReorderItem[];
    unavailableItems: string[];
    allAvailable: boolean;
}
interface ReorderItem {
    menu_item_id: string;
    name_ar: string;
    quantity: number;
    unit_price: number;
    addons: Array<{
        name_ar: string;
        price: number;
    }>;
}
export {};
//# sourceMappingURL=order_service.d.ts.map