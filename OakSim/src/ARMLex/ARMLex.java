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
		
		LABEL("^.+:"),
		MACRO("^\\.\\w+"),
		
		IMMEDIATE("#"),
		HEXIDECIMAL("0[xX][0-9a-fA-F]+"),
		DECIMAL("-?[0-9]+"),
		
		ARITHMETIC("[*|/|+|-]"),
		
		BRACKETOPEN("\\["),
		BRACKETCLOSE("\\]"),
		
		PARENTHOPEN("\\("),
		PARENTHCLOSE("\\)"),
		
		REGLISTOPEN("\\{"),
		REGLISTCLOSE("\\}"),
		
		REGISTER("(([rR](\\d|(1[0-2])))|lr|sp|pc|apsr)"),
		
		COMMA(","),
		STRING("\".+\""),
		WORD("\\w+");

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

		public Token( TokenType Type, String Value )
		{
			this.Type = Type;
			this.Value = Value;
		}
		
		@Override
		public String toString()
		{
			return String.format(
					"( %s , \"%s\")",
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
		
		while(TokenMatcher.find())
		{
			for( TokenType CurTokenType : TokenType.values())
			{
				if(TokenMatcher.group(CurTokenType.name()) != null)
				{
					Tokens.add(
						new Token(CurTokenType,TokenMatcher.group(CurTokenType.name()))
						);
				}
			}
		}
		
		return Tokens;
	}
	
	
}
