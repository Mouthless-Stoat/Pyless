import { test, expect, describe } from "bun:test"
import Parser from "../src/front/parser"
import { trans as tr } from "../src/transpile/transpiler"

const parser = new Parser()
function trans(source: string) {
    return tr(parser.genAST(source), -1)
}

test("Basic", () => {
    expect(trans("1 + 1")).toBe("1 + 1")
})

test("Multiline", () => {
    expect(trans("1 2 a = 3 4 + 5")).toBe("1\n2\na = 3\n4 + 5")
})

describe("Binary Operation", () => {
    test("Basic", () => {
        expect(trans("1 + 2 + 3")).toBe("1 + 2 + 3")
    })

    test("Parentheses", () => {
        expect(trans("(1 + 2) + 3")).toBe("(1 + 2) + 3")
    })

    test("Parentheses 2", () => {
        expect(trans("(1 + 2) / 3")).toBe("(1 + 2) / 3")
    })

    test("Parentheses 3", () => {
        expect(trans("1 *((2 +3)/ 4)")).toBe("1 * ((2 + 3) / 4)")
    })
})

describe("Assignment", () => {
    test("Basic", () => {
        expect(trans("a = 1")).toBe("a = 1")
    })

    test("Chain", () => {
        expect(trans("a = b = 1")).toBe("a = b = 1")
    })

    test("Mixed", () => {
        expect(trans("a = 1 + 1")).toBe("a = 1 + 1")
    })

    test("Mixed Chain", () => {
        expect(trans("a = b = 1 + 1")).toBe("a = b = 1 + 1")
    })

    test("Expression", () => {
        expect(trans("(a = 1) + (b = 2)")).toBe("(a := 1) + (b := 2)")
    })

    test("Expression 2", () => {
        expect(trans("1 + (a = b = 2)")).toBe("1 + (a := (b := 2))")
    })

    test("Expression 3", () => {
        expect(trans("a = (b = 1) + (c = 2)")).toBe("a = (b := 1) + (c := 2)")
    })

    test("Side by Side", () => {
        expect(trans("a=1 b=2")).toBe("a = 1\nb = 2")
    })
})
