package Oak.Lexical;

public class Token
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
				this.Type.Noun,
				this.Value
				);
	}
}
