import { test as t, expect, describe } from "bun:test"
import Parser from "../src/front/parser"
import { idc, trans } from "../src/transpile/transpiler"

const parser = new Parser()

function test(name: string, input: string, output: string) {
    t(name, () => {
        expect(trans(parser.genAST(input), -1)).toBe(output.replaceAll("\t", idc)) // replace tab with the indent char
    })
}

describe("Trans", () => {
    test("Basic", "1 + 1", "1 + 1")
    test("Multiline", "1 2 a = 3 4 + 5", "1\n2\na = 3\n4 + 5")

    describe("Binary Operation", () => {
        test("Basic", "1 + 2 + 3", "1 + 2 + 3")

        test("Parentheses", "(1 + 2) + 3", "(1 + 2) + 3")
        test("Parentheses 2", "(1 + 2) / 3", "(1 + 2) / 3")
        test("Parentheses 3", "1 *((2 +3)/ 4)", "1 * ((2 + 3) / 4)")
    })

    describe("Assignment", () => {
        test("Basic", "a = 1", "a = 1")

        test("Chain", "a = b = 1", "a = b = 1")
        test("Mixed", "a = 1 + 1", "a = 1 + 1")
        test("Mixed Chain", "a = b = 1 + 1", "a = b = 1 + 1")

        test("Expression", "(a = 1) + (b = 2)", "(a := 1) + (b := 2)")
        test("Expression 2", "1 + (a = b = 2)", "1 + (a := (b := 2))")
        test("Expression 3", "a = (b = 1) + (c = 2)", "a = (b := 1) + (c := 2)")

        test("Side by Side", "a=1 b=2", "a = 1\nb = 2")
    })

    describe("Dictionary", () => {
        test("Basic", "{a:1}", '{ "a": 1 }')

        // single case
        test("Keys Shorthand", "{c}", '{ "c": c }')
        test("Expression Key", "{1}", "{ 1: 1 }")
        test("Identifier Key", "{a:=1}", "{ a: 1 }")

        // multiple case
        test("Multiple Keys", "{a:1, b:2}", '{ "a": 1, "b": 2 }')
        test("Multiple Expression Key", "{1, 2}", "{ 1: 1, 2: 2 }")
        test("Multiple Shorthand", "{a,b,c}", '{ "a": a, "b": b, "c": c }')
        test("Multiple Identifier Key", "{ a:=1, b:=2}", "{ a: 1, b: 2 }")

        // all hell broke loose
        test("Mixed All", '{a:1, 2, c:3+4, d:=5, "hello":6}', '{ "a": 1, 2: 2, "c": 3 + 4, d: 5, "hello": 6 }')
    })

    describe("Control Flow", () => {
        test("Basic", "if (a) {a}", "if a: a")
        test("Else", "if (a) {a} else {b}", "if a: a\nelse: b")
        test("Else If", "if (a) {a} else if (b) {b}", "if a: a\nelif b: b")

        test("Shorthand", "if (a) a", "if a: a")
        test("Shorthand Else", "if (a) a else b", "if a: a\nelse: b")
        test("Shorthand Else If", "if (a) a else if (b) b else c", "if a: a\nelif b: b\nelse: c")

        test("Multiline", "if (a) {a b}", "if a:\n\ta\n\tb")
        test("Multiline Else", "if (a) {a b} else {a b}", "if a:\n\ta\n\tb\nelse:\n\ta\n\tb")
        test(
            "Multiline Else If",
            "if (a) {a b} else if (b) {a b} else {a b}",
            "if a:\n\ta\n\tb\nelif b:\n\ta\n\tb\nelse:\n\ta\n\tb"
        )

        test("Nested", "if (a) {a\nif (a){a b}}", "if a:\n\ta\n\tif a:\n\t\ta\n\t\tb")
        test(
            "Nested 2",
            "if (a) {a\nif (a){a if (a) {a b}}}",
            "if a:\n\ta\n\tif a:\n\t\ta\n\t\tif a:\n\t\t\ta\n\t\t\tb"
        )
    })

    describe("Function Call", () => {
        test("Basic", "print()", "print()")
        test("Arg", 'print("Hello World")', 'print("Hello World")')
        test("Multiple Args", 'print("Hello", "World")', 'print("Hello", "World")')
    })

    describe("Comment", () => {
        test("Basic", "//hello world", "# hello world")
        test("Multiline", "1 + 1 //hello world\n1 + 1 //another", "1 + 1 # hello world\n1 + 1 # another")
        test("Code", "1 + 1 //hello world", "1 + 1 # hello world")
    })

    describe("Prefix Unary", () => {
        test("Basic", "-1", "-1")
        test("with Binary", "1--1", "1 - -1")
        test("with Call", "-a", "-a")
    })
})
