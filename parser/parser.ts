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
  NulllLiteral,
  type VariableDeclaration,
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
    switch (this.current().tokenType) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parseVariableDeclaration();

      default:
        return this.parseExpression();
    }
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

      case TokenType.Null: {
        this.advance();
        return {
          type: NodeType.NullLiteral,
          value: "null",
        } as NulllLiteral;
      }

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
        throw new Error("Unexpected token found: " + tk.tokenType);
    }
  }

  private parseVariableDeclaration(): Stmt {
    const isConstant = this.advance().tokenType == TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      "Expected identifier name after const or let keyword:"
    ).value;

    if (this.current().tokenType == TokenType.SemiColon) {
      this.advance();
      if (isConstant) {
        throw new Error("Value must be assigned for constant expression");
      }

      return {
        type: NodeType.VariableDeclaration,
        constant: isConstant,
        identifier,
      } as VariableDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Expected '=' after identifier's name while declaring variable"
    );

    const declaration = {
      type: NodeType.VariableDeclaration,
      constant: isConstant,
      identifier,
      value: this.parseExpression(),
    } as VariableDeclaration;

    this.expect(TokenType.SemiColon, "Expected ';' after variable declaration");

    return declaration;
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
