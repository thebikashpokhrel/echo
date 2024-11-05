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
  const ifelseEnv = new Environment(env);

  let execElse = true;

  if (evalCondition(stmt.condition, ifelseEnv).value == true) {
    evaluated = evalBody(stmt.body, ifelseEnv);
    execElse = false;
  } else {
    if (stmt.elseIfStatements) {
      for (const elifStmt of stmt.elseIfStatements) {
        if (evalCondition(elifStmt.condition, ifelseEnv).value == true) {
          evaluated = evalBody(elifStmt.body, ifelseEnv);
          execElse = false;
          break;
        }
      }
    }
  }

  if (execElse && stmt.elseStatement)
    evaluated = evalBody(stmt.elseStatement.body, ifelseEnv);

  return evaluated;
};

export const evalForLoopStatement = (
  stmt: ForLoopStatement,
  env: Environment
): RuntimeValue => {
  const loopEnv = new Environment(env);
  if (stmt.initializer.type == NodeType.VariableDeclaration) {
    evaluate(stmt.initializer, loopEnv);
  } else {
    evaluate(stmt.initializer, env);
  }

  let condition = evalCondition(stmt.condition, loopEnv);
  while (condition.value == true) {
    evalBody(stmt.body, loopEnv);
    evaluate(stmt.step, loopEnv);
    condition = evalCondition(stmt.condition, loopEnv);
  }

  return makeTypes.NULL();
};

//Some Helper Functions
const evalCondition = (s: Expression, env: Environment) => {
  let ev = evaluate(s, env);
  if (ev.type != ValueType.boolean && ev.type != ValueType.null) {
    ev = makeTypes.BOOLEAN(true);
  } else if (ev.type == ValueType.null) {
    ev = makeTypes.BOOLEAN(false);
  }

  return ev as BooleanValue;
};

const evalBody = (s: Stmt[], env: Environment): RuntimeValue => {
  let evaluated: RuntimeValue = makeTypes.NULL();
  for (const eachStmt of s) {
    evaluated = evaluate(eachStmt, env);
  }

  return evaluated;
};
