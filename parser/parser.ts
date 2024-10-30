// deno-lint-ignore-file no-explicit-any
import {
  Stmt,
  Program,
  Expression,
  BinaryExpression,
  StringLiteral,
  NumericLiteral,
  Identifier,
  NodeType,
} from "./ast.ts";

import { tokenize, Token, TokenType } from "../lexer/lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private notEOF() {
    return this.tokens[0].tokenType != TokenType.EOF;
  }

  private current(): Token {
    return this.tokens[0] as Token;
  }

  private advance(): Token {
    return this.tokens.shift() as Token;
  }

  private expect(type: TokenType, err: any) {
    const tk = this.advance();
    if (!tk || tk.tokenType != type) {
      throw new Error(
        "Error while parsing: " + err + " | Expecting token: " + TokenType[type]
      );
    }

    return tk;
  }
  /**Order of Precedence (increasing)
   * Multiplicative Expression (*,/, %)
   * Addititve Expression (+,-)
   * Primary Expression (Literals, Identifiers)
   */

  private parseStmt(): Stmt {
    //For now we will parse expression only
    return this.parseExpression();
  }
  private parseExpression(): Expression {
    return this.parseAdditiveExpression();
  }

  private parseAdditiveExpression(): Expression {
    let left = this.parseMultiplicativeExpression();

    while (this.current().value == "+" || this.current().value == "-") {
      const operator = this.advance().value;
      const right = this.parseMultiplicativeExpression();
      left = {
        type: NodeType.BinaryExpression,
        left,
        right,
        operator,
      } as BinaryExpression;
    }

    return left;
  }

  private parseMultiplicativeExpression(): Expression {
    let left = this.parsePrimaryExpression();

    while (
      this.current().value == "*" ||
      this.current().value == "/" ||
      this.current().value == "%"
    ) {
      const operator = this.advance().value;
      const right = this.parsePrimaryExpression();
      left = {
        type: NodeType.BinaryExpression,
        left,
        right,
        operator,
      } as BinaryExpression;
    }

    return left;
  }

  private parsePrimaryExpression(): Expression {
    const tk = this.current();
    switch (tk.tokenType) {
      case TokenType.Identifier:
        return {
          type: NodeType.Identifier,
          name: this.advance().value,
        } as Identifier;

      case TokenType.String:
        return {
          type: NodeType.StringLiteral,
          value: this.advance().value,
        } as StringLiteral;

      case TokenType.Number:
        return {
          type: NodeType.NumericLiteral,
          value: parseFloat(this.advance().value),
        } as NumericLiteral;

      case TokenType.OpenParenthesis: {
        this.advance();
        const expr = this.parseExpression();
        this.expect(
          TokenType.CloseParenthesis,
          "Closing Parenthesis is missing"
        );

        return expr;
      }

      default:
        throw new Error("Unexpected token found: " + tk);
    }
  }

  public generateAST(srcCode: string): Program {
    this.tokens = tokenize(srcCode);
    const program: Program = {
      type: NodeType.Program,
      body: [],
    };

    while (this.notEOF()) {
      program.body.push(this.parseStmt());
    }
    return program;
  }
}
