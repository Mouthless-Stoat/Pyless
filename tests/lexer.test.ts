import { test, expect } from "bun:test"
import { Token, TokenType, tokenize } from "../src/frontend/lexer"

const EOF = new Token(TokenType.EOF, -1, -1, "EOF")

test("Basic", () => {
    expect(tokenize("1 + 1")).toEqual([
        new Token(TokenType.Number, 0, 0, "1"),
        new Token(TokenType.Symbol, 2, 0, "+"),
        new Token(TokenType.Number, 4, 0, "1"),
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
        new Token(TokenType.Number, 1, 0, "1"),
        new Token(TokenType.Comma, 2, 0, ","),
        new Token(TokenType.Number, 3, 0, "2"),
        new Token(TokenType.Comma, 4, 0, ","),
        new Token(TokenType.Number, 5, 0, "3"),
        new Token(TokenType.CloseBracket, 6, 0, "]"),
        EOF,
    ])
})

test("Long Numbers", () => {
    expect(tokenize("11 2 333 4")).toEqual([
        new Token(TokenType.Number, 0, 0, "11"),
        new Token(TokenType.Number, 3, 0, "2"),
        new Token(TokenType.Number, 5, 0, "333"),
        new Token(TokenType.Number, 9, 0, "4"),
        EOF,
    ])
})

test("Multi-line", () => {
    expect(tokenize("hello\n12")).toEqual([
        new Token(TokenType.Symbol, 0, 0, "hello"),
        new Token(TokenType.Number, 0, 1, "12"),
        EOF,
    ])
})
