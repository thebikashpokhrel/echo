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
  NullLiteral,
  type VariableDeclaration,
  type FunctionDeclaration,
  type AssignmentExpression,
  type Property,
  type ObjectLiteral,
  type CallExpression,
  type MemberExpression,
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
   * Assignment
   * Object
   * Multiplicative Expression (*,/, %)
   * Function Call
   * Object Member
   * Addititve Expression (+,-)
   * Primary Expression (Literals, Identifiers)
   */

  private parseStmt(): Stmt {
    switch (this.current().tokenType) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parseVariableDeclaration();
      case TokenType.Def:
        return this.parseFunctionDeclaration();

      default:
        return this.parseExpression();
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

  private parseFunctionDeclaration(): Stmt {
    this.advance();
    const name = this.expect(
      TokenType.Identifier,
      "Expected function name after def keyword."
    ).value;

    const args = this.parseArguments();
    const params: string[] = [];

    for (const arg of args) {
      if (arg.type != NodeType.Identifier)
        throw new Error("Expected paramters to be identifier");

      params.push((arg as Identifier).name);
    }

    this.expect(TokenType.OpenBrace, "Expected a function body");

    const body: Stmt[] = [];

    while (
      this.current().tokenType != TokenType.CloseBrace &&
      this.current().tokenType != TokenType.EOF
    ) {
      body.push(this.parseStmt());
    }

    this.expect(TokenType.CloseBrace, "Expected a closing brace");

    const fn = {
      body,
      name,
      parameters: params,
      type: NodeType.FunctionDeclaration,
    } as FunctionDeclaration;

    return fn;
  }

  private parseArguments(): Expression[] {
    this.expect(TokenType.OpenParenthesis, "Expected open parenthesis");

    const args =
      this.current().tokenType == TokenType.CloseParenthesis
        ? []
        : this.parseArgumentsList();
    this.expect(TokenType.CloseParenthesis, "Expected closing parenthesis");

    return args;
  }

  private parseArgumentsList(): Expression[] {
    const args = [this.parseAssignmentExpression()];

    while (this.current().tokenType == TokenType.Comma && this.advance()) {
      args.push(this.parseAssignmentExpression());
    }

    return args;
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

  private parseObjectExpression(): Expression {
    if (this.current().tokenType != TokenType.OpenBrace) {
      return this.parseConditionalExpression();
    }

    this.advance();
    const properties = new Array<Property>();

    while (this.notEOF() && this.current().tokenType != TokenType.CloseBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected."
      ).value;

      if (this.current().tokenType == TokenType.Comma) {
        this.advance();
        properties.push({ key, type: NodeType.Property } as Property);
      } else if (this.current().tokenType == TokenType.CloseBrace) {
        properties.push({ key, type: NodeType.Property } as Property);
        continue;
      } else {
        this.expect(
          TokenType.Colon,
          "Missing colon after identifier in Object Literal"
        );

        const value = this.parseExpression();
        properties.push({ type: NodeType.Property, key, value } as Property);

        if (this.current().tokenType != TokenType.CloseBrace) {
          this.expect(TokenType.Comma, "Expected a comma or closing bracket");
        }
      }
    }

    this.expect(
      TokenType.CloseBrace,
      "Object literal must have ending closing brace."
    );

    return {
      type: NodeType.ObjectLiteral,
      properties,
    } as ObjectLiteral;
  }

  private parseConditionalExpression(): Expression {
    let left = this.parseAdditiveExpression();
    while (this.current().value == "==") {
      const operator = this.advance().value;
      const right = this.parseAdditiveExpression();
      left = {
        type: NodeType.BinaryExpression,
        left,
        right,
        operator,
      } as BinaryExpression;
    }
    return left;
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
    let left = this.parseCallMemberExpression();
    while (
      this.current().value == "*" ||
      this.current().value == "/" ||
      this.current().value == "%" ||
      this.current().value == "=="
    ) {
      const operator = this.advance().value;
      const right = this.parseCallMemberExpression();
      left = {
        type: NodeType.BinaryExpression,
        left,
        right,
        operator,
      } as BinaryExpression;
    }

    return left;
  }

  private parseCallMemberExpression(): Expression {
    //For parsing statements like : obj.fn()
    const member = this.parseMemberExpression();

    if (this.current().tokenType == TokenType.OpenParenthesis) {
      return this.parseCallExpression(member);
    }

    return member;
  }

  private parseMemberExpression(): Expression {
    let object = this.parsePrimaryExpression();

    while (
      this.current().tokenType == TokenType.Dot ||
      this.current().tokenType == TokenType.OpenBracket
    ) {
      const operator = this.advance();
      let property: Expression;
      let computed: boolean;

      //Check for non computed property such as obj.expr
      if (operator.tokenType == TokenType.Dot) {
        computed = false;
        property = this.parsePrimaryExpression();

        if (property.type != NodeType.Identifier) {
          throw new Error("Expected identifier after dot operator");
        }
      } else {
        computed = true;
        property = this.parseExpression();
        this.expect(TokenType.CloseBracket, "Missing closing bracket");
      }

      object = {
        type: NodeType.MemberExpression,
        object,
        property,
        computed,
      } as MemberExpression;
    }

    return object;
  }

  private parseCallExpression(caller: Expression): Expression {
    let call_expr: Expression = {
      type: NodeType.CallExpression,
      caller,
      arguments: this.parseArguments(),
    } as CallExpression;

    if (this.current().tokenType == TokenType.OpenParenthesis) {
      call_expr = this.parseCallExpression(call_expr);
    }

    return call_expr;
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
        } as NullLiteral;
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
