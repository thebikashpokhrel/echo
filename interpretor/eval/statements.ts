import type {
  FunctionDeclaration,
  IfElseStatement,
  Program,
  VariableDeclaration,
} from "../../parser/ast.ts";
import type Environment from "../environment.ts";
import { evaluate } from "../interpretor.ts";
import {
  type BooleanValue,
  type FunctionValue,
  type RuntimeValue,
  ValueType,
  makeTypes,
} from "../types.ts";

export const evalProgram = (
  program: Program,
  env: Environment
): RuntimeValue => {
  let finalEvaluated: RuntimeValue = makeTypes.NULL();

  for (const stmt of program.body) {
    finalEvaluated = evaluate(stmt, env);
  }
  return finalEvaluated;
};

export const evalVariableDeclaration = (
  declaration: VariableDeclaration,
  env: Environment
): RuntimeValue => {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : makeTypes.NULL();
  return env.declarVar(declaration.identifier, value, declaration.constant);
};

export const evalFunctionDeclaration = (
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeValue => {
  const fn = {
    type: ValueType.function,
    name: declaration.name,
    paramters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionValue;

  return env.declarVar(declaration.name, fn, true);
};

export const evalIfElseStatement = (
  stmt: IfElseStatement,
  env: Environment
): RuntimeValue => {
  let evaluated: RuntimeValue = makeTypes.NULL();

  const evalCondition = (s: IfElseStatement) => {
    const ev = evaluate(s.condition, env);
    if (ev.type != ValueType.boolean && ev.type != ValueType.null) {
      evaluated = makeTypes.BOOLEAN(true);
    } else if (ev.type == ValueType.null) {
      evaluated = makeTypes.BOOLEAN(false);
    } else {
      evaluated = ev;
    }

    return evaluated as BooleanValue;
  };

  const evalBody = (s: IfElseStatement) => {
    for (const eachStmt of s.body) {
      evaluated = evaluate(eachStmt, env);
    }
  };

  let execElse = true;

  if (evalCondition(stmt).value == true) {
    evalBody(stmt);
    execElse = false;
  } else {
    if (stmt.elseIfStatements) {
      for (const elifStmt of stmt.elseIfStatements) {
        if (evalCondition(elifStmt).value == true) {
          evalBody(elifStmt);
          execElse = false;
          break;
        }
      }
    }
  }

  if (execElse && stmt.elseStatement) evalBody(stmt.elseStatement);

  return evaluated;
};
