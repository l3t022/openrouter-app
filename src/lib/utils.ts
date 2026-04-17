export function formatPrice(priceStr: string): string {
  const price = parseFloat(priceStr) * 1_000_000;
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}`;
}

export function isFreeModel(model: { pricing: { prompt: string; completion: string } }): boolean {
  return (
    (model.pricing.prompt === '0' || model.pricing.prompt === '0.0') &&
    (model.pricing.completion === '0' || model.pricing.completion === '0.0')
  );
}

export function isVisionModel(model: { id: string; name: string; pricing?: { image?: string } }): boolean {
  const visionKeywords = ['vision', 'multimodal', 'vl', 'phi-3-vision'];
  return (
    !!model.pricing?.image ||
    visionKeywords.some(
      (kw) => model.id.toLowerCase().includes(kw) || model.name.toLowerCase().includes(kw)
    )
  );
}

export function isCodingModel(model: { id: string; name: string }): boolean {
  const codingKeywords = ['code', 'coder', 'script', 'programming', 'dev'];
  return codingKeywords.some(
    (kw) => model.id.toLowerCase().includes(kw) || model.name.toLowerCase().includes(kw)
  );
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

let idCounter = 0;

export function generateId(): number {
  return Date.now() + idCounter++;
}