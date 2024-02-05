import { test, expect } from "bun:test"
import { Token, TokenType, tokenize } from "../src/frontend/lexer"

const EOF = new Token(TokenType.EOF, -1, -1, "EOF")

test("Basic", () => {
    expect(tokenize("1 + 1")).toEqual([
        new Token(TokenType.Number, 0, 0, "1"),
        new Token(TokenType.Symbol, 0, 2, "+"),
        new Token(TokenType.Number, 0, 4, "1"),
        EOF,
    ])
})

test("Long Symbol", () => {
    expect(tokenize("veryLongSymbolForNoReason")).toEqual([
        new Token(TokenType.Symbol, 0, 0, "veryLongSymbolForNoReason"),
        EOF,
    ])
})

test("List", () => {
    expect(tokenize("[1,2,3]")).toEqual([
        new Token(TokenType.OpenBracket, 0, 0, "["),
        new Token(TokenType.Number, 0, 1, "1"),
        new Token(TokenType.Comma, 0, 2, ","),
        new Token(TokenType.Number, 0, 3, "2"),
        new Token(TokenType.Comma, 0, 4, ","),
        new Token(TokenType.Number, 0, 5, "3"),
        new Token(TokenType.CloseBracket, 0, 6, "]"),
        EOF,
    ])
})

test("Long Numbers", () => {
    expect(tokenize("11 2 333 4")).toEqual([
        new Token(TokenType.Number, 0, 0, "11"),
        new Token(TokenType.Number, 0, 3, "2"),
        new Token(TokenType.Number, 0, 5, "333"),
        new Token(TokenType.Number, 0, 9, "4"),
        EOF,
    ])
})

test("Multi-line", () => {
    expect(tokenize("hello\n12")).toEqual([
        new Token(TokenType.Symbol, 0, 0, "hello"),
        new Token(TokenType.Number, 1, 0, "12"),
        EOF,
    ])
})

test("Keyword", () => {
    expect(tokenize("fn hello")).toEqual([
        new Token(TokenType.Function, 0, 0, "fn"),
        new Token(TokenType.Symbol, 0, 3, "hello"),
        EOF,
    ])
})
