import { test as t, expect, describe } from "bun:test"
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
    IfStmt,
    type Stmt,
    CallExpr,
    Comment,
} from "../src/front/ast"

const parser = new Parser()

const genAST = (input: string) => parser.genAST(input)
const errFunc = (input: string) => () => genAST(input)

function test(name: string, input: string, output: Stmt[]) {
    t(name, () => expect(genAST(input)).toEqual(new Block(output)))
}

describe("Parse", () => {
    test("Basic", "1 + 1", [new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")])

    test("String", '"Hello World"', [new StringLiteral("Hello World")])

    test("Multiline", "a = 1\nb=2", [
        new AssignmentExpr(new Identifier("a"), new NumberLiteral("1")),
        new AssignmentExpr(new Identifier("b"), new NumberLiteral("2")),
    ])

    describe("Error", () => {
        t("Basic", () => {
            expect(errFunc("+")).toThrow(new Error("SyntaxError: Unexpected Token `+` on line 1 and column 1"))
        })

        t("End of File", () => {
            expect(errFunc("1+")).toThrow(new Error("SyntaxError: Unexpected End of File"))
        })

        t("Object Comma", () => {
            expect(errFunc("{a:1 b:10}")).toThrow(new Error("SyntaxError: Expected `,` on line 1 and column 6"))
        })

        t("Assignment Lefthand", () => {
            expect(errFunc("1 = 1")).toThrow(
                new Error("SyntaxError: Invalid Left hand of Assignment on line 1 and column 1")
            )
        })

        t("Coment", () => {
            expect(errFunc("1 + // hello")).toThrow(new Error("SyntaxError: Unexpected Comment on line 1 and column 5"))
        })
    })

    describe("Chaining", () => {
        test("Basic", "1 + 2 + 3", [
            new BinaryExpr(
                new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "+"),
                new NumberLiteral("3"),
                "+"
            ),
        ])

        test("Mixed", "1 - 2 + 3", [
            new BinaryExpr(
                new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "-"),
                new NumberLiteral("3"),
                "+"
            ),
        ])

        test("Mixed 2", "1 * 2 + 3", [
            new BinaryExpr(
                new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "*"),
                new NumberLiteral("3"),
                "+"
            ),
        ])

        test("Mixed 3", "1 * 2 / 3", [
            new BinaryExpr(
                new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("2"), "*"),
                new NumberLiteral("3"),
                "/"
            ),
        ])

        test("Mixed 4", "1 * 2 / 3 * 1", [
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
    })

    test("Parentheses", "(1 + 1) * 3", [
        new BinaryExpr(
            new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+", true),
            new NumberLiteral("3"),
            "*"
        ),
    ])

    describe("Assignment", () => {
        test("Basic", "a = 1", [new AssignmentExpr(new Identifier("a"), new NumberLiteral("1"))])

        test("Chain", "a = b = 1", [
            new AssignmentExpr(new Identifier("a"), new AssignmentExpr(new Identifier("b"), new NumberLiteral("1"))),
        ])

        test("Mixed", "a = 1 + 1", [
            new AssignmentExpr(
                new Identifier("a"),
                new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")
            ),
        ])

        test("Mixed Chain", "a = b = 1 + 1", [
            new AssignmentExpr(
                new Identifier("a"),
                new AssignmentExpr(
                    new Identifier("b"),
                    new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")
                )
            ),
        ])
    })

    describe("Dictionary", () => {
        test("Basic", "{a:1}", [new DictionaryLiteral([new Propety(new StringLiteral("a"), new NumberLiteral("1"))])])

        test("Multiple Keys", "{a:1, b:2}", [
            new DictionaryLiteral([
                new Propety(new StringLiteral("a"), new NumberLiteral("1")),
                new Propety(new StringLiteral("b"), new NumberLiteral("2")),
            ]),
        ])

        test("Key Shorthand", "{c}", [
            new DictionaryLiteral([new Propety(new StringLiteral("c"), new Identifier("c"))]),
        ])

        test("Multiple Shorthand", "{a, b, c}", [
            new DictionaryLiteral([
                new Propety(new StringLiteral("a"), new Identifier("a")),
                new Propety(new StringLiteral("b"), new Identifier("b")),
                new Propety(new StringLiteral("c"), new Identifier("c")),
            ]),
        ])

        test("Expression Key", "{1:1}", [
            new DictionaryLiteral([new Propety(new NumberLiteral("1"), new NumberLiteral("1"))]),
        ])

        test("Multiple Expression Key", '{"hello":1}', [
            new DictionaryLiteral([new Propety(new StringLiteral("hello"), new NumberLiteral("1"))]),
        ])

        test("Expression Shorthand", "{1}", [
            new DictionaryLiteral([new Propety(new NumberLiteral("1"), new NumberLiteral("1"))]),
        ])

        test("Multiple Expression Shorthand", '{1, 2, 3+4, "hello"}', [
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

        test("Identifier Key", "{a:=1}", [
            new DictionaryLiteral([new Propety(new Identifier("a"), new NumberLiteral("1"))]),
        ])

        test("Multiple Identifier Key", "{a:=1, b:=2, c:=d}", [
            new DictionaryLiteral([
                new Propety(new Identifier("a"), new NumberLiteral("1")),
                new Propety(new Identifier("b"), new NumberLiteral("2")),
                new Propety(new Identifier("c"), new Identifier("d")),
            ]),
        ])

        test("Mixed All", '{a:1, 2, c:3+4, d:=5, "hello":6}', [
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

        test("Trailling Comma", "{a:1,}", [
            new DictionaryLiteral([new Propety(new StringLiteral("a"), new NumberLiteral("1"))]),
        ])
    })

    describe("Control Flow", () => {
        test("Basic", "if (a) {a = 10}", [
            new IfStmt(
                new Identifier("a"),
                new Block([new AssignmentExpr(new Identifier("a"), new NumberLiteral("10"))])
            ),
        ])

        test("Multiline", "if (a) {\na = 10\n}", [
            new IfStmt(
                new Identifier("a"),
                new Block([new AssignmentExpr(new Identifier("a"), new NumberLiteral("10"))])
            ),
        ])

        test("Else", "if (a) {1} else {2}", [
            new IfStmt(new Identifier("a"), new Block([new NumberLiteral("1")]), new Block([new NumberLiteral("2")])),
        ])

        test("Else If", "if (a) {1} else if (b) {2} else {3}", [
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
    })

    describe("Function Call", () => {
        test("Basic", "print()", [new CallExpr(new Identifier("print"), [])])
        test("Arg", 'print("Hello World")', [new CallExpr(new Identifier("print"), [new StringLiteral("Hello World")])])
        test("Multiple Args", 'print("Hello", "World")', [
            new CallExpr(new Identifier("print"), [new StringLiteral("Hello"), new StringLiteral("World")]),
        ])
        test("Number", '1("Hello World")', [new CallExpr(new NumberLiteral("1"), [new StringLiteral("Hello World")])])
    })

    describe("Comment", () => {
        test("Basic", "//comment", [new Comment("comment")])
        test("Multiline", "//comment\n//another", [new Comment("comment"), new Comment("another")])
        test("Code", "1 + 1//comment", [
            new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+"),
            new Comment("comment"),
        ])
        test("Code Multiple", "1 + 1//comment\na + b//another", [
            new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+"),
            new Comment("comment"),
            new BinaryExpr(new Identifier("a"), new Identifier("b"), "+"),
            new Comment("another"),
        ])
    })
})
