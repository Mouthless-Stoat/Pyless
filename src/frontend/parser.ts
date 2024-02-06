import { Program, type Expr, type Stmt, BinaryExpr, type BinaryType, NumberLiteral, Identifier } from "./ast"
import { TokenType, Token, tokenize } from "./lexer"

const Multiplicative = [TokenType.Star, TokenType.Slash] as const
const Additive = [TokenType.Plus, TokenType.Minus] as const

export default class Parser {
    lines: Token[][] = []
    currentLine: Token[] = []

    private current(): Token {
        return this.currentLine[0]
    }

    private next(): Token {
        return this.currentLine.shift() as Token
    }

    private expect(type: TokenType, err: string): Token {
        const tk = this.next()
        if (!tk || !tk.isTypes(type)) {
            throw err
        }
        return tk
    }

    genAST(source: string): Program {
        const body: Stmt[] = []
        this.lines = tokenize(source)

        for (const [i, line] of this.lines.entries()) {
            this.currentLine = line
            while (this.currentLine.length > 0) {
                body.push(this.parseStmt())
                this.expect(TokenType.EOL, `SyntaxError: Expected End of Line on line ${i + 1}`)
            }
        }

        return new Program(body)
    }

    private parseStmt(): Stmt {
        return this.parseExpr()
    }

    private parseExpr(): Expr {
        return this.parseAdditiveExpr()
    }

    private parseAdditiveExpr(): Expr {
        let left = this.parseMutiplicativeExpr()
        while (this.current().isTypes(...Additive)) {
            const op = this.next().val as BinaryType
            const right = this.parseMutiplicativeExpr()
            left = new BinaryExpr(left, right, op)
        }
        return left
    }

    private parseMutiplicativeExpr(): Expr {
        let left = this.parsePrimary()
        while (this.current().isTypes(...Multiplicative)) {
            const op = this.next().val as BinaryType
            const right = this.parsePrimary()
            left = new BinaryExpr(left, right, op)
        }
        return left
    }

    private parsePrimary(): Expr {
        switch (this.current().type) {
            case TokenType.Number:
                return new NumberLiteral(this.next().val)
            case TokenType.Symbol:
                return new Identifier(this.next().val)
            default:
                const token = this.current()
                if (token.isTypes(TokenType.EOL)) throw `SyntaxError: Unexpected End of Line on line ${token.row + 1}`
                throw `SyntaxError: Unexpected Token ${token.val} at line ${token.row + 1} and column ${token.col + 1}`
        }
    }
}
