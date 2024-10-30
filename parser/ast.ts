export enum NodeType {
  Program,
  StringLiteral,
  NumericLiteral,
  BinaryExpression,
  Identifier,
}

export interface Stmt {
  type: NodeType;
}

export interface Program extends Stmt {
  type: NodeType.Program;
  body: Stmt[];
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
