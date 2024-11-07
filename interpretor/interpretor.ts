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
  type CallExpression,
  type FunctionDeclaration,
  type MemberExpression,
  type IfElseStatement,
  type ForLoopStatement,
} from "../parser/ast.ts";
import type Environment from "./environment.ts";
import {
  evalForLoopStatement,
  evalFunctionDeclaration,
  evalIfElseStatement,
  evalProgram,
  evalVariableDeclaration,
} from "./eval/statements.ts";
import {
  evalAssignmentExpression,
  evalBinaryExpression,
  evalCallExpression,
  evalIdentifier,
  evalMemberExpression,
} from "./eval/expressions.ts";
import { evalObjectExpression } from "./eval/expressions.ts";
import type { bodyTracker } from "./eval/utils.ts";

export const evaluate = (
  node: Stmt,
  env: Environment,
  tracker: bodyTracker = { toBreak: false, toReturn: false }
): RuntimeValue => {
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

    case NodeType.CallExpression:
      return evalCallExpression(node as CallExpression, env, tracker);

    case NodeType.MemberExpression:
      return evalMemberExpression(node as MemberExpression, env);

    case NodeType.BinaryExpression:
      return evalBinaryExpression(node as BinaryExpression, env);

    case NodeType.Program:
      return evalProgram(node as Program, env);

    case NodeType.VariableDeclaration:
      return evalVariableDeclaration(node as VariableDeclaration, env);

    case NodeType.FunctionDeclaration:
      return evalFunctionDeclaration(node as FunctionDeclaration, env);

    case NodeType.AssignmentExpression:
      return evalAssignmentExpression(node as AssignmentExpression, env);

    case NodeType.IfElseStatement:
      return evalIfElseStatement(node as IfElseStatement, env, tracker);

    case NodeType.ForLoopStatement:
      return evalForLoopStatement(node as ForLoopStatement, env);

    case NodeType.BreakStatement:
      throw new Error("Cannot use break statement outside the loop");

    case NodeType.ReturnStatement:
      throw new Error("Cannot use return keyword outside the function");

    default:
      throw new Error(
        "There is no implementation for this ASTNode: " + node.type
      );
  }
};
