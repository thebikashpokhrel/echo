import {
  type Expression,
  type ReturnStatement,
  type Stmt,
  NodeType,
} from "../../parser/ast.ts";
import type Environment from "../environment.ts";
import { evaluate } from "../interpretor.ts";
import {
  ValueType,
  makeTypes,
  type BooleanValue,
  type RuntimeValue,
} from "../types.ts";

export type bodyTracker = {
  toBreak: boolean;
  toReturn: boolean;
};

//Some Helper Functions
export const evalCondition = (s: Expression, env: Environment) => {
  let ev = evaluate(s, env);
  if (ev.type != ValueType.boolean && ev.type != ValueType.null) {
    ev = makeTypes.BOOLEAN(true);
  } else if (ev.type == ValueType.null) {
    ev = makeTypes.BOOLEAN(false);
  }

  return ev as BooleanValue;
};

export const evalBody = (
  s: Stmt[],
  env: Environment,
  tracker: bodyTracker
): RuntimeValue => {
  let evaluated: RuntimeValue = makeTypes.NULL();
  for (const eachStmt of s) {
    if (tracker.toBreak == true) break;
    if (tracker.toReturn) break;

    if (eachStmt.type == NodeType.BreakStatement) {
      tracker.toBreak = true;
      break;
    } else if (eachStmt.type == NodeType.ReturnStatement) {
      evaluated = evaluate(
        (eachStmt as ReturnStatement).returnValue,
        env,
        tracker
      );
      tracker.toReturn = true;
      break;
    } else {
      evaluated = evaluate(eachStmt, env, tracker);
    }
  }
  return evaluated;
};
