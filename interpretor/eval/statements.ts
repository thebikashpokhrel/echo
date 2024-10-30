import type {
  NodeType,
  Program,
  VariableDeclaration,
} from "../../parser/ast.ts";
import type Environment from "../environment.ts";
import { evaluate } from "../interpretor.ts";
import { type RuntimeValue, makeTypes } from "../types.ts";

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
