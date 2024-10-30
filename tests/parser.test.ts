import { assertEquals, assertThrows } from "@std/assert";
import Parser from "../parser/parser.ts";

Deno.test("Simple Test for Parser", () => {
  const testCode = `
(2+3)*4
  `;
  const programTree = new Parser().generateAST(testCode);
  const expectedTree = {
    type: 0,
    body: [
      {
        type: 3,
        left: {
          type: 3,
          left: { type: 2, value: 2 },
          right: { type: 2, value: 3 },
          operator: "+",
        },
        right: { type: 2, value: 4 },
        operator: "*",
      },
    ],
  };
  assertEquals(programTree, expectedTree);
});

Deno.test("Parsing error on illegal brackets", () => {
  const testCode = "(2+3";
  const parser = new Parser();
  assertThrows(
    () => {
      parser.generateAST(testCode);
    },
    Error,
    "Error while parsing: Closing Parenthesis is missing | Expecting token: CloseParenthesis"
  );
});
