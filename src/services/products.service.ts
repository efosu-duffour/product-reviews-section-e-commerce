import { C } from "vitest/dist/chunks/reporters.d.79o4mouw.js";
import { Inventory } from "./inventory.service";

export type Category = string;
export type ProductName = string;
export type ProductID = string;
export type Description = string;
export type Collection = string;
export type CreatedAt = string;

export type Product = {
  product_id: ProductID;
  name: ProductName;
  description: Description;
  category: Category;
  collection: Collection;
  created_at: CreatedAt;
};

const SESSIONNAME = "sn-products";
export class ProductsService {
  createdAt?: number;
  private _products?: Product[];
  private _PRODUCTSAPI = import.meta.env.BASE_URL + "data/products.json";

  get products(): Product[] {
    return this._products ?? [];
  }

  constructor() {
    if (ProductsService._INSTANCE) return ProductsService._INSTANCE;
    else {
      this.createdAt = Date.now();
      ProductsService._INSTANCE = this;
    }
  }

  private static _INSTANCE: ProductsService | null = null;

  async init(): Promise<Product[]> {
    // Fetches the products from server or cache
    if (this._products) return this._products;
    let products: Product[] = [];

    const cachedProducts = sessionStorage.getItem(SESSIONNAME);
    if (cachedProducts && cachedProducts.length !== 0) {
      products = JSON.parse(cachedProducts);
    } else {
      products = await this._fetchProducts();
      sessionStorage.setItem(SESSIONNAME, JSON.stringify(products));
    }

    return this._products = products;
  }

  private async _fetchProducts(): Promise<Product[]> {
    // Fetches products json from cache if not fetch from server, cache and store it in the local variable
    let fetchedProducts: Product[] = [];
    try {
      const response = await fetch(this._PRODUCTSAPI);
      const json: Product[] = await response.json();
      fetchedProducts = json;
    } catch (err: unknown) {
      console.warn(err);
    }

    return fetchedProducts;
  }

  static getIDsByCategory(
    products: Product[],
    category: Category
  ): ProductID[] {
    // Get the products ID with the specified Category
    const productIDs: ProductID[] = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (product.category !== category) continue;

      productIDs.push(product.product_id);
    }
    return productIDs;
  }

  getIDsByCategory(category: Category): ProductID[] {
    // Get the products ID with the specified Category
    return ProductsService.getIDsByCategory(this.products, category);
  }

  static getIDsByCollection(
    products: Product[],
    collection: Collection
  ): ProductID[] {
    // Get the products ID with the specified collection
    const productIDs: ProductID[] = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (product.collection !== collection) continue;

      productIDs.push(product.product_id);
    }
    return productIDs;
  }

  getIDsByCollection(collection: Collection): ProductID[] {
    // Get the products ID with the specified collection
    return ProductsService.getIDsByCollection(this.products, collection);
  }

  static getProductsByCreatedAt(
    products: Product[],
    predicate: (createdAt: CreatedAt) => boolean
  ): Product[] {
    // Get the product according to when they were created
    return products.filter((product) => predicate(product.created_at));
  }

  getProductsByCreatedAt(
    predicate: (createdAt: CreatedAt) => boolean
  ): Product[] {
    // Get the product according to when they were created
    return ProductsService.getProductsByCreatedAt(this.products, predicate);
  }

  static getIDsByCreatedAt(products: Product[], predicate: (createdAt: CreatedAt) => boolean): ProductID[] {
    // Get the product id satisfying the predicate
    const productIDs: ProductID[] = [];

    for (let i = 0; i < products.length; i++) {
      if (!predicate(products[i].created_at)) continue;
      productIDs.push(products[i].product_id);
    }
    return productIDs;
  }

  getIDsByCreatedAt(predicate: (createdAt: CreatedAt) => boolean): ProductID[] {
    // Get the product id satisfying the predicate
    return ProductsService.getIDsByCreatedAt(this.products, predicate)
  }

  static getProductsByCategory(
    products: Product[],
    category: Category
  ): Product[] {
    // Gets the products according to the specified category
    return products.filter((product) => product.category === category);
  }

  getProductsByCategory(category: Category): Product[] {
    return ProductsService.getProductsByCategory(this.products, category);
  }

  static getProductsByCollection(
    products: Product[],
    collection: Collection
  ): Product[] {
    // Gets the products according to the specified collection
    return products.filter((product) => product.collection === collection);
  }

  getProductsByCollection(collection: Collection): Product[] {
    return ProductsService.getProductsByCollection(this.products, collection);
  }

  static getNameByID(products: Product[], product_id: ProductID): ProductName {
    // Get the product name from the product id
    let name: ProductName = '';
    for (let i = 0; i < products.length; i++) {
      if (products[i].product_id !== product_id) continue;
      else {
        name = products[i].name;
        break;
      }
    }
    return name;
  }

  getNameByID(product_id: ProductID): ProductName {
    // Get the product name from the product id
    return ProductsService.getNameByID(this.products, product_id);
  }

  static getAllIDs(products: Product[]): ProductID[] {
    // Get all the available product IDs

    return products.map(product => product.product_id);
  }

  getAllIDs(): ProductID[] {
    // Get all the available product IDs

    return ProductsService.getAllIDs(this.products);
  }

  static getAllCollections(products: Product[]): Collection[] {
    // get all the collections available in the products
    const collections = new Set<Collection>();

    for (let i = 0; i < products.length; i++) {
      if (collections.has(products[i].collection)) continue;
      collections.add(products[i].collection);
    }

    return [...collections];
  }
  getAllCollections(): Collection[] {
    return ProductsService.getAllCollections(this.products);
  }

  static getAllCategories(products: Product[]): Category[] {
    // Get all categories available in the product
    const categories = new Set<Category>();

    for (let i = 0; i < products.length; i++) {
      if (categories.has(products[i].category)) continue;
      categories.add(products[i].category);
    }

    return [...categories];
  }

  getAllCategories(): Category[] {
    return ProductsService.getAllCategories(this.products);
  }
}
