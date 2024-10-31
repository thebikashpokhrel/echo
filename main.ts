import Environment, { createGlobalEnv } from "./interpretor/environment.ts";
import { evaluate } from "./interpretor/interpretor.ts";
import { makeTypes } from "./interpretor/types.ts";
import Parser from "./parser/parser.ts";

const repl = function () {
  const parser = new Parser();
  const env = new Environment();
  env.declarVar("true", makeTypes.BOOLEAN(true), true);
  env.declarVar("false", makeTypes.BOOLEAN(false), true);

  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.generateAST(input);
    // console.log(program);
    const res = evaluate(program, env);
    console.log(res);
  }
};

const runSrc = async (src: string) => {
  const srcFile = src;
  const srcCode = await Deno.readTextFile(srcFile);

  const parser = new Parser();
  const env = createGlobalEnv(); //Global Scope

  const program = parser.generateAST(srcCode);
  // console.dir(program, { depth: null });
  const res = evaluate(program, env);
  console.log(res);
};

runSrc("./examples/code2.txt");
