declare module "clsx" {
  export type ClassValue = string | number | null | boolean | undefined | ClassValue[] | { [key: string]: unknown };
  export function clsx(...inputs: ClassValue[]): string;
  export default clsx;
}

declare module "tailwind-merge" {
  export function twMerge(...classLists: Array<string | undefined | null | false>): string;
}
