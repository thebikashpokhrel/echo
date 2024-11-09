import type Environment from "../environment.ts";
import { evaluate } from "../interpretor.ts";
import type { NativeFunctionValue } from "../types.ts";
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
  array = "array",
}

export const echo = (args: RuntimeValue[]) => {
  const getValue = (arg: RuntimeValue) => {
    switch (arg.type) {
      case ValueType.null:
      case ValueType.number:
      case ValueType.string:
      case ValueType.boolean:
        return (arg as NullValue | NumberValue | StringValue | BooleanValue)
          .value;
      case ValueType.nativeFunction:
        return (arg as NativeFunctionValue).call;

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

export const now = (args: RuntimeValue[]) => {
  return makeTypes.NUMBER(Date.now());
};

export const read = (args: RuntimeValue[]) => {
  const message = (args[0] as StringValue).value || "";
  const input = prompt(message) || "";
  return makeTypes.STRING(input);
};

export const toString = (args: RuntimeValue[]) => {
  const value = (args[0] as NumberValue).value || "";
  return makeTypes.STRING(value.toString());
};

export const toNumber = (args: RuntimeValue[]) => {
  const value = (args[0] as StringValue).value || "";
  return makeTypes.NUMBER(parseFloat(value));
};

export const type = (args: RuntimeValue[]) => {
  return makeTypes.STRING(args[0].type);
};

export const array = (args: RuntimeValue[]) => {
  const props: Map<string, RuntimeValue> = new Map();

  for (let i = 0; i < args.length; i++) {
    props.set(i.toString(), args[i]);
  }

  //To access length
  props.set("length", makeTypes.NUMBER(args.length));

  //Append new element
  const append = (items: RuntimeValue[]) => {
    for (let i = 0; i < items.length; i++) {
      const len = (props.get("length") as NumberValue).value;
      props.set((len + i).toString(), items[i]);
      props.set("length", makeTypes.NUMBER(len + 1));
    }
    return makeTypes.NULL();
  };

  props.set("append", makeTypes.NATIVE_FUNCTION(append));

  return makeTypes.OBJECT(props);
};
