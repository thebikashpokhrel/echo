import { assertEquals, assertThrows } from "@std/assert";
import { tokenize } from "../lexer/lexer.ts";

Deno.test("Simple test for Tokenizer", () => {
  const testCode = `
let x = "Hello" + 4
let y = (2+3) + 4
  `;
  const tokens = tokenize(testCode);
  const expectedTokens = [
    { value: "let", tokenType: 7 },
    { value: "x", tokenType: 2 },
    { value: "=", tokenType: 3 },
    { value: "Hello", tokenType: 0 },
    { value: "+", tokenType: 6 },
    { value: "4", tokenType: 1 },
    { value: "let", tokenType: 7 },
    { value: "y", tokenType: 2 },
    { value: "=", tokenType: 3 },
    { value: "(", tokenType: 4 },
    { value: "2", tokenType: 1 },
    { value: "+", tokenType: 6 },
    { value: "3", tokenType: 1 },
    { value: ")", tokenType: 5 },
    { value: "+", tokenType: 6 },
    { value: "4", tokenType: 1 },
    { value: "EndOfFile", tokenType: 8 },
  ];
  assertEquals(tokens, expectedTokens);
});

Deno.test("Lexing error on unrecognized character", () => {
  const testCode = "x = 3;";
  assertThrows(
    () => {
      tokenize(testCode);
    },
    Error,
    "Unrecognized character found :;"
  );
});
