import { test, expect, describe } from "bun:test"
import Parser from "../src/frontend/parser"
import { BinaryExpr, NumberLiteral, Program } from "../src/frontend/ast"

const parser = new Parser()

test("Basic", () => {
    expect(parser.genAST("1 + 1")).toEqual(
        new Program([new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")])
    )
})

describe("Error", () => {
    test("Unexpected EOF", () => {
        expect(() => parser.genAST("1+")).toThrow("SyntaxError: Unexpected End of Line on line 1")
    })

    test("Unexpected Token", () => {
        expect(() => parser.genAST("+")).toThrow("SyntaxError: Unexpected Token + at line 1 and column 1")
    })

    test("Multiline Unexpected Token", () => {
        expect(() => parser.genAST("1+1\n+1")).toThrow("SyntaxError: Unexpected Token + at line 2 and column 1")
    })
})
describe("Chaining", () => {
    test("Basic", () => {
        expect(parser.genAST("1 + 2 + 3")).toEqual(
            new Program([
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
            new Program([
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
            new Program([
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
            new Program([
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
            new Program([
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
            new Program([
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
            new Program([
                new BinaryExpr(
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "*"),
                    new BinaryExpr(new NumberLiteral("3"), new NumberLiteral("4"), "/"),
                    "+"
                ),
            ])
        )
    })
})
