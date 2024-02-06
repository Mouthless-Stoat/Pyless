import { test, expect, describe } from "bun:test"
import Parser from "../src/front/parser"
import { trans } from "../src/transpile/transpiler"

const parser = new Parser()
function transpile(source: string) {
    return trans(parser.genAST(source), -1)
}

test("Basic", () => {
    expect(transpile("1 + 1")).toBe("1 + 1")
})

describe("Assignment", () => {
    test("Basic", () => {
        expect(transpile("a = 1")).toBe("a = 1")
    })

    test("Chain", () => {
        expect(transpile("a = b = 1")).toBe("a = b = 1")
    })

    test("Mixed", () => {
        expect(transpile("a = 1 + 1")).toBe("a = 1 + 1")
    })

    test("Mixed Chain", () => {
        expect(transpile("a = b = 1 + 1")).toBe("a = b = 1 + 1")
    })
})
