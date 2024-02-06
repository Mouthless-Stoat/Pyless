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
