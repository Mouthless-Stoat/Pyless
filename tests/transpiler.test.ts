import { test as t, expect, describe } from "bun:test"
import Parser from "../src/front/parser"
import { trans } from "../src/transpile/transpiler"

const parser = new Parser()

function test(name: string, input: string, output: string) {
    t(name, () => {
        expect(trans(parser.genAST(input), -1)).toBe(output)
    })
}

function tdTest(name: string, input: string, output: string) {
    t.todo(name, () => {
        expect(trans(parser.genAST(input), -1)).toBe(output)
    })
}

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
    tdTest("Basic", "if (a) {a}", "if a: a")
    tdTest("Else", "if (a) {a} else {b}", "if a: a\nelse: b")
    tdTest("Else If", "if (a) {a} else if (b) {b}", "if a: a\nelif b: b")

    tdTest("Multiline", "if (a) {a b}", "if a:\n    a\n    b")
    tdTest("Multiline Else", "if (a) {a b} else {a b}", "if a:\n    a\n    b\nelse:\n    a\n    b")
    tdTest(
        "Multiline Else If",
        "if (a) {a b} else if (b) {a b} else {a b}",
        "if a:\n    a\n    b\nelif b:\n    a\n    b\nelse:\n    a\n    b"
    )
})
