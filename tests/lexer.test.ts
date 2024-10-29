import { assertEquals } from "@std/assert";
import { tokenize } from "../lexer/lexer.ts";

Deno.test(function tokenizerTest() {
  const testCode = `
let x = 4 + 566
let y = (2+3)/4
  `;
  const tokens = tokenize(testCode);
  const expectedTokens = [
    { value: "let", tokenType: 7 },
    { value: "x", tokenType: 2 },
    { value: "=", tokenType: 3 },
    { value: "4", tokenType: 1 },
    { value: "+", tokenType: 6 },
    { value: "566", tokenType: 1 },
    { value: "let", tokenType: 7 },
    { value: "y", tokenType: 2 },
    { value: "=", tokenType: 3 },
    { value: "(", tokenType: 4 },
    { value: "2", tokenType: 1 },
    { value: "+", tokenType: 6 },
    { value: "3", tokenType: 1 },
    { value: ")", tokenType: 5 },
    { value: "/", tokenType: 6 },
    { value: "4", tokenType: 1 },
  ];
  assertEquals(tokens, expectedTokens);
});
