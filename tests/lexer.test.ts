import { test as t, expect, describe } from "bun:test"
import { Token, TokenType, tokenize as tkn } from "../src/front/lexer"

const tokenize = (input: string) => tkn(input, false)

function test(name: string, input: string, output: Token[]) {
    t(name, () => {
        expect(tokenize(input)).toEqual(output)
    })
}

describe("Lex", () => {
    test("Basic", "1 + 1", [
        new Token(TokenType.Number, 0, 0, "1"),
        new Token(TokenType.Plus, 0, 2, "+"),
        new Token(TokenType.Number, 0, 4, "1"),
    ])

    test("Long Symbol", "veryLongSymbolForNoReason", [new Token(TokenType.Symbol, 0, 0, "veryLongSymbolForNoReason")])

    test("List", "[1,2,3]", [
        new Token(TokenType.OpenBracket, 0, 0, "["),
        new Token(TokenType.Number, 0, 1, "1"),
        new Token(TokenType.Comma, 0, 2, ","),
        new Token(TokenType.Number, 0, 3, "2"),
        new Token(TokenType.Comma, 0, 4, ","),
        new Token(TokenType.Number, 0, 5, "3"),
        new Token(TokenType.CloseBracket, 0, 6, "]"),
    ])

    test("Multiline", "hello\n12", [
        new Token(TokenType.Symbol, 0, 0, "hello"),
        new Token(TokenType.Number, 1, 0, "12"),
    ])

    test("Keyword", "fn hello", [new Token(TokenType.Function, 0, 0, "fn"), new Token(TokenType.Symbol, 0, 3, "hello")])

    test("Number Method", "1.hello", [
        new Token(TokenType.Number, 0, 0, "1"),
        new Token(TokenType.Dot, 0, 1, "."),
        new Token(TokenType.Symbol, 0, 2, "hello"),
    ])

    describe("Number", () => {
        test("Negative Number", "-1", [new Token(TokenType.Minus, 0, 0, "-"), new Token(TokenType.Number, 0, 1, "1")])

        test("Negative Number 2", "-1-2", [
            new Token(TokenType.Minus, 0, 0, "-"),
            new Token(TokenType.Number, 0, 1, "1"),
            new Token(TokenType.Minus, 0, 2, "-"),
            new Token(TokenType.Number, 0, 3, "2"),
        ])

        test("Floating-point", "10.13", [new Token(TokenType.Number, 0, 0, "10.13")])

        test("Floating-point 2", "10.11 12.1934", [
            new Token(TokenType.Number, 0, 0, "10.11"),
            new Token(TokenType.Number, 0, 6, "12.1934"),
        ])

        test("Floating-point 3", "10.11.12.1934", [
            new Token(TokenType.Number, 0, 0, "10.11"),
            new Token(TokenType.Dot, 0, 5, "."),
            new Token(TokenType.Number, 0, 6, "12.1934"),
        ])

        test("Scientific Notation", "1e10", [new Token(TokenType.Number, 0, 0, "1e10")])

        test("Scientific Notation 2", "4e-10", [new Token(TokenType.Number, 0, 0, "4e-10")])

        test("Scientific Notation 3", "4e1.4", [
            new Token(TokenType.Number, 0, 0, "4e1"),
            new Token(TokenType.Dot, 0, 3, "."),
            new Token(TokenType.Number, 0, 4, "4"),
        ])

        test("Multiple Numbers", "11 2 333 4", [
            new Token(TokenType.Number, 0, 0, "11"),
            new Token(TokenType.Number, 0, 3, "2"),
            new Token(TokenType.Number, 0, 5, "333"),
            new Token(TokenType.Number, 0, 9, "4"),
        ])
    })

    describe("String", () => {
        test("Basic", '"Hello World"', [new Token(TokenType.String, 0, 0, '"Hello World"')])

        test("Escape", '"\\t\\r\\n"', [new Token(TokenType.String, 0, 0, '"\\t\\r\\n"')])

        test("Special", '"\t"', [new Token(TokenType.String, 0, 0, '"\t"')])
    })

    describe("Comment", () => {
        test("Basic", "// hello world", [new Token(TokenType.Comment, 0, 0, "hello world")])
        test("Code", "1 + 1 // hello world", [
            new Token(TokenType.Number, 0, 0, "1"),
            new Token(TokenType.Plus, 0, 2, "+"),
            new Token(TokenType.Number, 0, 4, "1"),
            new Token(TokenType.Comment, 0, 6, "hello world"),
        ])
        test("Multiline", "1 + 1 // hello world\na + b // another", [
            new Token(TokenType.Number, 0, 0, "1"),
            new Token(TokenType.Plus, 0, 2, "+"),
            new Token(TokenType.Number, 0, 4, "1"),
            new Token(TokenType.Comment, 0, 6, "hello world"),
            new Token(TokenType.Symbol, 1, 0, "a"),
            new Token(TokenType.Plus, 1, 2, "+"),
            new Token(TokenType.Symbol, 1, 4, "b"),
            new Token(TokenType.Comment, 1, 6, "another"),
        ])
        test("Empty", "1 + 1 //", [
            new Token(TokenType.Number, 0, 0, "1"),
            new Token(TokenType.Plus, 0, 2, "+"),
            new Token(TokenType.Number, 0, 4, "1"),
        ])
    })
})
