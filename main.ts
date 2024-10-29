import { tokenize } from "./lexer/lexer.ts";

const srcFile = "./examples/code.txt";

const srcCode = await Deno.readTextFile(srcFile);

const tokens = tokenize(srcCode);

for (const token of tokens) {
  console.log(token);
}
