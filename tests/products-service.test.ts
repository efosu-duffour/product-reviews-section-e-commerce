import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, beforeAll, describe, afterEach, it, expect } from "vitest";
import {
  CreatedAt,
  Product,
  ProductID,
  ProductName,
  ProductsService,
} from "../src/services/products.service";

const mockProducts: Product[] = [
  {
    product_id: "urban-drift-bucket-hat",
    name: "Urban Drift Bucket Hat",
    description:
      "Navigate the urban jungle with our Urban Drift Bucket Hat. It's not only trendy but also practical, offering shade from the hustle and bustle.",
    category: "unisex",
    collection: "urban",
    created_at: "2024-04-04",
  },
  {
    product_id: "tangerine-mini-tote",
    name: "Tangerine Mini Tote",
    description:
      "Carry a pop of color with our Tangerine Mini Tote. Compact and vibrant, it's the perfect accessory for the fashion-forward minimalist.",
    category: "women",
    collection: "fresh",
    created_at: "2024-04-03",
  },
  {
    product_id: "elemental-sneakers",
    name: "Elemental Sneakers",
    description:
      "Ground your steps in style with our Elemental Sneakers. Designed with the elements in mind, they bring a natural balance to your stride and your ensemble.",
    category: "unisex",
    collection: "fresh",
    created_at: "2024-03-25",
  },
  {
    product_id: "metro-hoodie",
    name: "Metro Hoodie",
    description:
      "The Metro Hoodie is your ticket to comfortable, laid-back fashion. Whether you're on the move or taking it easy, this hoodie has got you covered.",
    category: "unisex",
    collection: "urban",
    created_at: "2024-03-23",
  },
];

const productsInterceptor = http.get("/data/products.json", () => {
  return HttpResponse.json<Product[]>(mockProducts);
});

const productsMockServer = setupServer(productsInterceptor);

describe("Products Service", () => {
  beforeAll(() => {
    productsMockServer.listen({ onUnhandledRequest: "error" });
  });

  afterAll(() => {
    productsMockServer.close();
  });

  afterEach(() => {
    productsMockServer.resetHandlers();
  });

  it("should be a singleton", () => {
    const productsService_1 = new ProductsService();
    const productsService_2 = new ProductsService();
    expect(productsService_1).toBe(productsService_2);
    expect(productsService_1.createdAt).toEqual(productsService_2.createdAt);
  });

  it("should get all product ids", async () => {
    const productService = new ProductsService();
    await productService.init();
    const productIDs: ProductID[] = productService.getAllIDs();
    expect(productIDs).toEqual([
      "urban-drift-bucket-hat",
      "tangerine-mini-tote",
      "elemental-sneakers",
      "metro-hoodie",
    ])

  });

  it("should fetch the right inventories", async () => {
    const productsService = new ProductsService();
    let products: Product[] = productsService.products;
    expect(products).toEqual([]);

    await productsService.init();
    products = productsService.products;
    expect(products).toEqual(mockProducts);
  });

  it("should get the products according to the specified category", async () => {
    const productService = new ProductsService();
    await productService.init();

    const womenProducts = productService.getProductsByCategory("women");
    expect(womenProducts).toEqual([
      {
        product_id: "tangerine-mini-tote",
        name: "Tangerine Mini Tote",
        description:
          "Carry a pop of color with our Tangerine Mini Tote. Compact and vibrant, it's the perfect accessory for the fashion-forward minimalist.",
        category: "women",
        collection: "fresh",
        created_at: "2024-04-03",
      },
    ]);
  });

  it("should get the products according to the specified collection", async () => {
    const productService = new ProductsService();
    await productService.init();

    const urbanProducts = productService.getProductsByCollection("urban");
    expect(urbanProducts).toEqual([
      {
        product_id: "urban-drift-bucket-hat",
        name: "Urban Drift Bucket Hat",
        description:
          "Navigate the urban jungle with our Urban Drift Bucket Hat. It's not only trendy but also practical, offering shade from the hustle and bustle.",
        category: "unisex",
        collection: "urban",
        created_at: "2024-04-04",
      },
      {
        product_id: "metro-hoodie",
        name: "Metro Hoodie",
        description:
          "The Metro Hoodie is your ticket to comfortable, laid-back fashion. Whether you're on the move or taking it easy, this hoodie has got you covered.",
        category: "unisex",
        collection: "urban",
        created_at: "2024-03-23",
      },
    ]);
  });

  it("should get the products ID by the specified collection", async () => {
    const productService = new ProductsService();
    await productService.init();

    const urbanProductIDs = productService.getIDsByCollection("urban");
    expect(urbanProductIDs).toEqual(["urban-drift-bucket-hat", "metro-hoodie"]);
  });

  it("should get the products ID by the specified category", async () => {
    const productService = new ProductsService();
    await productService.init();

    const womenProductIDs = productService.getIDsByCategory("women");
    expect(womenProductIDs).toEqual(["tangerine-mini-tote"]);
  });

  it("should get the products by the specified date predicate", async () => {
    const productService = new ProductsService();
    await productService.init();

    const march_2024 = (createdAt: CreatedAt) => {
      const date = new Date(createdAt);
      return date.getMonth() === 2 && date.getFullYear() === 2024;
    };
    const march_2024Products =
      productService.getProductsByCreatedAt(march_2024);
    expect(march_2024Products).toEqual([
      {
        product_id: "elemental-sneakers",
        name: "Elemental Sneakers",
        description:
          "Ground your steps in style with our Elemental Sneakers. Designed with the elements in mind, they bring a natural balance to your stride and your ensemble.",
        category: "unisex",
        collection: "fresh",
        created_at: "2024-03-25",
      },
      {
        product_id: "metro-hoodie",
        name: "Metro Hoodie",
        description:
          "The Metro Hoodie is your ticket to comfortable, laid-back fashion. Whether you're on the move or taking it easy, this hoodie has got you covered.",
        category: "unisex",
        collection: "urban",
        created_at: "2024-03-23",
      },
    ]);
  });

  it("should get the product id of the specified time", async () => {
    const productService = new ProductsService();
    await productService.init();

    const march_2024 = (createdAt: CreatedAt) => {
      const date = new Date(createdAt);
      return date.getMonth() === 2 && date.getFullYear() === 2024;
    };
    const march_2024Products = productService.getIDsByCreatedAt(march_2024);
    expect(march_2024Products).toEqual(["elemental-sneakers", "metro-hoodie"]);
  });

  it("should get the product name of the product id", async () => {
    const productService = new ProductsService();
    await productService.init();

    const name: ProductName = productService.getNameByID("metro-hoodie");
    expect(name).toEqual("Metro Hoodie");
  });
});
