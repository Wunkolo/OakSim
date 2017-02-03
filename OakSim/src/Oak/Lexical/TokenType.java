package Oak.Lexical;

public enum TokenType
{
	// regex expressions of all Lexemes we care for
	// Note that order matters as all these regex expressions will be
	// grouped up in the order that they are described here		
	WHITESPACE("[ \t\f\r]+","whitespace"),
	NEWLINE("\n","newline"),
	COMMENT("@.+$","comment"),
	STRING("\".+\"","string literal"),
	
	LABEL("^\\S+:","label"),
	MACRO("^\\.[.\\w]+","macro"),
	
	IMMEDIATE("#","immediate literal"),
	IMMEDIATEMEM("=",""),
	HEXIDECIMAL("0[xX][0-9a-fA-F]+","hexidecimal literal"),
	DECIMAL("-?[0-9]+","decimal literal"),
	
	ARITHMETIC("[*|/|+|-]","arithmetic operation"),
	WRITEBACK("!","writeback flag"),
	
	BRACKETOPEN("\\[",""),
	BRACKETCLOSE("\\]",""),
	
	PARENTHOPEN("\\(","parenthesis"),
	PARENTHCLOSE("\\)","parenthesis"),
	
	REGLISTOPEN("\\{","register list"),
	REGLISTCLOSE("\\}","register list"),
	
	OPCODE(
		"adc|add|and"
		+ "b(l)?|bic|bx|"
		+ "cdp|cmn|cmp|eor|"
		+ "ldc|ldm|ldr|ldrb|"
		+ "mcr|mla|mov(w|t)?|mrc|mul|mvn"
		+ "orr|rsb|rsc|sbc|stc|stm|str|strb|sub|swi|teq|tst"
		,"mnemonic"
		),
	
	CONDITIONAL(
		"eq|ne|cs|cc|mi|pl|vs|vc|hi|ls|ge|lt|gt|le|al|nv|hs|lo|ul"
		,"conditional"
		),
	
	ADDRMODE(
		"da|ia|db|ib|fa|fd|ea|ed|bt|tb|sb|sh|t|b|h|s|l|p",
		"addressing mode"
		),
	
	REGISTER(
		"(([rR](\\d|(1[0-5])))|sl|fp|ip|sp|lr|pc)",
		"register"
			),
	
	SHIFT(
		"lsl|lsr|asr|ror|rrx|asl",
		"shift mode"
		),
	
	PARAMDELIM(
		",",
		"parameter delimiter"
		),
	
	IDENTIFIER(
		"[.\\w]+",
		"identifier"
		);

	// Regex expression
	public final String Pattern;
	// human-readable noun of the captured patterns
	// used for diagnostics such as "expected (Noun)"
	public final String Noun;

	private TokenType(String Pattern, String Noun)
	{
		this.Pattern = Pattern;
		this.Noun = Noun;
	}
}
