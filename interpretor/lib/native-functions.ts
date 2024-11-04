import type Environment from "../environment.ts";
import {
  makeTypes,
  ValueType,
  type BooleanValue,
  type NullValue,
  type NumberValue,
  type ObjectValue,
  type RuntimeValue,
  type StringValue,
} from "../types.ts";

export enum nativeFunctions {
  echo = "echo",
  now = "now",
  read = "read",
  toString = "toString",
  toNumber = "toNumber",
  type = "type",
}

export const echo = (args: RuntimeValue[], env: Environment) => {
  const getValue = (arg: RuntimeValue) => {
    switch (arg.type) {
      case ValueType.null:
      case ValueType.number:
      case ValueType.string:
      case ValueType.boolean:
        return (arg as NullValue | NumberValue | StringValue | BooleanValue)
          .value;

      // deno-lint-ignore no-case-declarations
      case ValueType.object:
        // deno-lint-ignore no-explicit-any
        const obj: Record<string, any> = {};
        (arg as ObjectValue).properties.forEach((v, k) => {
          obj[k] = getValue(v);
        });

        return obj;

      default:
        return null;
    }
  };

  const transformedArgs: (
    | string
    | number
    | boolean
    | Record<string, any>
    | null
  )[] = [];
  args.forEach((arg) => {
    transformedArgs.push(getValue(arg));
  });

  console.log(...transformedArgs);
  return makeTypes.NULL();
};

export const now = (args: RuntimeValue[], env: Environment) => {
  return makeTypes.NUMBER(Date.now());
};

export const read = (args: RuntimeValue[], env: Environment) => {
  const message = (args[0] as StringValue).value || "";
  const input = prompt(message) || "";
  return makeTypes.STRING(input);
};

export const toString = (args: RuntimeValue[], env: Environment) => {
  const value = (args[0] as NumberValue).value || "";
  return makeTypes.STRING(value.toString());
};

export const toNumber = (args: RuntimeValue[], env: Environment) => {
  const value = (args[0] as StringValue).value || "";
  return makeTypes.NUMBER(parseFloat(value));
};

export const type = (args: RuntimeValue[], env: Environment) => {
  return makeTypes.STRING(args[0].type);
};
