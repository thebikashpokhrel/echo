import { assertEquals, assertThrows } from "@std/assert";
import Parser from "../parser/parser.ts";
import Environment from "../interpretor/environment.ts";
import { makeTypes } from "../interpretor/types.ts";
import { evaluate } from "../interpretor/interpretor.ts";

const parser = new Parser();

Deno.test("Arithemtic Expression Evaluation", () => {
  const env = new Environment();
  const testCode = `
    2+3*4-5
    `;
  const expectedOutput = makeTypes.NUMBER(9);
  const output = evaluate(parser.generateAST(testCode), env);
  assertEquals(output, expectedOutput);
});

Deno.test("Arithemtic Expression Evaluation with variables", () => {
  const env = new Environment();
  const testCode = `
      let x = 4;
      let y = 5;
      let z = (x+y)*5 - 5;
      `;
  const expectedOutput = makeTypes.NUMBER(40);
  const output = evaluate(parser.generateAST(testCode), env);
  assertEquals(output, expectedOutput);
});

Deno.test("Variable Resassignment", () => {
  const env = new Environment();
  env.declarVar("true", makeTypes.BOOLEAN(true), true);
  env.declarVar("false", makeTypes.BOOLEAN(false), true);
  const testCode = `
      let x = 4;
      x = 12;
      x*10
      `;
  const expectedOutput = makeTypes.NUMBER(120);
  const output = evaluate(parser.generateAST(testCode), env);
  assertEquals(output, expectedOutput);
});

Deno.test("No assignment to constant", () => {
  const env = new Environment();
  const testCode = "const x;";
  assertThrows(
    () => {
      evaluate(parser.generateAST(testCode), env);
    },
    Error,
    "Value must be assigned for constant expression"
  );
});

Deno.test("Reassignment to constant", () => {
  const env = new Environment();
  const testCode = `
    const x = 4;
    x = 12;
    `;
  assertThrows(
    () => {
      evaluate(parser.generateAST(testCode), env);
    },
    Error,
    "Can't do reassignment to constant x"
  );
});

Deno.test("Reassignment to undeclared variable", () => {
  const env = new Environment();
  const testCode = `
      let y = 12;
      z = 15;
      `;
  assertThrows(
    () => {
      evaluate(parser.generateAST(testCode), env);
    },
    Error,
    "Cannot resolve the variable z as it doesn't exist"
  );
});

//TODO: Tests for Objects
