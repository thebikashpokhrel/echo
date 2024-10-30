export enum NodeType {
  //Statements
  Program = "Program",
  VariableDeclaration = "VariableDeclaration",

  //Expressions
  NullLiteral = "NullLiteral",
  StringLiteral = "StringLiteral",
  NumericLiteral = "NumericLiteral",
  BinaryExpression = "BinaryExpression",
  Identifier = "Identifier",
}

export interface Stmt {
  type: NodeType;
}

export interface Program extends Stmt {
  type: NodeType.Program;
  body: Stmt[];
}

export interface VariableDeclaration extends Stmt {
  type: NodeType.VariableDeclaration;
  constant: boolean;
  identifier: string;
  value?: Expression;
}

export interface Expression extends Stmt {}

export interface BinaryExpression extends Expression {
  type: NodeType.BinaryExpression;
  left: Expression;
  right: Expression;
  operator: string;
}

export interface Identifier extends Expression {
  type: NodeType.Identifier;
  name: string;
}

export interface StringLiteral extends Expression {
  type: NodeType.StringLiteral;
  value: string;
}

export interface NumericLiteral extends Expression {
  type: NodeType.NumericLiteral;
  value: number;
}

export interface NulllLiteral extends Expression {
  type: NodeType.NullLiteral;
  value: "null";
}
