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

  args.forEach((arg) => {
    console.log(getValue(arg));
  });

  return makeTypes.NULL();
};

export const now = (args: RuntimeValue[], env: Environment) => {
  return makeTypes.NUMBER(Date.now());
};
