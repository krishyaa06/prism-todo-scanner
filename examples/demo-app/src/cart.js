export function total(items) {
  // OPTIMIZE: memoize, this runs on every render
  return items.reduce((s, i) => s + i.price * i.qty, 0); // TODO: apply coupons
}
/* BUG: negative quantities are accepted */
export const add = (cart, item) => [...cart, item];
