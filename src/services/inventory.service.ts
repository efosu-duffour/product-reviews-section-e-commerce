import { Collection } from "./collections.service";
import { ProductID } from "./products.service";

export type SKU = string;
export type ProductColor = string;
export type Size = string | number | null;
export type Stock = number;
export type Price = number;
export type Discount = number | null;
export type DiscountPerct = number | null;
export type ProductSold = number;

export type Inventory = {
  product_id: ProductID;
  sku: SKU;
  color: ProductColor;
  size: Size;
  sale_price: Price;
  list_price: Price;
  discount: Discount;
  discount_percentage: DiscountPerct;
  sold: ProductSold;
  stock: Stock;
};

const SESSIONNAME = "sn-inventories";
export class InventoryService {
  createdAt?: number;
  private _inventories?: Inventory[];
  private _INVENTORIESAPI = import.meta.env.BASE_URL + "data/inventory.json";

  constructor() {
    if (InventoryService._INSTANCE) return InventoryService._INSTANCE;
    else {
      this.createdAt = Date.now();
      InventoryService._INSTANCE = this;
    }
  }

  async init(): Promise<Inventory[]> {
    // Fetches the inventories from server or cache
    if (this._inventories) return this._inventories;
    let inventories: Inventory[] = [];

    const cachedInvetories = sessionStorage.getItem(SESSIONNAME);
    if (cachedInvetories && cachedInvetories.length !== 0) {
      inventories = JSON.parse(cachedInvetories);
    } else {
      inventories = await this._fetchInventories();
      sessionStorage.setItem(SESSIONNAME, JSON.stringify(inventories));
    }

    return (this._inventories = inventories);
  }

  private async _fetchInventories(): Promise<Inventory[]> {
    // Fetches inventories json from cache if not fetch from server, cache and store it in the local variable
    let fetchedInventories: Inventory[] = [];
    try {
      const response = await fetch(this._INVENTORIESAPI);
      const json: Inventory[] = await response.json();
      fetchedInventories = json;
    } catch (err: unknown) {
      console.warn(err);
    }

    return fetchedInventories;
  }

  get inventories(): Inventory[] {
    return this._inventories ?? [];
  }

  static getInventoriesByID(
    inventories: Inventory[],
    id: ProductID
  ): Inventory[] {
    // Get the available inventories of the specified product ID
    return inventories.filter((inventory) => inventory.product_id === id);
  }

  getInventoriesByID(id: ProductID): Inventory[] {
    // Get the available inventories of the specified product ID
    return InventoryService.getInventoriesByID(this.inventories, id);
  }

  static getInventoriesByColor(
    inventories: Inventory[],
    color: ProductColor
  ): Inventory[] {
    // Get the inventories according to the color
    return inventories.filter((inventory) => inventory.color === color);
  }

  getInventoriesByColor(color: ProductID): Inventory[] {
    // Get the inventories according to the color
    return InventoryService.getInventoriesByColor(
      this._inventories ?? [],
      color
    );
  }

  static getSizes(inventories: Inventory[]): Size[] {
    // Get the available sizes of the inventory
    const result: Set<Size> = new Set();
    for (let i = 0; i < inventories.length; i++) {
      const size = inventories[i].size;
      if (size === null || result.has(size)) continue;

      result.add(size);
    }
    return [...result];
  }

  getSizes(): Size[] {
    // Get the available sizes of the inventory
    return InventoryService.getSizes(this.inventories);
  }

  static getSizesByColor(
    inventories: Inventory[],
    color: ProductColor
  ): Size[] {
    // Get the sizes of the specified color
    const availableinventories = InventoryService.getInventoriesByColor(
      inventories,
      color
    );
    const sizes = InventoryService.getSizes(availableinventories);
    return sizes;
  }

  getSizesByColor(color: ProductColor): Size[] {
    // Get the sizes of the specified color
    return InventoryService.getSizesByColor(this._inventories ?? [], color);
  }

  static getColorsByID(
    inventories: Inventory[],
    product_id: ProductID
  ): ProductColor[] {
    // Get the distinct colors of the product id
    const colors: Set<ProductColor> = new Set();

    for (let i = 0; i < inventories.length; i++) {
      const product = inventories[i];
      if (product.product_id !== product_id) continue;

      colors.add(product.color);
    }
    return [...colors];
  }

  getColorsByID(product_id: ProductID): ProductColor[] {
    // Get the diticnt colors of the product id
    return InventoryService.getColorsByID(this.inventories, product_id);
  }

  static getSalePriceByID(
    inventories: Inventory[],
    product_id: ProductID
  ): Price {
    // Get the first sale price by the product id

    let price: Price = 0;
    for (let i = 0; i < inventories.length; i++) {
      const product = inventories[i];
      if (product.product_id !== product_id) continue;
      else {
        price = product.sale_price;
        break;
      }
    }
    return price;
  }

  getSalePriceByID(product_id: ProductID): Price {
    // Get the first sale price by the product id
    return InventoryService.getSalePriceByID(this.inventories, product_id);
  }

  static getListPriceByID(
    inventories: Inventory[],
    product_id: ProductID
  ): Price {
    // Get the first list price by the product id
    let price: Price = 0;
    for (let i = 0; i < inventories.length; i++) {
      const product = inventories[i];
      if (product.product_id !== product_id) continue;
      else {
        price = product.list_price;
        break;
      }
    }
    return price;
  }

  getListPriceByID(product_id: ProductID): Price {
    // Get the first list price by the product id

    return InventoryService.getListPriceByID(this.inventories, product_id);
  }

  static getAllColors(inventories: Inventory[]): ProductColor[] {
    // Get the available colors in the inventory
    const colors = new Set<ProductColor>();
    for (let i = 0; i < inventories.length; i++) {
      if (colors.has(inventories[i].color)) continue;
      colors.add(inventories[i].color);
    }

    return [...colors];
  }

  getAllColors(): ProductColor[] {
    // Get the available colors in the inventory

    return InventoryService.getAllColors(this.inventories);
  }

  static getIDsByColor(
    inventories: Inventory[],
    color: ProductColor
  ): ProductID[] {
    // Get the available ids by the specified color
    const productIDs = new Set<ProductID>();
    for (let i = 0; i < inventories.length; i++) {
      if (color !== inventories[i].color) continue;

      productIDs.add(inventories[i].product_id);
    }
    return [...productIDs];
  }

  getIDsByColor(color: ProductColor): ProductID[] {
    return InventoryService.getIDsByColor(this.inventories, color);
  }

  static getLowestPriceByID(
    inventories: Inventory[],
    productID: ProductID
  ): number {
    // Get the least price of the specified product

    return Math.min(
      ...inventories
        .filter((inventory) => inventory.product_id === productID)
        .map((filteredInventory) => filteredInventory.sale_price)
    );
  }

  getLowestPriceByID(productID: ProductID): number {
    return InventoryService.getLowestPriceByID(this.inventories, productID);
  }

  static getHighestPriceByID(
    inventories: Inventory[],
    productID: ProductID
  ): number {
    // Get the least price of the specified product

    return Math.max(
      ...inventories
        .filter((inventory) => inventory.product_id === productID)
        .map((filteredInventory) => filteredInventory.sale_price)
    );
  }

  getHighestPriceByID(productID: ProductID): number {
    return InventoryService.getHighestPriceByID(this.inventories, productID);
  }

  private static _INSTANCE: InventoryService | null = null;
}
