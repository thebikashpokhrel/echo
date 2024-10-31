import { assertEquals, assertThrows } from "@std/assert";
import Parser from "../parser/parser.ts";
import { NodeType, type Program } from "../parser/ast.ts";
import type { BinaryExpression } from "../parser/ast.ts";

Deno.test("Simple Test for Parser", () => {
  const testCode = `
(2+3)*4
  `;
  const programTree = new Parser().generateAST(testCode);
  const expectedTree: Program = {
    type: NodeType.Program,
    body: [
      {
        type: NodeType.BinaryExpression,
        left: {
          type: NodeType.BinaryExpression,
          left: { type: NodeType.NumericLiteral, value: 2 },
          right: { type: NodeType.NumericLiteral, value: 3 },
          operator: "+",
        },
        right: { type: NodeType.NumericLiteral, value: 4 },
        operator: "*",
      } as BinaryExpression,
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
    "Error while parsing: Closing Parenthesis is missing | Expected token: CloseParenthesis"
  );
});
