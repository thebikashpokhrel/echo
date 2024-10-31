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
  type AssignmentExpression,
  type Property,
  type ObjectLiteral,
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
        "Error while parsing: " + err + " | Expected token: " + TokenType[type]
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
    return this.parseAssignmentExpression();
  }

  private parseAssignmentExpression(): Expression {
    //TODO: Semicolon at end when variables are chained i.e. x=y=4;

    const lhs = this.parseObjectExpression();
    if (this.current().tokenType == TokenType.Equals) {
      this.advance();
      const value = this.parseAssignmentExpression();
      this.expect(
        TokenType.SemiColon,
        "Expected ; after assignment expression"
      );
      return {
        type: NodeType.AssignmentExpression,
        value,
        assignee: lhs,
      } as AssignmentExpression;
    }

    return lhs;
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

  private parseObjectExpression(): Expression {
    if (this.current().tokenType != TokenType.OpenBracket) {
      return this.parseAdditiveExpression();
    }

    this.advance();
    const properties = new Array<Property>();

    while (
      this.notEOF() &&
      this.current().tokenType != TokenType.CloseBracket
    ) {
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected."
      ).value;

      if (this.current().tokenType == TokenType.Comma) {
        this.advance();
        properties.push({ key, type: NodeType.Property } as Property);
      } else if (this.current().tokenType == TokenType.CloseBracket) {
        properties.push({ key, type: NodeType.Property } as Property);
        continue;
      } else {
        this.expect(
          TokenType.Colon,
          "Missing colon after identifier in Object Literal"
        );

        const value = this.parseExpression();
        properties.push({ type: NodeType.Property, key, value } as Property);

        if (this.current().tokenType != TokenType.CloseBracket) {
          this.expect(TokenType.Comma, "Expected a comma or closing bracket");
        }
      }
    }

    this.expect(
      TokenType.CloseBracket,
      "Object literal must have ending closing brace."
    );

    return {
      type: NodeType.ObjectLiteral,
      properties,
    } as ObjectLiteral;
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
