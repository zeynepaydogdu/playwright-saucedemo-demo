import { expect, test, type Page } from '@playwright/test';

const baseUrl = process.env.SAUCEDEMO_BASE_URL ?? 'https://www.saucedemo.com/';
const username = 'standard_user';
const password = 'secret_sauce';

const inventoryNames = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)',
];

async function login(page: Page): Promise<void> {
  await page.goto(baseUrl);
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/\/inventory\.html$/);
}

async function openCheckoutWithBikeLight(page: Page): Promise<void> {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="checkout"]').click();
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
}

async function fillCheckoutInformation(
  page: Page,
  firstName: string,
  lastName: string,
  postalCode: string,
): Promise<void> {
  await page.locator('[data-test="firstName"]').fill(firstName);
  await page.locator('[data-test="lastName"]').fill(lastName);
  await page.locator('[data-test="postalCode"]').fill(postalCode);
}

test('AUTH-01: standard user can log in', async ({ page }) => {
  await login(page);
  await expect(page.getByText('Products', { exact: true })).toBeVisible();
  await expect(page.locator('[data-test="inventory-item-name"]')).toHaveCount(6);
});

test('AUTH-02: empty login shows the username validation error', async ({ page }) => {
  await page.goto(baseUrl);
  await page.locator('[data-test="login-button"]').click();
  await expect(page.getByRole('alert')).toHaveText('Epic sadface: Username is required');
  await expect(page).toHaveURL(baseUrl);
});

test('AUTH-03: missing password shows the password validation error', async ({ page }) => {
  await page.goto(baseUrl);
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="login-button"]').click();
  await expect(page.getByRole('alert')).toHaveText('Epic sadface: Password is required');
  await expect(page).toHaveURL(baseUrl);
});

test('AUTH-04: incorrect password is rejected', async ({ page }) => {
  await page.goto(baseUrl);
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill('wrong_password');
  await page.locator('[data-test="login-button"]').click();
  await expect(page.getByRole('alert')).toHaveText(
    'Epic sadface: Username and password do not match any user in this service',
  );
  await expect(page).toHaveURL(baseUrl);
});

test('AUTH-05: locked user is rejected with a locked-account message', async ({ page }) => {
  await page.goto(baseUrl);
  await page.locator('[data-test="username"]').fill('locked_out_user');
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();
  await expect(page.getByRole('alert')).toHaveText(
    'Epic sadface: Sorry, this user has been locked out.',
  );
  await expect(page).toHaveURL(baseUrl);
});

test('SORT-01: products sort by name ascending', async ({ page }) => {
  await login(page);
  const sort = page.getByRole('combobox', { name: 'Sort products' });
  const names = page.locator('[data-test="inventory-item-name"]');

  await sort.selectOption({ label: 'Name (A to Z)' });
  await expect(names).toHaveText(inventoryNames);
});

test('SORT-02: products sort by name descending', async ({ page }) => {
  await login(page);
  const sort = page.getByRole('combobox', { name: 'Sort products' });
  const names = page.locator('[data-test="inventory-item-name"]');

  await sort.selectOption({ label: 'Name (Z to A)' });
  await expect(names).toHaveText([...inventoryNames].reverse());
});

test('SORT-03: products sort by price ascending, including equal prices', async ({ page }) => {
  await login(page);
  const sort = page.getByRole('combobox', { name: 'Sort products' });
  const prices = page.locator('[data-test="inventory-item-price"]');

  await sort.selectOption({ label: 'Price (low to high)' });
  await expect(prices).toHaveText(['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99']);
});

test('SORT-04: products sort by price descending, including equal prices', async ({ page }) => {
  await login(page);
  const sort = page.getByRole('combobox', { name: 'Sort products' });
  const prices = page.locator('[data-test="inventory-item-price"]');

  await sort.selectOption({ label: 'Price (high to low)' });
  await expect(prices).toHaveText(['$49.99', '$29.99', '$15.99', '$15.99', '$9.99', '$7.99']);
});

test('SORT-05: changing sort preserves the same product set', async ({ page }) => {
  await login(page);
  const sort = page.getByRole('combobox', { name: 'Sort products' });
  const names = page.locator('[data-test="inventory-item-name"]');

  for (const label of [
    'Name (Z to A)',
    'Price (low to high)',
    'Price (high to low)',
    'Name (A to Z)',
  ]) {
    await sort.selectOption({ label });
    await expect(names).toHaveCount(inventoryNames.length);
    await expect
      .poll(async () => (await names.allTextContents()).sort())
      .toEqual([...inventoryNames].sort());
  }
});

test('CART-01: adding two products updates the cart badge and contents', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page.locator('.cart_item')).toHaveCount(2);
  await expect(page.locator('.cart_item')).toContainText([
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
  ]);
});

test('CART-02: removing Backpack leaves Bike Light and updates the badge', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  await expect(page.locator('.cart_item')).toHaveCount(1);
  await expect(page.locator('.cart_item')).toContainText(['Sauce Labs Bike Light']);
  await expect(page.getByText('Sauce Labs Backpack', { exact: true })).toHaveCount(0);
});

test('CART-04: an empty cart cannot proceed to checkout', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page.locator('.cart_item')).toHaveCount(0);

  const checkout = page.locator('[data-test="checkout"]');
  if (await checkout.isDisabled()) {
    await expect(checkout).toBeDisabled();
    return;
  }

  await checkout.click();
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(page.getByRole('alert')).toBeVisible();
});

test('CART-05: an empty cart cannot reach the order overview', async ({ page }) => {
  await login(page);
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page.locator('.cart_item')).toHaveCount(0);

  const checkout = page.locator('[data-test="checkout"]');
  if (await checkout.isDisabled()) {
    await expect(checkout).toBeDisabled();
    return;
  }

  await checkout.click();
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  await fillCheckoutInformation(page, 'A', 'B', '1');
  await page.locator('[data-test="continue"]').click();
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  await expect(page.getByRole('alert')).toBeVisible();
});

test('CHECK-01: empty checkout information is rejected', async ({ page }) => {
  await openCheckoutWithBikeLight(page);
  await page.locator('[data-test="continue"]').click();
  await expect(page.getByRole('alert')).toHaveText('Error: First Name is required');
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});

test('CHECK-02: missing last name is rejected', async ({ page }) => {
  await openCheckoutWithBikeLight(page);
  await page.locator('[data-test="firstName"]').fill('Ada');
  await page.locator('[data-test="continue"]').click();
  await expect(page.getByRole('alert')).toHaveText('Error: Last Name is required');
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});

test('CHECK-03: missing postal code is rejected', async ({ page }) => {
  await openCheckoutWithBikeLight(page);
  await page.locator('[data-test="firstName"]').fill('Ada');
  await page.locator('[data-test="lastName"]').fill('Lovelace');
  await page.locator('[data-test="continue"]').click();
  await expect(page.getByRole('alert')).toHaveText('Error: Postal Code is required');
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
});

test('CHECK-04: a non-empty one-character postal code is accepted', async ({ page }) => {
  await openCheckoutWithBikeLight(page);
  await fillCheckoutInformation(page, 'Ada', 'Lovelace', '1');
  await page.locator('[data-test="continue"]').click();

  await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  await expect(page.locator('.cart_item')).toContainText(['Sauce Labs Bike Light']);
});

test('CHECK-05: valid checkout shows totals and completes the order', async ({ page }) => {
  await openCheckoutWithBikeLight(page);
  await fillCheckoutInformation(page, 'Ada', 'Lovelace', '1');
  await page.locator('[data-test="continue"]').click();

  await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
  await expect(page.getByText('Item total: $9.99', { exact: true })).toBeVisible();
  await expect(page.getByText('Tax: $0.80', { exact: true })).toBeVisible();
  await expect(page.getByText('Total: $10.79', { exact: true })).toBeVisible();

  await page.locator('[data-test="finish"]').click();
  await expect(page).toHaveURL(/\/checkout-complete\.html$/);
  await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cart, empty' })).toBeVisible();
});
