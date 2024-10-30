import Environment from "./interpretor/environment.ts";
import { evaluate } from "./interpretor/interpretor.ts";
import { makeTypes, ValueType, type NumberValue } from "./interpretor/types.ts";
// import { tokenize } from "./lexer/lexer.ts";
import Parser from "./parser/parser.ts";

// const srcFile = "./examples/code.txt";

// const srcCode = await Deno.readTextFile(srcFile);

// const tokens = tokenize(srcCode);

const repl = function () {
  const parser = new Parser();
  const env = new Environment();

  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.generateAST(input);
    const res = evaluate(program, env);
    console.log(res);
  }
};

repl();

// for (const token of tokens) {
//   console.log(token);
// }
