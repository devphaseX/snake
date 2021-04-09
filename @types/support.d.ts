interface Array<T> {
  fill<A>(this: T, value: A, start?: number, end?: number): asserts this is A;
}
