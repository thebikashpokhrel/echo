import { logicalOperators } from "./operators.ts";
import { TokenType } from "./tokens.ts";

//Represents individual token
export interface Token {
  value: string;
  tokenType: TokenType;
}

//Lists of reserved keywords
const keywords: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  null: TokenType.Null,
  def: TokenType.Def,
  if: TokenType.If,
  else: TokenType.Else,
  elif: TokenType.Elif,
  for: TokenType.For,
  break: TokenType.Break,
  return: TokenType.Return,
};

export const toToken = (value: string, tokenType: TokenType): Token => {
  return {
    value,
    tokenType,
  };
};

const isAlphabet = (char: string = ""): boolean => {
  const code = char.charCodeAt(0);
  const isUppercase = code >= 65 && code <= 90; // ASCII 65-90 for A-Z
  const isLowercase = code >= 97 && code <= 122; // ASCII 97-122 for a-z

  return isUppercase || isLowercase;
};

const isNumber = (char: string = ""): boolean => {
  const code = char.charCodeAt(0);
  const isNumber = code >= 48 && code <= 57; // ASCII 48-57 for 0-9

  return isNumber;
};

const isWhitespace = (char: string = ""): boolean => {
  const isWhitespace =
    char == " " || char == "\t" || char == "\n" || char == "\r";
  return isWhitespace;
};

export const tokenize = (code: string): Token[] => {
  const tokens: Token[] = [];
  const src = code.split(""); //Get each character from source code and convert to array of characters

  //Runs through each character until the end of code
  while (src.length > 0) {
    let c = src.shift(); // Get the current character

    if (isWhitespace(c)) continue;
    else if (c == "(") tokens.push(toToken(c, TokenType.OpenParenthesis));
    else if (c == ")") tokens.push(toToken(c, TokenType.CloseParenthesis));
    else if (c == "+" || c == "-" || c == "*" || c == "/" || c == "%")
      tokens.push(toToken(c, TokenType.BinaryOperator));
    else if (c == "=" && src[0] == "=")
      tokens.push(toToken(c + src.shift(), TokenType.BinaryOperator));
    else if (c == "=") tokens.push(toToken(c, TokenType.Equals));
    else if (c == ">" && src[0] == "=")
      tokens.push(toToken(c + src.shift(), TokenType.BinaryOperator));
    else if (c == "<" && src[0] == "=")
      tokens.push(toToken(c + src.shift(), TokenType.BinaryOperator));
    else if (c == "!" && src[0] == "=")
      tokens.push(toToken(c + src.shift(), TokenType.BinaryOperator));
    else if (c == ">") tokens.push(toToken(c, TokenType.BinaryOperator));
    else if (c == "<") tokens.push(toToken(c, TokenType.BinaryOperator));
    else if (c == "!") tokens.push(toToken(c, TokenType.UnaryOperator));
    else if (c == ";") tokens.push(toToken(c, TokenType.SemiColon));
    else if (c == ",") tokens.push(toToken(c, TokenType.Comma));
    else if (c == ":") tokens.push(toToken(c, TokenType.Colon));
    else if (c == ".") tokens.push(toToken(c, TokenType.Dot));
    else if (c == "{") tokens.push(toToken(c, TokenType.OpenBrace));
    else if (c == "}") tokens.push(toToken(c, TokenType.CloseBrace));
    else if (c == "[") tokens.push(toToken(c, TokenType.OpenBracket));
    else if (c == "]") tokens.push(toToken(c, TokenType.CloseBracket));
    else if (c == "#") {
      let comment = "";
      while (src.length > 0 && src[0] != "\n" && src[0] != "\r") {
        src.shift();
        comment += c;
      }
    } else {
      //For multicharacter tokens
      //Check for number literals
      if (isNumber(c)) {
        let number = c!; //Prevents possibly undefined TS warning using ! flag

        while (src.length > 0 && isNumber(src[0])) {
          c = src.shift();
          number += c;
        }

        tokens.push(toToken(number, TokenType.Number));
      } else if (c == '"') {
        //Check for strings
        let str = "";
        while (src.length > 0 && src[0] != '"' && src[0] != "\n") {
          c = src.shift();
          str += c;
        }
        if (src[0] != '"') {
          throw new Error("Missing ending quotation");
        }
        src.shift();
        tokens.push(toToken(str, TokenType.String));
      } else if (isAlphabet(c)) {
        //Check for identifier or keywords
        let identifier = c!;
        while (src.length > 0 && (isAlphabet(src[0]) || isNumber(src[0]))) {
          c = src.shift();
          identifier += c;
        }

        //Check if that identifier is a reserved keyword or actual identifier
        const keyword = keywords[identifier];
        if (typeof keyword == "string")
          tokens.push(toToken(identifier, keyword));
        else if (logicalOperators.includes(identifier))
          tokens.push(toToken(identifier, TokenType.BinaryOperator));
        else tokens.push(toToken(identifier, TokenType.Identifier));
      } else {
        throw new Error("Unrecognized character found :" + c);
      }
    }
  }

  tokens.push(toToken("EndOfFile", TokenType.EOF));
  return tokens;
};

export { TokenType };
