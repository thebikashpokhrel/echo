import type { Stmt } from "../parser/ast.ts";
import type Environment from "./environment.ts";

export enum ValueType {
  null = "null",
  number = "number",
  string = "string",
  boolean = "boolean",
  object = "object",
  nativeFunction = "nativeFunction",
  function = "function",
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

export interface ObjectValue extends RuntimeValue {
  type: ValueType.object;
  properties: Map<string, RuntimeValue>;
}

export type FunctionCall = (
  args: RuntimeValue[],
  env: Environment
) => RuntimeValue;

export interface NativeFunctionValue extends RuntimeValue {
  type: ValueType.nativeFunction;
  call: FunctionCall;
}

export interface FunctionValue extends RuntimeValue {
  type: ValueType.function;
  name: string;
  paramters: string[];
  declarationEnv: Environment;
  body: Stmt[];
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
  OBJECT: (props: Map<string, RuntimeValue>) => {
    return {
      type: ValueType.object,
      properties: props,
    } as ObjectValue;
  },
  NATIVE_FUNCTION: (call: FunctionCall) => {
    return {
      type: ValueType.nativeFunction,
      call,
    } as NativeFunctionValue;
  },
};
