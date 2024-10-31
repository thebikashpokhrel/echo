import type { ObjectLiteral } from "../../parser/ast.ts";
import {
  NodeType,
  type AssignmentExpression,
  type BinaryExpression,
  type Identifier,
} from "../../parser/ast.ts";
import type Environment from "../environment.ts";
import { evaluate } from "../interpretor.ts";
import {
  type NumberValue,
  type StringValue,
  ValueType,
  type RuntimeValue,
  makeTypes,
  type ObjectValue,
} from "../types.ts";

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
  } else {
    if (operator === "+") {
      if (lhs.type == ValueType.number) {
        result = lhs.value.toString() + rhs.value;
      } else {
        result = lhs.value + rhs.value.toString();
      }
    } else throw new Error(`Invalid operator "${operator}" for strings.`);
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

  if (
    (lhs.type == ValueType.string || lhs.type == ValueType.number) &&
    (rhs.type == ValueType.string || rhs.type == ValueType.number)
  ) {
    return evalAlphaNumBinaryExpression(
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
  node: AssignmentExpression,
  env: Environment
): RuntimeValue => {
  if (node.assignee.type != NodeType.Identifier) {
    throw new Error(
      `Invalid assignment : Assigning ${node.assignee} to ${node.value}`
    );
  }

  return env.assignVar(
    (node.assignee as Identifier).name,
    evaluate(node.value, env)
  );
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
