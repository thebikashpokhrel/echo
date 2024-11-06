export enum NodeType {
  //Statements
  Program = "Program",
  VariableDeclaration = "VariableDeclaration",
  FunctionDeclaration = "FunctionDeclaration",
  IfElseStatement = "IfElseStatement",
  ForLoopStatement = "ForLoopStatement",
  BreakStatement = "BreakStatement",

  //Expressions
  BinaryExpression = "BinaryExpression",
  Identifier = "Identifier",
  AssignmentExpression = "AssignmentExpression",
  MemberExpression = "MemberExpression",
  CallExpression = "CallExpression",

  //Literals
  NullLiteral = "NullLiteral",
  StringLiteral = "StringLiteral",
  NumericLiteral = "NumericLiteral",
  ObjectLiteral = "ObjectLiteral",

  Property = "Property",
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

export interface FunctionDeclaration extends Stmt {
  type: NodeType.FunctionDeclaration;
  parameters: string[];
  name: string;
  body: Stmt[];
}

export interface IfElseStatement extends Stmt {
  type: NodeType.IfElseStatement;
  condition: Expression;
  body: Stmt[];
  elseIfStatements?: IfElseStatement[];
  elseStatement?: IfElseStatement;
}

export interface ForLoopStatement extends Stmt {
  type: NodeType.ForLoopStatement;
  initializer: Stmt;
  condition: Expression;
  step: Stmt;
  body: Stmt[];
}

export interface BreakStatement extends Stmt {
  type: NodeType.BreakStatement;
}

export interface Expression extends Stmt {}

export interface AssignmentExpression extends Expression {
  type: NodeType.AssignmentExpression;
  assignee: Expression;
  value: Expression;
}

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

export interface NullLiteral extends Expression {
  type: NodeType.NullLiteral;
  value: "null";
}

export interface ObjectLiteral extends Expression {
  type: NodeType.ObjectLiteral;
  properties: Property[];
}

export interface Property extends Expression {
  type: NodeType.Property;
  key: string;
  value?: Expression;
}

export interface MemberExpression extends Expression {
  type: NodeType.MemberExpression;
  object: Expression;
  property: Expression;
  computed: boolean;
}

export interface CallExpression extends Expression {
  type: NodeType.CallExpression;
  arguments: Expression[];
  caller: Expression;
}
