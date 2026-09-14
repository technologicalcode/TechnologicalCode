export function soles(n: number): string {
  return `S/ ${n.toFixed(2)}`;
}

export function linePrice(base: number, variantPrice?: number): number {
  return variantPrice ?? base;
}
