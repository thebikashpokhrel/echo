import { tokenize } from "./lexer/lexer.ts";
import Parser from "./parser/parser.ts";

// const srcFile = "./examples/code.txt";

// const srcCode = await Deno.readTextFile(srcFile);

// const tokens = tokenize(srcCode);

const repl = function () {
  const parser = new Parser();
  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.generateAST(input);
    console.log(program);
  }
};

repl();

// for (const token of tokens) {
//   console.log(token);
// }
