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
    type Stmt,
    IfStmt,
} from "../src/front/ast"
import { generateHeapSnapshot } from "bun"

const parser = new Parser()

const genAST = (input: string) => parser.genAST(input)
const errFunc = (input: string) => () => genAST(input)

test("Basic", () => {
    expect(genAST("1 + 1")).toEqual(new Block([new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")]))
})

test("String", () => {
    expect(genAST('"Hello World"')).toEqual(new Block([new StringLiteral("Hello World")]))
})

describe("Error", () => {
    test("Basic", () => {
        expect(errFunc("+")).toThrow(new Error("SyntaxError: Unexpected Token `+` at line 1 and column 1"))
    })

    test("Object Comma", () => {
        expect(errFunc("{a:1 b:10}")).toThrow(new Error("SyntaxError: Expected `,` at line 1 and column 6"))
    })

    test("Assignment Lefthand", () => {
        expect(errFunc("1 = 1")).toThrow(
            new Error("SyntaxError: Invalid Left hand of Assignment at line 1 and column 1")
        )
    })
})

describe("Chaining", () => {
    test("Basic", () => {
        expect(genAST("1 + 2 + 3")).toEqual(
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
        expect(genAST("1 - 2 + 3")).toEqual(
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
        expect(genAST("1 * 2 + 3")).toEqual(
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
        expect(genAST("1 * 2 / 3")).toEqual(
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
        expect(genAST("1 * 2 / 3 * 1")).toEqual(
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

test("Parentheses", () => {
    expect(genAST("(1 + 1) * 3")).toEqual(
        new Block([
            new BinaryExpr(
                new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+", true),
                new NumberLiteral("3"),
                "*"
            ),
        ])
    )
})

describe("Assignment", () => {
    test("Basic", () => {
        expect(genAST("a = 1")).toEqual(new Block([new AssignmentExpr(new Identifier("a"), new NumberLiteral("1"))]))
    })

    test("Chain", () => {
        expect(genAST("a = b = 1")).toEqual(
            new Block([
                new AssignmentExpr(
                    new Identifier("a"),
                    new AssignmentExpr(new Identifier("b"), new NumberLiteral("1"))
                ),
            ])
        )
    })

    test("Mixed", () => {
        expect(genAST("a = 1 + 1")).toEqual(
            new Block([
                new AssignmentExpr(
                    new Identifier("a"),
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")
                ),
            ])
        )
    })

    test("Mixed Chain", () => {
        expect(genAST("a = b = 1 + 1")).toEqual(
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
        expect(genAST("{a:1}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new StringLiteral("a"), new NumberLiteral("1"))])])
        )
    })

    test("Multiple Keys", () => {
        expect(genAST("{a:1, b:2}")).toEqual(
            new Block([
                new DictionaryLiteral([
                    new Propety(new StringLiteral("a"), new NumberLiteral("1")),
                    new Propety(new StringLiteral("b"), new NumberLiteral("2")),
                ]),
            ])
        )
    })

    test("Key Shorthand", () => {
        expect(genAST("{c}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new StringLiteral("c"), new Identifier("c"))])])
        )
    })

    test("Multiple Shorthand", () => {
        expect(genAST("{a, b, c}")).toEqual(
            new Block([
                new DictionaryLiteral([
                    new Propety(new StringLiteral("a"), new Identifier("a")),
                    new Propety(new StringLiteral("b"), new Identifier("b")),
                    new Propety(new StringLiteral("c"), new Identifier("c")),
                ]),
            ])
        )
    })

    test("Expression Key", () => {
        expect(genAST("{1:1}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new NumberLiteral("1"), new NumberLiteral("1"))])])
        )
    })

    test("Multiple Expression Key", () => {
        expect(genAST('{"hello":1}')).toEqual(
            new Block([new DictionaryLiteral([new Propety(new StringLiteral("hello"), new NumberLiteral("1"))])])
        )
    })

    test("Expression Shorthand", () => {
        expect(genAST("{1}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new NumberLiteral("1"), new NumberLiteral("1"))])])
        )
    })

    test("Multiple Expression Shorthand", () => {
        expect(genAST('{1, 2, 3+4, "hello"}')).toEqual(
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
        expect(genAST("{a:=1}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new Identifier("a"), new NumberLiteral("1"))])])
        )
    })

    test("Multiple Identifier Key", () => {
        expect(genAST("{a:=1, b:=2, c:=d}")).toEqual(
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
        expect(genAST('{a:1, 2, c:3+4, d:=5, "hello":6}')).toEqual(
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
        expect(genAST("{a:1,}")).toEqual(
            new Block([new DictionaryLiteral([new Propety(new StringLiteral("a"), new NumberLiteral("1"))])])
        )
    })
})

describe("Control Flow", () => {
    test("Basic", () => {
        expect(genAST("if (a) {a = 10}")).toEqual(
            new Block([
                new IfStmt(
                    new Identifier("a"),
                    new Block([new AssignmentExpr(new Identifier("a"), new NumberLiteral("10"))])
                ),
            ])
        )
    })

    test("Multiline", () => {
        expect(genAST("if (a) {\na = 10\n}")).toEqual(
            new Block([
                new IfStmt(
                    new Identifier("a"),
                    new Block([new AssignmentExpr(new Identifier("a"), new NumberLiteral("10"))])
                ),
            ])
        )
    })

    test.todo("Else", () => {
        expect(genAST("if (a) {1} else {2}")).toEqual(
            new Block([
                new IfStmt(
                    new Identifier("a"),
                    new Block([new NumberLiteral("1")]),
                    new Block([new NumberLiteral("2")])
                ),
            ])
        )
    })

    test.todo("Else If", () => {
        expect(genAST("if (a) {1} else if (b) {2} else {3}")).toEqual(
            new Block([
                new IfStmt(
                    new Identifier("a"),
                    new Block([new NumberLiteral("1")]),
                    new Block([
                        new IfStmt(
                            new Identifier("b"),
                            new Block([new NumberLiteral("2")]),
                            new Block([new NumberLiteral("3")])
                        ),
                    ])
                ),
            ])
        )
    })
})
