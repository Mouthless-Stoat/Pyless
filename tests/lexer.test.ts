import { test, expect, describe } from "bun:test"
import { Token, TokenType, tokenize as tkn } from "../src/front/lexer"

const tokenize = (input: string) => tkn(input, false)

test("Basic", () => {
    expect(tokenize("1 + 1")).toEqual([
        new Token(TokenType.Number, 0, 0, "1"),
        new Token(TokenType.Plus, 0, 2, "+"),
        new Token(TokenType.Number, 0, 4, "1"),
    ])
})

test("Long Symbol", () => {
    expect(tokenize("veryLongSymbolForNoReason")).toEqual([
        new Token(TokenType.Symbol, 0, 0, "veryLongSymbolForNoReason"),
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
    ])
})

test("Multi-line", () => {
    expect(tokenize("hello\n12")).toEqual([
        new Token(TokenType.Symbol, 0, 0, "hello"),
        new Token(TokenType.Number, 1, 0, "12"),
    ])
})

test("Keyword", () => {
    expect(tokenize("fn hello")).toEqual([
        new Token(TokenType.Function, 0, 0, "fn"),
        new Token(TokenType.Symbol, 0, 3, "hello"),
    ])
})

describe("Number", () => {
    test("Negative Number", () => {
        expect(tokenize("-1")).toEqual([new Token(TokenType.Minus, 0, 0, "-"), new Token(TokenType.Number, 0, 1, "1")])
    })

    test("Negative Number 2", () => {
        expect(tokenize("-1-2")).toEqual([
            new Token(TokenType.Minus, 0, 0, "-"),
            new Token(TokenType.Number, 0, 1, "1"),
            new Token(TokenType.Minus, 0, 2, "-"),
            new Token(TokenType.Number, 0, 3, "2"),
        ])
    })

    test("Floating-point", () => {
        expect(tokenize("10.13")).toEqual([new Token(TokenType.Number, 0, 0, "10.13")])
    })

    test("Floating-point 2", () => {
        expect(tokenize("10.11 12.1934")).toEqual([
            new Token(TokenType.Number, 0, 0, "10.11"),
            new Token(TokenType.Number, 0, 6, "12.1934"),
        ])
    })

    test("Floating-point 3", () => {
        expect(tokenize("10.11.12.1934")).toEqual([
            new Token(TokenType.Number, 0, 0, "10.11"),
            new Token(TokenType.Dot, 0, 5, "."),
            new Token(TokenType.Number, 0, 6, "12.1934"),
        ])
    })

    test("Scientific Notation", () => {
        expect(tokenize("1e10")).toEqual([new Token(TokenType.Number, 0, 0, "1e10")])
    })

    test("Scientific Notation 2", () => {
        expect(tokenize("4e-10")).toEqual([new Token(TokenType.Number, 0, 0, "4e-10")])
    })

    test("Scientific Notation 3", () => {
        expect(tokenize("4e1.4")).toEqual([
            new Token(TokenType.Number, 0, 0, "4e1"),
            new Token(TokenType.Dot, 0, 3, "."),
            new Token(TokenType.Number, 0, 4, "4"),
        ])
    })

    test("Multiple Numbers", () => {
        expect(tokenize("11 2 333 4")).toEqual([
            new Token(TokenType.Number, 0, 0, "11"),
            new Token(TokenType.Number, 0, 3, "2"),
            new Token(TokenType.Number, 0, 5, "333"),
            new Token(TokenType.Number, 0, 9, "4"),
        ])
    })
})

describe("String", () => {
    test("Basic", () => {
        expect(tokenize('"Hello World"')).toEqual([new Token(TokenType.String, 0, 0, '"Hello World"')])
    })

    test("Escape", () => {
        expect(tokenize('"\\t\\r\\n"')).toEqual([new Token(TokenType.String, 0, 0, '"\\t\\r\\n"')])
    })

    test("Special", () => {
        expect(tokenize('"\t"')).toEqual([new Token(TokenType.String, 0, 0, '"\t"')])
    })
})
