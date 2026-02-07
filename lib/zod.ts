export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export type ZodType<T> = {
  parse: (input: unknown) => T;
  safeParse: (input: unknown) => SafeParseResult<T>;
  optional: () => ZodType<T | undefined>;
};

function createType<T>(parser: (input: unknown) => T): ZodType<T> {
  return {
    parse: parser,
    safeParse: (input: unknown) => {
      try {
        return { success: true, data: parser(input) };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    optional: () =>
      createType<T | undefined>((input) => {
        if (input === undefined) return undefined;
        return parser(input);
      }),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const z = {
  string: () =>
    createType<string>((input) => {
      if (typeof input !== "string") {
        throw new Error("Expected string");
      }
      return input;
    }),
  number: () =>
    createType<number>((input) => {
      if (typeof input !== "number" || Number.isNaN(input)) {
        throw new Error("Expected number");
      }
      return input;
    }),
  any: () => createType<unknown>((input) => input),
  enum: <T extends readonly string[]>(values: T) =>
    createType<T[number]>((input) => {
      if (typeof input !== "string" || !values.includes(input)) {
        throw new Error("Expected enum value");
      }
      return input as T[number];
    }),
  array: <T>(schema: ZodType<T>) =>
    createType<T[]>((input) => {
      if (!Array.isArray(input)) {
        throw new Error("Expected array");
      }
      return input.map((item) => schema.parse(item));
    }),
  tuple: <T extends [ZodType<unknown>, ...ZodType<unknown>[]]>(schemas: T) =>
    createType<{ [K in keyof T]: T[K] extends ZodType<infer U> ? U : never }>((input) => {
      if (!Array.isArray(input) || input.length !== schemas.length) {
        throw new Error("Expected tuple");
      }
      return input.map((item, index) => schemas[index].parse(item)) as {
        [K in keyof T]: T[K] extends ZodType<infer U> ? U : never;
      };
    }),
  object: <T extends Record<string, ZodType<unknown>>>(shape: T) =>
    createType<{ [K in keyof T]: T[K] extends ZodType<infer U> ? U : never }>((input) => {
      if (!isObject(input)) {
        throw new Error("Expected object");
      }
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(shape)) {
        const schema = shape[key];
        result[key] = schema.parse((input as Record<string, unknown>)[key]);
      }
      return result as { [K in keyof T]: T[K] extends ZodType<infer U> ? U : never };
    }),
};

export { z };
