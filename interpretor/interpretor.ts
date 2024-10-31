import { RuntimeValue, makeTypes } from "./types.ts";
import {
  NodeType,
  Stmt,
  NumericLiteral,
  StringLiteral,
  type BinaryExpression,
  type Program,
  type Identifier,
  type VariableDeclaration,
  type AssignmentExpression,
  type ObjectLiteral,
} from "../parser/ast.ts";
import type Environment from "./environment.ts";
import { evalProgram, evalVariableDeclaration } from "./eval/statements.ts";
import {
  evalAssignmentExpression,
  evalBinaryExpression,
  evalIdentifier,
} from "./eval/expressions.ts";
import { evalObjectExpression } from "./eval/expressions.ts";

export const evaluate = (node: Stmt, env: Environment): RuntimeValue => {
  switch (node.type) {
    case NodeType.NumericLiteral:
      return makeTypes.NUMBER((node as NumericLiteral).value);

    case NodeType.StringLiteral:
      return makeTypes.STRING((node as StringLiteral).value);

    case NodeType.NullLiteral:
      return makeTypes.NULL();

    case NodeType.Identifier:
      return evalIdentifier(node as Identifier, env);

    case NodeType.ObjectLiteral:
      return evalObjectExpression(node as ObjectLiteral, env);

    case NodeType.BinaryExpression:
      return evalBinaryExpression(node as BinaryExpression, env);

    case NodeType.Program:
      return evalProgram(node as Program, env);

    case NodeType.VariableDeclaration:
      return evalVariableDeclaration(node as VariableDeclaration, env);

    case NodeType.AssignmentExpression:
      return evalAssignmentExpression(node as AssignmentExpression, env);

    default:
      throw new Error(
        "There is no implementation for this ASTNode: " + node.type
      );
  }
};
