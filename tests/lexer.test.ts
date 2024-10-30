import { assertEquals, assertThrows } from "@std/assert";
import { tokenize, TokenType } from "../lexer/lexer.ts";

Deno.test("Simple test for Tokenizer", () => {
  const testCode = `
let x = "Hello" + 4
let y = (2+3) + 4
  `;
  const tokens = tokenize(testCode);
  const expectedTokens = [
    { value: "let", tokenType: TokenType.Let },
    { value: "x", tokenType: TokenType.Identifier },
    { value: "=", tokenType: TokenType.Equals },
    { value: "Hello", tokenType: TokenType.String },
    { value: "+", tokenType: TokenType.BinaryOperator },
    { value: "4", tokenType: TokenType.Number },
    { value: "let", tokenType: TokenType.Let },
    { value: "y", tokenType: TokenType.Identifier },
    { value: "=", tokenType: TokenType.Equals },
    { value: "(", tokenType: TokenType.OpenParenthesis },
    { value: "2", tokenType: TokenType.Number },
    { value: "+", tokenType: TokenType.BinaryOperator },
    { value: "3", tokenType: TokenType.Number },
    { value: ")", tokenType: TokenType.CloseParenthesis },
    { value: "+", tokenType: TokenType.BinaryOperator },
    { value: "4", tokenType: TokenType.Number },
    { value: "EndOfFile", tokenType: TokenType.EOF },
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
