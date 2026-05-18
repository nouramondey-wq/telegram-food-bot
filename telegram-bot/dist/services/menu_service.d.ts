interface MenuItem {
    id: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    price: number;
    image_url: string;
    is_available: boolean;
    category_name_ar: string;
}
interface Category {
    id: string;
    name_ar: string;
    sort_order: number;
}
export declare class MenuService {
    private db;
    getCategories(): Promise<Category[]>;
    getMenuItemsByCategory(categoryId?: string): Promise<MenuItem[]>;
    formatMenuForBot(): Promise<string>;
    getMenuItem(itemId: string): Promise<MenuItem | null>;
}
export {};
//# sourceMappingURL=menu_service.d.ts.map