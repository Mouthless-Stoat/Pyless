export enum TokenType {
    Number,
    String,
    Symbol,

    OpenParen,
    CloseParen,
    OpenBracket,
    CloseBracket,
    OpenBrace,
    CloseBrace,

    Comma,
    Dot,
    Plus,
    Minus,
    Star,
    Slash,
    Percent,
    Equal,
    Colon,
    Walrus,

    Function,
    If,
    Else,

    EOF,
}

const symbolToken = {
    "[": TokenType.OpenBracket,
    "]": TokenType.CloseBracket,
    "(": TokenType.OpenParen,
    ")": TokenType.CloseParen,
    "{": TokenType.OpenBrace,
    "}": TokenType.CloseBrace,
    ",": TokenType.Comma,
    ".": TokenType.Dot,
    "+": TokenType.Plus,
    "-": TokenType.Minus,
    "*": TokenType.Star,
    "/": TokenType.Slash,
    "%": TokenType.Percent,
    "=": TokenType.Equal,
    ":": TokenType.Colon,
} as const

const keywordToken = {
    fn: TokenType.Function,
    if: TokenType.If,
    else: TokenType.Else,
} as const

export class Token {
    type: TokenType
    row: number
    col: number
    val: string

    constructor(type: TokenType, row: number, col: number, val: string) {
        this.type = type
        this.row = row
        this.col = col
        this.val = val
    }

    isTypes(...types: TokenType[]) {
        return types.some((t) => this.type === t)
    }

    isSymbols(...symbols: (keyof typeof symbolToken)[]) {
        return symbols.some((s) => this.val === s)
    }
}

export function tokenize(input = "", addEOF = true): Token[] {
    const srcLines = input.replace("\r\n", "\n").split("\n") // window shit
    const tokens: Token[] = []

    // behold regex hell
    // if it only letter then it's a multi symbol (mul)
    // if it onlt number then it's a number (num)
    // else it's a symbol (sym)
    for (const [row, line] of srcLines.entries()) {
        for (const { groups: token, index: col } of line.matchAll(
            /(?<string>"(?:\\.|[^"\\])*")|(?<mul>[a-zA-Z]+)|(?<num>\d+(?:\.\d+)?(?:e-?\d+)?)|(?<sym>[^\s\n\t\r])/g
        )) {
            if (!token) throw `What is this token type`

            if (token.mul) {
                tokens.push(
                    new Token(
                        keywordToken[token.mul as keyof typeof keywordToken] ?? TokenType.Symbol,
                        row,
                        col ?? -1,
                        token.mul
                    )
                )
            } else if (token.sym) {
                tokens.push(
                    new Token(
                        symbolToken[token.sym as keyof typeof symbolToken] ?? TokenType.Symbol,
                        row,
                        col ?? -1,
                        token.sym
                    )
                )
            } else if (token.num) {
                tokens.push(new Token(TokenType.Number, row, col ?? -1, token.num))
            } else if (token.string) {
                tokens.push(new Token(TokenType.String, row, col ?? -1, token.string))
            }
        }
    }

    if (addEOF) tokens.push(new Token(TokenType.EOF, -1, -1, "EOF"))
    return tokens
}
