import { test, expect, describe } from "bun:test"
import Parser from "../src/front/parser"
import {
    BinaryExpr,
    NumberLiteral,
    Block,
    AssignmentExpr,
    Identifier,
    StringLiteral,
    DictionaryLiteral,
    Propety,
} from "../src/front/ast"

const parser = new Parser()

test("Basic", () => {
    expect(parser.genAST("1 + 1")).toEqual(
        new Block([new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")])
    )
})

test("String", () => {
    expect(parser.genAST('"Hello World"')).toEqual(new Block([new StringLiteral("Hello World")]))
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

    test("Object Comma", () => {
        expect(() => parser.genAST("{a:1 b:10}")).toThrow(new Error("SyntaxError: Expected `,` at line 0 and column 5"))
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

describe("Object", () => {
    test("Basic", () => {
        expect(parser.genAST("{a:1}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new StringLiteral("a"), new NumberLiteral("1"))])])
        )
    })

    test("Multiple Keys", () => {
        expect(parser.genAST("{a:1, b:2}")).toEqual(
            new Block([
                new DictionaryLiteral([
                    new Propety(new StringLiteral("a"), new NumberLiteral("1")),
                    new Propety(new StringLiteral("b"), new NumberLiteral("2")),
                ]),
            ])
        )
    })

    test("Keys Shorthand", () => {
        expect(parser.genAST("{c}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new StringLiteral("c"), new Identifier("c"))])])
        )
    })

    test("Multiple Shorthand", () => {
        expect(parser.genAST("{a, b, c}")).toEqual(
            new Block([
                new DictionaryLiteral([
                    new Propety(new StringLiteral("a"), new Identifier("a")),
                    new Propety(new StringLiteral("b"), new Identifier("b")),
                    new Propety(new StringLiteral("c"), new Identifier("c")),
                ]),
            ])
        )
    })

    test("Mixed Shorthand", () => {
        expect(parser.genAST('{a:1, b:c, c, d:"hello"}')).toEqual(
            new Block([
                new DictionaryLiteral([
                    new Propety(new StringLiteral("a"), new NumberLiteral("1")),
                    new Propety(new StringLiteral("b"), new Identifier("c")),
                    new Propety(new StringLiteral("c"), new Identifier("c")),
                    new Propety(new StringLiteral("d"), new StringLiteral("hello")),
                ]),
            ])
        )
    })

    test("Expression Key", () => {
        expect(parser.genAST("{1:1}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new NumberLiteral("1"), new NumberLiteral("1"))])])
        )
    })

    test("Multiple Expression Key", () => {
        expect(parser.genAST('{"hello":1}')).toEqual(
            new Block([new DictionaryLiteral([new Propety(new StringLiteral("hello"), new NumberLiteral("1"))])])
        )
    })

    test("Expression Shorthand", () => {
        expect(parser.genAST("{1}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new NumberLiteral("1"), new NumberLiteral("1"))])])
        )
    })

    test("Multiple Expression Shorthand", () => {
        expect(parser.genAST('{1, 2, 3+4, "hello"}')).toEqual(
            new Block([
                new DictionaryLiteral([
                    new Propety(new NumberLiteral("1"), new NumberLiteral("1")),
                    new Propety(new NumberLiteral("2"), new NumberLiteral("2")),
                    new Propety(
                        new BinaryExpr(new NumberLiteral("3"), new NumberLiteral("4"), "+"),
                        new BinaryExpr(new NumberLiteral("3"), new NumberLiteral("4"), "+")
                    ),
                    new Propety(new StringLiteral("hello"), new StringLiteral("hello")),
                ]),
            ])
        )
    })

    test("Identifier Key", () => {
        expect(parser.genAST("{a:=1}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new Identifier("a"), new NumberLiteral("1"))])])
        )
    })

    test("Multiple Identifier Key", () => {
        expect(parser.genAST("{a:=1, b:=2, c:=d}")).toEqual(
            new Block([
                new DictionaryLiteral([
                    new Propety(new Identifier("a"), new NumberLiteral("1")),
                    new Propety(new Identifier("b"), new NumberLiteral("2")),
                    new Propety(new Identifier("c"), new Identifier("d")),
                ]),
            ])
        )
    })

    test("Mixed All", () => {
        expect(parser.genAST('{a:1, 2, c:3+4, d:=5, "hello":6}')).toEqual(
            new Block([
                new DictionaryLiteral([
                    new Propety(new StringLiteral("a"), new NumberLiteral("1")),
                    new Propety(new NumberLiteral("2"), new NumberLiteral("2")),
                    new Propety(
                        new StringLiteral("c"),
                        new BinaryExpr(new NumberLiteral("3"), new NumberLiteral("4"), "+")
                    ),
                    new Propety(new Identifier("d"), new NumberLiteral("5")),
                    new Propety(new StringLiteral("hello"), new NumberLiteral("6")),
                ]),
            ])
        )
    })

    test("Trailling Comma", () => {
        expect(parser.genAST("{a:1,}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new StringLiteral("a"), new NumberLiteral("1"))])])
        )
    })
})
