import type { RuntimeValue } from "./types.ts";

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
    env.variables.set(varname, value);
    return value;
  }

  public getVar(varname: string): RuntimeValue {
    const env = this.resolveEnv(varname);

    if (env.constants.has(varname)) {
      throw new Error(`Can't do reassignment to constant ${varname}`);
    }
    return env.variables.get(varname) as RuntimeValue;
  }

  public resolveEnv(varname: string): Environment {
    if (this.variables.has(varname)) return this;

    if (this.parent == undefined)
      throw new Error(
        `Cannot resolve the variable ${varname} as it doesn't exist`
      );

    return this.resolveEnv(varname);
  }
}
