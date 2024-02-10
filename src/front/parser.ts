import {
    Block,
    type Expr,
    type Stmt,
    BinaryExpr,
    type BinaryType,
    NumberLiteral,
    Identifier,
    AssignmentExpr,
    StringLiteral,
    Propety,
    DictionaryLiteral,
    isNodeType,
    NodeType,
    IfStmt,
    CallExpr,
    Comment,
    BinaryTokens,
    PreUnaryTokens,
    PostUnaryTokens,
    type PostUnaryType,
    PostUnaryExpr,
    type PreUnaryType,
    PreUnaryExpr,
} from "./ast"
import { TokenType, Token, tokenize } from "./lexer"

export default class Parser {
    tokens: Token[] = []

    private current(): Token {
        return this.tokens[0]
    }

    private notEOF(): boolean {
        return !this.current().isTypes(TokenType.EOF)
    }

    private next(): Token {
        return this.tokens.shift() as Token
    }

    private expect(type: TokenType, err: string, detail: boolean = true): Token {
        const tk = this.next()
        if (!tk || !tk.isTypes(type)) {
            throw err + (detail ? ` on line ${tk.row + 1} and column ${tk.col + 1}` : "")
        }
        return tk
    }

    private error(err: string, token: Token, auto: boolean = false): never {
        if (auto) err = `SyntaxError: Unexpected Token \`${token.val}\``
        if (token.isTypes(TokenType.EOF)) throw `SyntaxError: Unexpected End of File`
        throw err + ` on line ${token.row + 1} and column ${token.col + 1}`
    }

    private isTypes(...types: TokenType[]): boolean {
        return this.current().isTypes(...types)
    }

    private parseBlock(): Block {
        // short hand for block with single statement
        if (!this.isTypes(TokenType.OpenBrace)) return new Block([this.parseStmt()])

        this.expect(TokenType.OpenBrace, "SyntaxError: Expected `{`")
        const body: Stmt[] = []
        while (!this.isTypes(TokenType.CloseBrace)) {
            body.push(this.parseStmt())
        }
        this.expect(TokenType.CloseBrace, "SyntaxError: Expected `}`")
        return new Block(body)
    }

    private parseArgs(): Expr[] {
        this.expect(TokenType.OpenParen, "Pyless: Expected `(`")

        let args: Expr[] = []

        if (!this.isTypes(TokenType.CloseParen)) {
            args = [this.parseExpr()]
            while (this.isTypes(TokenType.Comma) && this.next()) {
                args.push(this.parseExpr())
            }
        }
        this.expect(TokenType.CloseParen, "SyntaxError: Expected `)`")

        return args
    }

    genAST(source: string): Block {
        const body: Stmt[] = []

        this.tokens = tokenize(source)

        while (this.notEOF() && this.tokens.length > 0) {
            body.push(this.parseStmt())
        }

        return new Block(body)
    }

    private parseStmt(): Stmt {
        switch (this.current().type) {
            case TokenType.If:
                return this.parseIfStmt()
            case TokenType.Comment:
                return new Comment(this.next().val)
            default:
                return this.parseExpr()
        }
    }

    private parseIfStmt(): Stmt {
        this.next() // eon the if token
        this.expect(TokenType.OpenParen, "SyntaxError: Expected `(`")
        const cond = this.parseExpr()
        this.expect(TokenType.CloseParen, "SyntaxError: Expected `)`")
        const body = this.parseBlock()

        let elseBlock
        if (this.isTypes(TokenType.Else)) {
            this.next() // eon else token
            elseBlock = this.parseBlock()
        }
        return new IfStmt(cond, body, elseBlock)
    }

    // Expression order
    // 1. Primary
    // 2. Call
    // 3. Prefix Unary
    // 4. Postfix Unary
    // 5. Binary
    // 6. Assignment

    private parseExpr(): Expr {
        return this.parseAssignmentExpr()
    }

    private parseAssignmentExpr(): Expr {
        const symTk = this.current()
        let sym = this.parseBinaryExpr()
        if (this.isTypes(TokenType.Equal)) {
            if (!isNodeType(sym, NodeType.Identifier)) this.error("SyntaxError: Invalid Left hand of Assignment", symTk)
            this.next()
            const val = this.parseExpr()
            return new AssignmentExpr(sym, val)
        }
        return sym
    }

    private parseBinaryExpr(): Expr {
        let left = this.parsePreUnary()
        while (this.isTypes(...Object.keys(BinaryTokens).map((t) => parseInt(t) as TokenType))) {
            const op = this.next().val as BinaryType
            const right = this.parsePreUnary()
            left = new BinaryExpr(left, right, op)
        }
        return left
    }

    private parsePreUnary(): Expr {
        if (!this.isTypes(...Object.keys(PreUnaryTokens).map((t) => parseInt(t) as TokenType))) {
            return this.parsePostUnary()
        }
        const op = this.next().val as PreUnaryType
        const expr = this.parsePreUnary()
        return new PreUnaryExpr(expr, op)
    }

    private parsePostUnary(): Expr {
        let expr = this.parseCallExpr()
        while (this.isTypes(...Object.keys(PostUnaryTokens).map((t) => parseInt(t) as TokenType))) {
            const op = this.next().val as PostUnaryType
            expr = new PostUnaryExpr(expr, op)
        }
        return expr
    }

    private parseCallExpr(): Expr {
        let caller = this.parsePrimary()
        while (this.isTypes(TokenType.OpenParen)) {
            const args = this.parseArgs()
            caller = new CallExpr(caller, args)
        }
        return caller
    }

    private parsePrimary(): Expr {
        switch (this.current().type) {
            case TokenType.Number:
                return new NumberLiteral(this.next().val)
            case TokenType.String:
                return new StringLiteral(this.next().val.slice(1, -1))
            case TokenType.Symbol:
                return new Identifier(this.next().val)
            case TokenType.OpenParen:
                this.next()
                const expr = this.parseExpr()
                // nullish cus if undefined then return true which get flip back to false
                if (!(expr.paren ?? true)) expr.paren = true
                this.expect(TokenType.CloseParen, "SyntaxError: Expected `)`")
                return expr
            case TokenType.OpenBrace:
                return this.parseDict()
            case TokenType.Comment:
                this.error("SyntaxError: Unexpected Comment", this.next())
            default:
                return this.error("", this.next(), true)
        }
    }

    private parseDict(): Expr {
        this.expect(TokenType.OpenBrace, "PylessBug: Expected `{`")
        const prop: Propety[] = []
        while (!this.isTypes(TokenType.CloseBrace)) {
            const keyTk = this.current()
            const key = this.parseExpr()

            let keyStr

            if (isNodeType(key, NodeType.Identifier)) keyStr = new StringLiteral((key as Identifier).symbol)

            if (this.isTypes(TokenType.Comma) || this.isTypes(TokenType.CloseBrace)) {
                if (this.isTypes(TokenType.Comma)) this.next()
                prop.push(new Propety(keyStr ?? key, key))
                continue
            }

            if (!this.isTypes(TokenType.Walrus, TokenType.Colon))
                this.error("SyntaxError: Expected `:` or `:=` ", this.current(), true)
            let isString = this.next().isTypes(TokenType.Colon)

            const val = this.parseExpr()

            if (!isNodeType(key, NodeType.Identifier) && !isString)
                this.error(`SyntaxError: Expected Identifier`, keyTk)

            prop.push(new Propety(isString ? keyStr ?? key : key, val))

            if (!this.isTypes(TokenType.CloseBrace)) {
                this.expect(TokenType.Comma, "SyntaxError: Expected `,`")
            }
        }

        this.expect(TokenType.CloseBrace, "SyntaxErrpr: Expected `}`")

        return new DictionaryLiteral(prop)
    }
}
