package ARMLex;

import java.util.ArrayList;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class ARMLex
{
	public static enum TokenType
	{
		// regex expressions of all Lexemes we care for
		// Note that order matters as all these regex expressions will be
		// grouped up in the order that they are described here		
		WHITESPACE("[ \t\f\r]+"),
		NEWLINE("\n"),
		COMMENT("@.+$"),
		STRING("\".+\""),
		
		LABEL("^\\S+:"),
		MACRO("^\\.[.\\w]+"),
		
		IMMEDIATE("#"),
		IMMEDIATEMEM("="),
		HEXIDECIMAL("0[xX][0-9a-fA-F]+"),
		DECIMAL("-?[0-9]+"),
		
		ARITHMETIC("[*|/|+|-]"),
		WRITEBACK("!"),
		
		BRACKETOPEN("\\["),
		BRACKETCLOSE("\\]"),
		
		PARENTHOPEN("\\("),
		PARENTHCLOSE("\\)"),
		
		REGLISTOPEN("\\{"),
		REGLISTCLOSE("\\}"),
		
		OPCODE(
			"adc|add|and"
			+ "b(l)?|bic|bx|"
			+ "cdp|cmn|cmp|eor|"
			+ "ldc|ldm|ldr|ldrb|"
			+ "mcr|mla|mov(w|t)?|mrc|mul|mvn"
			+ "orr|rsb|rsc|sbc|stc|stm|str|strb|sub|swi|teq|tst"
			),
		
		CONDITIONAL("eq|ne|cs|cc|mi|pl|vs|vc|hi|ls|ge|lt|gt|le|al|nv|hs|lo|ul"),
		
		ADDRMODE("da|ia|db|ib|fa|fd|ea|ed|bt|tb|sb|sh|t|b|h|s|l|p"),
		
		REGISTER("(([rR](\\d|(1[0-5])))|sl|fp|ip|sp|lr|pc)"),
		
		SHIFT("lsl|lsr|asr|ror|rrx|asl"),
		
		PARAMDELIM(","),
		WORD("[.\\w]+");

		public final String Pattern;

		private TokenType(String Pattern)
		{
			this.Pattern = Pattern;
		}
	}

	public static class Token
	{
		public TokenType Type;
		public String Value;
		public long LineNumber;

		public Token( TokenType Type, String Value)
		{
			this(Type,Value,0);
		}
		
		public Token( TokenType Type, String Value, long LineNumber)
		{
			this.Type = Type;
			this.Value = Value;
			this.LineNumber = LineNumber;
		}
		
		@Override
		public String toString()
		{
			return String.format(
					"( %d :  %s , \"%s\")",
					this.LineNumber,
					this.Type.name(),
					this.Value
					);
		}
	}
	
	public static ArrayList<Token> Lexigraph(String Input)
	{
		ArrayList<Token> Tokens = new ArrayList<Token>();
		
		StringBuffer Patterns = new StringBuffer();
		
		for(TokenType CurTokenType : TokenType.values())
		{
			// Generate string of named regex groups using all token enums
			// Named regex groups take the format "(?<group name> pattern )"
			Patterns.append(
				String.format(
					"|(?<%s>%s)",
					CurTokenType.name(),
					CurTokenType.Pattern
					)
				);
		}
		
		// Clips the first '|' character
		Pattern TokenPatterns = Pattern.compile(
			new String(Patterns.substring(1)),
			Pattern.MULTILINE
			);
		
		Matcher TokenMatcher= TokenPatterns.matcher(Input);
		
		long CurLine = 0;
		while(TokenMatcher.find())
		{
			for( TokenType CurTokenType : TokenType.values())
			{
				if(TokenMatcher.group(TokenType.WHITESPACE.name()) != null)
				{
					// Skip all whitespace so we have a clean token-map
					continue;
				}
				else if(TokenMatcher.group(CurTokenType.name()) != null)
				{
					Tokens.add(
						new Token(
							CurTokenType,
							TokenMatcher.group(CurTokenType.name()).replaceAll("\n", ""),
							CurLine
							)
						);
					if(CurTokenType == TokenType.NEWLINE)
					{
						CurLine++;
					}
				}
			}
		}
		
		return Tokens;
	}
	
	
}
