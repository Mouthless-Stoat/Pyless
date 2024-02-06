import { test, expect } from "bun:test"
import { Token, TokenType, tokenize } from "../src/front/lexer"

function addEOL(lines: Token[], line = 0): Token[] {
    return lines.concat(new Token(TokenType.EOL, line, -1, "EOL"))
}

test("Basic", () => {
    expect(tokenize("1 + 1")).toEqual(
        addEOL([
            new Token(TokenType.Number, 0, 0, "1"),
            new Token(TokenType.Plus, 0, 2, "+"),
            new Token(TokenType.Number, 0, 4, "1"),
        ])
    )
})

test("Long Symbol", () => {
    expect(tokenize("veryLongSymbolForNoReason")).toEqual(
        addEOL([new Token(TokenType.Symbol, 0, 0, "veryLongSymbolForNoReason")])
    )
})

test("List", () => {
    expect(tokenize("[1,2,3]")).toEqual(
        addEOL([
            new Token(TokenType.OpenBracket, 0, 0, "["),
            new Token(TokenType.Number, 0, 1, "1"),
            new Token(TokenType.Comma, 0, 2, ","),
            new Token(TokenType.Number, 0, 3, "2"),
            new Token(TokenType.Comma, 0, 4, ","),
            new Token(TokenType.Number, 0, 5, "3"),
            new Token(TokenType.CloseBracket, 0, 6, "]"),
        ])
    )
})

test("Long Numbers", () => {
    expect(tokenize("11 2 333 4")).toEqual(
        addEOL([
            new Token(TokenType.Number, 0, 0, "11"),
            new Token(TokenType.Number, 0, 3, "2"),
            new Token(TokenType.Number, 0, 5, "333"),
            new Token(TokenType.Number, 0, 9, "4"),
        ])
    )
})

test("Multi-line", () => {
    expect(tokenize("hello\n12")).toEqual(
        addEOL([new Token(TokenType.Symbol, 0, 0, "hello")]).concat(
            addEOL([new Token(TokenType.Number, 1, 0, "12")], 1)
        )
    )
})

test("Keyword", () => {
    expect(tokenize("fn hello")).toEqual(
        addEOL([new Token(TokenType.Function, 0, 0, "fn"), new Token(TokenType.Symbol, 0, 3, "hello")])
    )
})
