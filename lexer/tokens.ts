export enum TokenType {
  Null = "Null",
  String = "String",
  Number = "Number",
  Identifier = "Identifier",
  Equals = "Equals", // =
  OpenParenthesis = "OpenParenthesis", // (
  CloseParenthesis = "CloseParenthesis", // )
  BinaryOperator = "BinaryOperator",
  UnaryOperator = "UnaryOperator",
  Let = "Let",
  Const = "Const",
  Def = "Def",
  If = "If",
  Else = "Else",
  Elif = "Elif", //Else If
  For = "For",
  EOF = "EOF",
  SemiColon = "SemiColon",
  Comma = "Comma",
  Colon = "Colon",
  Dot = "Dot",
  OpenBrace = "OpenBrace", // {
  CloseBrace = "CloseBrace", // }
  OpenBracket = "OpenBracket", // [
  CloseBracket = "CloseBracket", // ]
  Comment = "Comment", // #
}
