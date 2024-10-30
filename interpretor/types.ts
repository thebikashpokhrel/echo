export enum ValueType {
  null = "null",
  number = "number",
  string = "string",
  boolean = "boolean",
}

export interface RuntimeValue {
  type: ValueType;
}

export interface NullValue extends RuntimeValue {
  type: ValueType.null;
  value: null;
}

export interface NumberValue extends RuntimeValue {
  type: ValueType.number;
  value: number;
}

export interface StringValue extends RuntimeValue {
  type: ValueType.string;
  value: string;
}

export interface BooleanValue extends RuntimeValue {
  type: ValueType.boolean;
  value: boolean;
}

export const makeTypes = {
  NULL: () => {
    return {
      type: ValueType.null,
      value: null,
    } as NullValue;
  },
  NUMBER: (value: number) => {
    return {
      type: ValueType.number,
      value,
    } as NumberValue;
  },
  STRING: (value: string) => {
    return {
      type: ValueType.string,
      value,
    } as StringValue;
  },
  BOOLEAN: (value: boolean) => {
    return {
      type: ValueType.boolean,
      value,
    } as BooleanValue;
  },
};
