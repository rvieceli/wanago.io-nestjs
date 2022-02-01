export function excludeNullHandler(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(excludeNullHandler);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        excludeNullHandler(value),
      ]),
    );
  }

  if (value !== null) {
    return value;
  }
}
