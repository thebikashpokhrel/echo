import {
  NodeType,
  type Expression,
  type ForLoopStatement,
  type FunctionDeclaration,
  type IfElseStatement,
  type Program,
  type Stmt,
  type VariableDeclaration,
} from "../../parser/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpretor.ts";
import {
  type BooleanValue,
  type FunctionValue,
  type RuntimeValue,
  ValueType,
  makeTypes,
} from "../types.ts";
import { evalCondition, evalBody, type bodyTracker } from "./utils.ts";

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
  env: Environment,
  tracker: bodyTracker
): RuntimeValue => {
  let evaluated: RuntimeValue = makeTypes.NULL();
  const ifelseEnv = new Environment(env);
  let execElse = true;

  if (evalCondition(stmt.condition, ifelseEnv).value == true) {
    evaluated = evalBody(stmt.body, ifelseEnv, tracker);
    execElse = false;
    if (tracker.toBreak || tracker.toReturn) {
      return evaluated;
    }
  } else {
    if (stmt.elseIfStatements) {
      for (const elifStmt of stmt.elseIfStatements) {
        if (evalCondition(elifStmt.condition, ifelseEnv).value == true) {
          const evaluated = evalBody(elifStmt.body, ifelseEnv, tracker);
          execElse = false;
          if (tracker.toBreak || tracker.toReturn) {
            return evaluated;
          }
          break;
        }
      }
    }
  }

  if (execElse && stmt.elseStatement) {
    evaluated = evalBody(stmt.elseStatement.body, ifelseEnv, tracker);
    execElse = false;
    if (tracker.toBreak || tracker.toReturn) {
      return evaluated;
    }
  }

  return evaluated;
};

export const evalForLoopStatement = (
  stmt: ForLoopStatement,
  env: Environment
): RuntimeValue => {
  const loopEnv = new Environment(env);
  const loopTracker = {
    toBreak: false,
    toReturn: false,
  } as bodyTracker;
  let evaluated = makeTypes.NULL() as RuntimeValue;
  if (stmt.initializer.type == NodeType.VariableDeclaration) {
    evaluate(stmt.initializer, loopEnv);
  } else {
    evaluate(stmt.initializer, env);
  }

  let condition = evalCondition(stmt.condition, loopEnv);
  while (condition.value == true) {
    const ev = evalBody(stmt.body, loopEnv, loopTracker);
    if (loopTracker.toBreak) {
      break;
    }
    if (loopTracker.toReturn) {
      evaluated = ev;
      break;
    }
    evaluate(stmt.step, loopEnv);
    condition = evalCondition(stmt.condition, loopEnv);
  }

  return evaluated;
};
