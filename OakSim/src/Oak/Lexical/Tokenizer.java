package Oak.Lexical;

import java.util.ArrayList;
import java.util.regex.Pattern;
import Oak.*;
import java.util.regex.Matcher;

public class Tokenizer
{	
	public static ArrayList<Token> Tokenize(String Input)
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
