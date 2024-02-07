import { test, expect, describe } from "bun:test"
import Parser from "../src/front/parser"
import { BinaryExpr, NumberLiteral, Block, AssignmentExpr, Identifier, StringLiteral } from "../src/front/ast"

const parser = new Parser()

test("Basic", () => {
    expect(parser.genAST("1 + 1")).toEqual(
        new Block([new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")])
    )
})

test("String", () => {
    expect(parser.genAST('"Hello World"')).toEqual(new Block([new StringLiteral('"Hello World"')]))
})

describe("Error", () => {
    test("Basic", () => {
        expect(() => parser.genAST("+")).toThrow(new Error("SyntaxError: Unexpected Token `+` at line 1 and column 1"))
    })

    test("Unexpected EOF", () => {
        expect(() => parser.genAST("1+")).toThrow(new Error("SyntaxError: Unexpected End of Line on line 1"))
    })

    test("Unexpected Token", () => {
        expect(() => parser.genAST("1 2")).toThrow(
            new Error("SyntaxError: Unexpected Token `2` at line 1 and column 3")
        )
    })

    test("Multiline Unexpected Token", () => {
        expect(() => parser.genAST("1+1\n+1")).toThrow(
            new Error("SyntaxError: Unexpected Token `+` at line 2 and column 1")
        )
    })
})

describe("Chaining", () => {
    test("Basic", () => {
        expect(parser.genAST("1 + 2 + 3")).toEqual(
            new Block([
                new BinaryExpr(
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "+"),
                    new NumberLiteral("3"),
                    "+"
                ),
            ])
        )
    })

    test("Mixed", () => {
        expect(parser.genAST("1 - 2 + 3")).toEqual(
            new Block([
                new BinaryExpr(
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "-"),
                    new NumberLiteral("3"),
                    "+"
                ),
            ])
        )
    })

    test("Mixed 2", () => {
        expect(parser.genAST("1 * 2 + 3")).toEqual(
            new Block([
                new BinaryExpr(
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "*"),
                    new NumberLiteral("3"),
                    "+"
                ),
            ])
        )
    })

    test("Mixed 3", () => {
        expect(parser.genAST("1 * 2 / 3")).toEqual(
            new Block([
                new BinaryExpr(
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "*"),
                    new NumberLiteral("3"),
                    "/"
                ),
            ])
        )
    })

    test("Mixed 4", () => {
        expect(parser.genAST("1 * 2 / 3 * 1")).toEqual(
            new Block([
                new BinaryExpr(
                    new BinaryExpr(
                        new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "*"),
                        new NumberLiteral("3"),
                        "/"
                    ),
                    new NumberLiteral("1"),
                    "*"
                ),
            ])
        )
    })
})

describe("Order of Operation", () => {
    test("Basic", () => {
        expect(parser.genAST("1 + 2 * 3")).toEqual(
            new Block([
                new BinaryExpr(
                    new NumberLiteral("1"),
                    new BinaryExpr(new NumberLiteral("2"), new NumberLiteral("3"), "*"),
                    "+"
                ),
            ])
        )
    })

    test("Mixed", () => {
        expect(parser.genAST("1 * 2 + 3 / 4")).toEqual(
            new Block([
                new BinaryExpr(
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "*"),
                    new BinaryExpr(new NumberLiteral("3"), new NumberLiteral("4"), "/"),
                    "+"
                ),
            ])
        )
    })

    test("Parentheses", () => {
        expect(parser.genAST("(1 + 1) * 3")).toEqual(
            new Block([
                new BinaryExpr(
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+", true),
                    new NumberLiteral("3"),
                    "*"
                ),
            ])
        )
    })
})

describe("Assignment", () => {
    test("Basic", () => {
        expect(parser.genAST("a = 1")).toEqual(
            new Block([new AssignmentExpr(new Identifier("a"), new NumberLiteral("1"))])
        )
    })

    test("Chain", () => {
        expect(parser.genAST("a = b = 1")).toEqual(
            new Block([
                new AssignmentExpr(
                    new Identifier("a"),
                    new AssignmentExpr(new Identifier("b"), new NumberLiteral("1"))
                ),
            ])
        )
    })

    test("Mixed", () => {
        expect(parser.genAST("a = 1 + 1")).toEqual(
            new Block([
                new AssignmentExpr(
                    new Identifier("a"),
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")
                ),
            ])
        )
    })

    test("Mixed Chain", () => {
        expect(parser.genAST("a = b = 1 + 1")).toEqual(
            new Block([
                new AssignmentExpr(
                    new Identifier("a"),
                    new AssignmentExpr(
                        new Identifier("b"),
                        new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")
                    )
                ),
            ])
        )
    })
})
