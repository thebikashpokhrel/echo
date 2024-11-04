import {
  echo,
  nativeFunctions,
  now,
  read,
  toNumber,
  toString,
  type,
} from "./lib/native-functions.ts";
import { makeTypes, type RuntimeValue } from "./types.ts";

export const createGlobalEnv = () => {
  const env = new Environment();
  env.declarVar("true", makeTypes.BOOLEAN(true), true);
  env.declarVar("false", makeTypes.BOOLEAN(false), true);

  //Define native functions

  //Printing function
  env.declarVar(nativeFunctions.echo, makeTypes.NATIVE_FUNCTION(echo), true);

  //Time Function
  env.declarVar(nativeFunctions.now, makeTypes.NATIVE_FUNCTION(now), true);

  //User Input Function
  env.declarVar(nativeFunctions.read, makeTypes.NATIVE_FUNCTION(read), true);

  //Convert to string function
  env.declarVar(
    nativeFunctions.toString,
    makeTypes.NATIVE_FUNCTION(toString),
    true
  );

  //Convert to number function
  env.declarVar(
    nativeFunctions.toNumber,
    makeTypes.NATIVE_FUNCTION(toNumber),
    true
  );

  //Get variable type function
  env.declarVar(nativeFunctions.type, makeTypes.NATIVE_FUNCTION(type), true);

  return env;
};

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeValue>;
  private constants: Set<string>;

  constructor(parentEnv?: Environment) {
    this.parent = parentEnv;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declarVar(
    varname: string,
    value: RuntimeValue,
    isConstant: boolean
  ): RuntimeValue {
    if (this.variables.has(varname)) {
      throw new Error(`Can redeclare variable ${varname}`);
    }

    this.variables.set(varname, value);
    if (isConstant) this.constants.add(varname);
    return value;
  }

  public assignVar(varname: string, value: RuntimeValue): RuntimeValue {
    const env = this.resolveEnv(varname);

    if (env.constants.has(varname)) {
      throw new Error(`Can't do reassignment to constant ${varname}`);
    }
    env.variables.set(varname, value);
    return value;
  }

  public getVar(varname: string): RuntimeValue {
    const env = this.resolveEnv(varname);
    return env.variables.get(varname) as RuntimeValue;
  }

  public resolveEnv(varname: string): Environment {
    if (this.variables.has(varname)) return this;

    if (this.parent == undefined)
      throw new Error(
        `Cannot resolve the variable ${varname} as it doesn't exist`
      );

    return this.parent.resolveEnv(varname);
  }
}
