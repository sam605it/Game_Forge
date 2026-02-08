type Issue = { path: Array<string | number>; message: string };

type SafeParseSuccess<T> = { success: true; data: T };
type SafeParseFailure = { success: false; error: { issues: Issue[] } };

type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseFailure;

type InferShape<T> = T extends Schema<infer U> ? U : never;
type OptionalKeys<T extends Record<string, Schema<any>>> = {
  [K in keyof T]: undefined extends InferShape<T[K]> ? K : never;
}[keyof T];
type RequiredKeys<T extends Record<string, Schema<any>>> = Exclude<keyof T, OptionalKeys<T>>;
type ObjectOutput<T extends Record<string, Schema<any>>> = {
  [K in RequiredKeys<T>]: InferShape<T[K]>;
} & {
  [K in OptionalKeys<T>]?: Exclude<InferShape<T[K]>, undefined>;
};

class Schema<T> {
  _output!: T;
  safeParse(_value: unknown): SafeParseResult<T> {
    return { success: true, data: _value as T };
  }
  optional() {
    return new OptionalSchema(this);
  }
}

class OptionalSchema<T> extends Schema<T | undefined> {
  constructor(private inner: Schema<T>) {
    super();
  }
  safeParse(value: unknown): SafeParseResult<T | undefined> {
    if (value === undefined) {
      return { success: true, data: undefined };
    }
    return this.inner.safeParse(value) as SafeParseResult<T | undefined>;
  }
}

class StringSchema extends Schema<string> {
  safeParse(value: unknown): SafeParseResult<string> {
    if (typeof value !== "string") {
      return { success: false, error: { issues: [{ path: [], message: "Expected string" }] } };
    }
    return { success: true, data: value };
  }
}

class NumberSchema extends Schema<number> {
  private minValue: number | null = null;
  private maxValue: number | null = null;

  min(value: number) {
    this.minValue = value;
    return this;
  }

  max(value: number) {
    this.maxValue = value;
    return this;
  }

  safeParse(value: unknown): SafeParseResult<number> {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return { success: false, error: { issues: [{ path: [], message: "Expected number" }] } };
    }
    if (this.minValue !== null && value < this.minValue) {
      return { success: false, error: { issues: [{ path: [], message: `Number must be >= ${this.minValue}` }] } };
    }
    if (this.maxValue !== null && value > this.maxValue) {
      return { success: false, error: { issues: [{ path: [], message: `Number must be <= ${this.maxValue}` }] } };
    }
    return { success: true, data: value };
  }
}

class EnumSchema<T extends string> extends Schema<T> {
  constructor(private values: readonly T[]) {
    super();
  }
  safeParse(value: unknown): SafeParseResult<T> {
    if (typeof value !== "string" || !this.values.includes(value as T)) {
      return { success: false, error: { issues: [{ path: [], message: "Expected enum value" }] } };
    }
    return { success: true, data: value as T };
  }
}

class ArraySchema<T> extends Schema<T[]> {
  private maxLength: number | null = null;
  constructor(private item: Schema<T>) {
    super();
  }
  max(value: number) {
    this.maxLength = value;
    return this;
  }
  safeParse(value: unknown): SafeParseResult<T[]> {
    if (!Array.isArray(value)) {
      return { success: false, error: { issues: [{ path: [], message: "Expected array" }] } };
    }
    if (this.maxLength !== null && value.length > this.maxLength) {
      return { success: false, error: { issues: [{ path: [], message: `Array must have <= ${this.maxLength} items` }] } };
    }
    const issues: Issue[] = [];
    const data: T[] = [];
    value.forEach((item, index) => {
      const parsed = this.item.safeParse(item);
      if ("error" in parsed) {
        parsed.error.issues.forEach((issue) => {
          issues.push({ path: [index, ...issue.path], message: issue.message });
        });
      } else {
        data.push(parsed.data);
      }
    });
    if (issues.length) {
      return { success: false, error: { issues } };
    }
    return { success: true, data };
  }
}

class TupleSchema<T extends unknown[]> extends Schema<T> {
  constructor(private items: { [K in keyof T]: Schema<T[K]> }) {
    super();
  }
  safeParse(value: unknown): SafeParseResult<T> {
    if (!Array.isArray(value) || value.length !== this.items.length) {
      return { success: false, error: { issues: [{ path: [], message: "Expected tuple" }] } };
    }
    const issues: Issue[] = [];
    const data = [] as unknown as T;
    this.items.forEach((schema, index) => {
      const parsed = schema.safeParse(value[index]);
      if ("error" in parsed) {
        parsed.error.issues.forEach((issue) => {
          issues.push({ path: [index, ...issue.path], message: issue.message });
        });
      } else {
        data[index] = parsed.data;
      }
    });
    if (issues.length) {
      return { success: false, error: { issues } };
    }
    return { success: true, data };
  }
}

class AnySchema extends Schema<any> {
  safeParse(value: unknown): SafeParseResult<any> {
    return { success: true, data: value };
  }
}

class ObjectSchema<T extends Record<string, Schema<any>>> extends Schema<ObjectOutput<T>> {
  private strictMode = false;
  constructor(private shape: T) {
    super();
  }
  strict() {
    this.strictMode = true;
    return this;
  }
  safeParse(value: unknown): SafeParseResult<ObjectOutput<T>> {
    if (typeof value !== "object" || value === null) {
      return { success: false, error: { issues: [{ path: [], message: "Expected object" }] } };
    }
    const record = value as Record<string, unknown>;
    const issues: Issue[] = [];
    const data: Record<string, unknown> = {};

    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      const parsed = schema.safeParse(record[key]);
      if ("error" in parsed) {
        parsed.error.issues.forEach((issue) => {
          issues.push({ path: [key, ...issue.path], message: issue.message });
        });
      } else {
        data[key] = parsed.data;
      }
    }

    if (this.strictMode) {
      for (const key of Object.keys(record)) {
        if (!(key in this.shape)) {
          issues.push({ path: [key], message: "Unknown key" });
        }
      }
    }

    if (issues.length) {
      return { success: false, error: { issues } };
    }
    return { success: true, data: data as ObjectOutput<T> };
  }
}

export const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  enum: <T extends readonly string[]>(values: T) => new EnumSchema<T[number]>(values),
  array: <T>(schema: Schema<T>) => new ArraySchema(schema),
  tuple: <T extends unknown[]>(schemas: { [K in keyof T]: Schema<T[K]> }) => new TupleSchema(schemas),
  any: () => new AnySchema(),
  object: <T extends Record<string, Schema<any>>>(shape: T) => new ObjectSchema(shape),
};

export type infer<T extends Schema<any>> = T["_output"];
