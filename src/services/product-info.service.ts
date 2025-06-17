import { Description, ProductID } from "./products.service";

export type ProductTitle = string;
export type ProductInfo = {
    product_id: ProductID;
    title: ProductTitle;
    description: Description[];
}

const SESSIONNAME = "sn-product-info";
export class ProductInfoService {
createdAt?: number;
  private _product_infos?: ProductInfo[];
  private _PRODUCTINFOSAPI = import.meta.env.BASE_URL + "data/product-info.json";

  get product_info(): ProductInfo[] {
    return this._product_infos ?? [];
  }

  constructor() {
    if (ProductInfoService._INSTANCE) return ProductInfoService._INSTANCE;
    else {
      this.createdAt = Date.now();
      ProductInfoService._INSTANCE = this;
    }
  }

  private static _INSTANCE: ProductInfoService | null = null;

  async init(): Promise<ProductInfo[]> {
    // Fetches the product_info from server or cache
    if (this._product_infos) return this._product_infos;
    let product_info: ProductInfo[] = [];

    const cachedProductInfos = sessionStorage.getItem(SESSIONNAME);
    if (cachedProductInfos && cachedProductInfos.length !== 0) {
      product_info = JSON.parse(cachedProductInfos);
    } else {
      product_info = await this._fetchProductInfos();
      sessionStorage.setItem(SESSIONNAME, JSON.stringify(product_info));
    }

    return (this._product_infos = product_info);
  }

  private async _fetchProductInfos(): Promise<ProductInfo[]> {
    // Fetches product_info json from cache if not fetch from server, cache and store it in the local variable
    let fetchedProductInfos: ProductInfo[] = [];
    try {
      const response = await fetch(this._PRODUCTINFOSAPI);
      const json: ProductInfo[] = await response.json();
      fetchedProductInfos = json;
    } catch (err: unknown) {
      console.warn(err);
    }

    return fetchedProductInfos;
  }

  static getProductInfo(productInfos: ProductInfo[], productID: ProductID): ProductInfo[] {
    return productInfos.filter(productInfo => productInfo.product_id === productID);
  }

}