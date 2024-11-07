// deno-lint-ignore-file no-explicit-any
import {
  arithmeticOperators,
  logicalOperators,
  relationalOperators,
} from "../../lexer/operators.ts";
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
import { evalBody, type bodyTracker } from "./utils.ts";

const evalRelationalBinaryExpression = (
  lhs: NumberValue | StringValue | BooleanValue,
  rhs: NumberValue | StringValue | BooleanValue,
  operator: string
): BooleanValue => {
  let result: boolean = false;

  const allowedTypes = [ValueType.number, ValueType.string, ValueType.boolean];
  if (allowedTypes.includes(lhs.type) && allowedTypes.includes(rhs.type)) {
    if (operator == "==") result = lhs.value == rhs.value;
    else if (operator == ">") result = lhs.value > rhs.value;
    else if (operator == "<") result = lhs.value < rhs.value;
    else if (operator == ">=") result = lhs.value >= rhs.value;
    else if (operator == "<=") result = lhs.value <= rhs.value;
    else if (operator == "!=") result = lhs.value != rhs.value;

    return {
      type: ValueType.boolean,
      value: result,
    } as BooleanValue;
  }

  throw new Error(`Operator ${operator} used between unsupported data types.`);
};

const evalLogicalBinaryExpression = (
  lhs: any,
  rhs: any,
  operator: string
): BooleanValue => {
  let result: boolean = false;

  const allowedTypes = [ValueType.boolean];

  if (!allowedTypes.includes(lhs.type)) {
    if (lhs.value) lhs.value = true;
    else lhs.value = false;
  }

  if (!allowedTypes.includes(rhs.type)) {
    if (rhs.value) rhs.value = true;
    else rhs.value = false;
  }

  if (operator == "and") result = lhs.value && rhs.value;
  else if (operator == "or") result = lhs.value || rhs.value;

  return {
    type: ValueType.boolean,
    value: result,
  } as BooleanValue;
};

const evalAlphaNumBinaryExpression = (
  lhs: NumberValue | StringValue,
  rhs: NumberValue | StringValue,
  operator: string
): NumberValue | StringValue => {
  let result: string | number = "";
  let resultType: ValueType = ValueType.null;

  if (lhs.type === ValueType.number && rhs.type === ValueType.number) {
    if (operator === "+") result = lhs.value + rhs.value;
    else if (operator === "-") result = lhs.value - rhs.value;
    else if (operator === "*") result = lhs.value * rhs.value;
    else if (operator === "/") result = lhs.value / rhs.value;
    else if (operator === "%") result = lhs.value % rhs.value;
  } else if (
    lhs.type === ValueType.string &&
    rhs.type === ValueType.string &&
    operator == "+"
  ) {
    result = lhs.value + rhs.value;
  } else if (
    lhs.type == ValueType.string &&
    rhs.type == ValueType.number &&
    operator == "+"
  ) {
    result = lhs.value + rhs.value.toString();
  } else if (
    lhs.type == ValueType.number &&
    rhs.type == ValueType.string &&
    operator == "+"
  ) {
    result = lhs.value.toString() + rhs.value;
  } else {
    throw new Error(`Operator ${operator} used between invalid data types`);
  }

  if (typeof result == "number") resultType = ValueType.number;
  else if (typeof result == "string") resultType = ValueType.string;

  return {
    type: resultType,
    value: result,
  } as NumberValue | StringValue;
};

export const evalBinaryExpression = (
  expr: BinaryExpression,
  env: Environment
): RuntimeValue => {
  const lhs = evaluate(expr.left, env);
  const rhs = evaluate(expr.right, env);

  if (logicalOperators.includes(expr.operator))
    return evalLogicalBinaryExpression(lhs, rhs, expr.operator);

  if (relationalOperators.includes(expr.operator))
    return evalRelationalBinaryExpression(
      lhs as NumberValue | StringValue | BooleanValue,
      rhs as NumberValue | StringValue | BooleanValue,
      expr.operator
    );

  if (arithmeticOperators.includes(expr.operator))
    return evalAlphaNumBinaryExpression(
      lhs as NumberValue | StringValue,
      rhs as NumberValue | StringValue,
      expr.operator
    );

  return makeTypes.NULL();
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
  env: Environment,
  tracker: bodyTracker
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
    const fnTracker = {
      toBreak: false,
      toReturn: false,
    } as bodyTracker;

    retValue = evalBody(fn.body, scope, fnTracker); //{toBreak} is for loop
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
