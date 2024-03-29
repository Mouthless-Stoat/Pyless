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
    PreUnaryExpr,
    ListLiteral,
    IndexExpr,
    MethodExpr,
    BooleanExpr,
} from "../src/front/ast"

const parser = new Parser()

const genAST = (input: string) => parser.genAST(input)
const errTest = (name: string, input: string, err: string) =>
    t(name, () => expect(() => genAST(input)).toThrow(new Error(err)))

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
        errTest("Basic", "+", "SyntaxError: Unexpected Token `+` on line 1 and column 1")

        errTest("End of File", "1+", "SyntaxError: Unexpected End of File")

        errTest("Object Comma", "{a:1 b:10}", "SyntaxError: Expected `,` on line 1 and column 6")

        errTest("Assignment Lefthand", "1 = 1", "SyntaxError: Invalid left hand of assignment on line 1 and column 1")

        errTest("Comment", "1 + // hello", "SyntaxError: Unexpected Comment on line 1 and column 5")

        errTest("Method", "a.1", "SyntaxError: Expected Identifier on line 1 and column 3")

        errTest("Boolean Assignment", "T= 1", "SyntaxError: Invalid left hand of assignment on line 1 and column 1")
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

        test("Logical", "T && F", [new BinaryExpr(new BooleanExpr("T"), new BooleanExpr("F"), "&&")])
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

    describe("Prefix Unary", () => {
        test("Basic", "-1", [new PreUnaryExpr(new NumberLiteral("1"), "-")])
        test("with Binary", "1--1", [
            new BinaryExpr(new NumberLiteral("1"), new PreUnaryExpr(new NumberLiteral("1"), "-"), "-"),
        ])
        test("with Call", '-print("hello")', [
            new PreUnaryExpr(new CallExpr(new Identifier("print"), [new StringLiteral("hello")]), "-"),
        ])
    })

    describe("List", () => {
        test("Basic", "[1,2,3]", [
            new ListLiteral([new NumberLiteral("1"), new NumberLiteral("2"), new NumberLiteral("3")]),
        ])

        test("Expression", "[1+1,2-1,a=1]", [
            new ListLiteral([
                new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+"),
                new BinaryExpr(new NumberLiteral("2"), new NumberLiteral("1"), "-"),
                new AssignmentExpr(new Identifier("a"), new NumberLiteral("1")),
            ]),
        ])

        test("Nested", "[1, 2,[1,2,3]]", [
            new ListLiteral([
                new NumberLiteral("1"),
                new NumberLiteral("2"),
                new ListLiteral([new NumberLiteral("1"), new NumberLiteral("2"), new NumberLiteral("3")]),
            ]),
        ])
    })

    describe("Index", () => {
        test("Basic", "a[0]", [new IndexExpr(new Identifier("a"), new NumberLiteral("0"))])

        test("Expression", "a[1 + 1]", [
            new IndexExpr(new Identifier("a"), new BinaryExpr(new NumberLiteral("1"), new NumberLiteral("1"), "+")),
        ])

        test("Chain", "a[0][1][2][3]", [
            new IndexExpr(
                new IndexExpr(
                    new IndexExpr(new IndexExpr(new Identifier("a"), new NumberLiteral("0")), new NumberLiteral("1")),
                    new NumberLiteral("2")
                ),
                new NumberLiteral("3")
            ),
        ])

        test("Nest", "a[a[0]]", [
            new IndexExpr(new Identifier("a"), new IndexExpr(new Identifier("a"), new NumberLiteral("0"))),
        ])
    })

    describe("Method", () => {
        test("Basic", "a.a", [new MethodExpr(new Identifier("a"), new Identifier("a"))])

        test("Call", "a.a()", [new CallExpr(new MethodExpr(new Identifier("a"), new Identifier("a")), [])])

        test("Chain", "a.a.a", [
            new MethodExpr(new MethodExpr(new Identifier("a"), new Identifier("a")), new Identifier("a")),
        ])

        test("Chain", "a.a.a()", [
            new CallExpr(
                new MethodExpr(new MethodExpr(new Identifier("a"), new Identifier("a")), new Identifier("a")),
                []
            ),
        ])
    })
})
