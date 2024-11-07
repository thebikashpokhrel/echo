import { createGlobalEnv } from "./interpretor/environment.ts";
import { evaluate } from "./interpretor/interpretor.ts";
import Parser from "./parser/parser.ts";

const repl = function () {
  const parser = new Parser();
  const env = createGlobalEnv(); //Global Scope
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
  console.log(
    "---------------------------ABSTRACT SYNTAX TREE------------------------------"
  );
  console.dir(program, { depth: null });
  console.log(
    "---------------------------OUTPUT----------------------------------"
  );
  const res = evaluate(program, env);
  // console.log(res);
};

runSrc("./examples/code7.txt");
