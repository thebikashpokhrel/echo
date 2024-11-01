import type {
  CallExpression,
  MemberExpression,
  ObjectLiteral,
} from "../../parser/ast.ts";
import {
  NodeType,
  type AssignmentExpression,
  type BinaryExpression,
  type Identifier,
} from "../../parser/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpretor.ts";
import type { BooleanValue, FunctionValue } from "../types.ts";
import {
  type NumberValue,
  type StringValue,
  ValueType,
  type RuntimeValue,
  makeTypes,
  type ObjectValue,
  type NativeFunctionValue,
} from "../types.ts";

const evalAlphaNumBoolBinaryExpression = (
  lhs: NumberValue | StringValue | BooleanValue,
  rhs: NumberValue | StringValue | BooleanValue,
  operator: string
): NumberValue | StringValue | BooleanValue => {
  let result: string | number | boolean = "";
  let resultType: ValueType = ValueType.null;

  if (lhs.type === ValueType.number && rhs.type === ValueType.number) {
    if (operator === "+") result = lhs.value + rhs.value;
    else if (operator === "-") result = lhs.value - rhs.value;
    else if (operator === "*") result = lhs.value * rhs.value;
    else if (operator === "/") result = lhs.value / rhs.value;
    else if (operator === "%") result = lhs.value % rhs.value;
  } else if (lhs.type === ValueType.string && rhs.type === ValueType.string) {
    if (operator === "+") {
      result = lhs.value + rhs.value;
    } else throw new Error(`Invalid operator "${operator}" for strings.`);
  }

  if (operator == "==") result = lhs.value == rhs.value;

  if (typeof result == "number") resultType = ValueType.number;
  else if (typeof result == "string") resultType = ValueType.string;
  else if (typeof result == "boolean") resultType = ValueType.boolean;

  return {
    type: resultType,
    value: result,
  } as NumberValue | StringValue | BooleanValue;
};

export const evalBinaryExpression = (
  expr: BinaryExpression,
  env: Environment
): RuntimeValue => {
  const lhs = evaluate(expr.left, env);
  const rhs = evaluate(expr.right, env);

  if (
    (lhs.type == ValueType.string ||
      lhs.type == ValueType.number ||
      lhs.type == ValueType.boolean) &&
    (rhs.type == ValueType.string ||
      rhs.type == ValueType.number ||
      lhs.type == ValueType.boolean)
  ) {
    return evalAlphaNumBoolBinaryExpression(
      lhs as NumberValue | StringValue,
      rhs as NumberValue | StringValue,
      expr.operator
    );
  } else {
    return makeTypes.NULL();
  }
};

export const evalIdentifier = (
  identifier: Identifier,
  env: Environment
): RuntimeValue => {
  const val = env.getVar(identifier.name);
  return val;
};

export const evalAssignmentExpression = (
  expr: AssignmentExpression,
  env: Environment
): RuntimeValue => {
  const value = evaluate(expr.value, env);
  if (expr.assignee.type === NodeType.MemberExpression) {
    const memberExpr = expr.assignee as MemberExpression;
    const object = evaluate(memberExpr.object, env) as ObjectValue;

    if (object.type !== "object") {
      throw new Error("Invalid assignment target; left side is not an object.");
    }
    const key = memberExpr.computed
      ? (evaluate(memberExpr.property, env) as StringValue).value
      : (memberExpr.property as Identifier).name;

    object.properties.set(key, value);
    return value;
  }

  // Handle assignment to a variable in the environment
  if (expr.assignee.type === NodeType.Identifier) {
    const variableName = (expr.assignee as Identifier).name;
    return env.assignVar(variableName, value);
  }

  // If left-hand side is not valid for assignment, throw an error
  throw new Error("Invalid assignment target.");
};

export const evalObjectExpression = (
  obj: ObjectLiteral,
  env: Environment
): RuntimeValue => {
  const object = {
    type: ValueType.object,
    properties: new Map(),
  } as ObjectValue;

  for (const { key, value } of obj.properties) {
    const runtimeVal = value ? evaluate(value, env) : env.getVar(key);

    object.properties.set(key, runtimeVal);
  }
  return object;
};

export const evalCallExpression = (
  expr: CallExpression,
  env: Environment
): RuntimeValue => {
  const args = expr.arguments.map((arg) => evaluate(arg, env));
  const func = evaluate(expr.caller, env);

  if (func.type == ValueType.nativeFunction) {
    const fnResult = (func as NativeFunctionValue).call(args, env);
    return fnResult;
  }
  if (func.type == ValueType.function) {
    const fn = func as FunctionValue;
    const scope = new Environment(fn.declarationEnv);

    fn.paramters.forEach((param, i) => {
      //TODO: Check if number of paramaters and args are equal
      scope.declarVar(param, args[i], false);
    });

    let retValue: RuntimeValue = makeTypes.NULL();

    for (const stmt of fn.body) {
      retValue = evaluate(stmt, scope);
    }
    return retValue;
  }

  throw new Error("Native functions are only supported.");
};

export const evalMemberExpression = (
  expr: MemberExpression,
  env: Environment
): RuntimeValue => {
  const key = expr.computed
    ? (evaluate(expr.property, env) as StringValue).value
    : (expr.property as Identifier).name;
  const obj = evaluate(expr.object as Identifier, env) as ObjectValue;
  return obj.properties.get(key) || makeTypes.NULL();
};
