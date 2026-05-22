export type DeepImmutable<T> = T
export type Brand<T, _B extends string> = T
export type SetOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type SetRequired<T, K extends keyof T> = T & Required<Pick<T, K>>
export type ValueOf<T> = T[keyof T]
export type Permutations<T> = T
