export interface Product {
  id: number;
  name: string;
  price: number;
  addToCartSelector: string;
  removeSelector: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 4,
    name: 'Sauce Labs Backpack',
    price: 29.99,
    addToCartSelector: 'add-to-cart-sauce-labs-backpack',
    removeSelector:    'remove-sauce-labs-backpack',
  },
  {
    id: 0,
    name: 'Sauce Labs Bike Light',
    price: 9.99,
    addToCartSelector: 'add-to-cart-sauce-labs-bike-light',
    removeSelector:    'remove-sauce-labs-bike-light',
  },
  {
    id: 1,
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
    addToCartSelector: 'add-to-cart-sauce-labs-bolt-t-shirt',
    removeSelector:    'remove-sauce-labs-bolt-t-shirt',
  },
  {
    id: 5,
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
    addToCartSelector: 'add-to-cart-sauce-labs-fleece-jacket',
    removeSelector:    'remove-sauce-labs-fleece-jacket',
  },
  {
    id: 2,
    name: 'Sauce Labs Onesie',
    price: 7.99,
    addToCartSelector: 'add-to-cart-sauce-labs-onesie',
    removeSelector:    'remove-sauce-labs-onesie',
  },
  {
    id: 3,
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
    addToCartSelector: 'add-to-cart-test.allthethings()-t-shirt-(red)',
    removeSelector:    'remove-test.allthethings()-t-shirt-(red)',
  },
];

export const PRODUCT_NAMES_AZ = PRODUCTS.map(p => p.name).sort((a, b) =>
  a.localeCompare(b)
);

export const PRODUCT_NAMES_ZA = [...PRODUCT_NAMES_AZ].reverse();

export const PRICES_LOW_HIGH = PRODUCTS.map(p => p.price).sort((a, b) => a - b);

export const PRICES_HIGH_LOW = [...PRICES_LOW_HIGH].reverse();
