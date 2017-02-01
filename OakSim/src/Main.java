


import java.util.ArrayList;
import ARMLex.*;

public class Main {
	public static void main(String[] Args)
	{
		String TestProgram = "main: @Start of the program\n\tldr r0, [r1]\n\tmov    r0, #(0x1 * 5)\n\tmov    r0, #01\n\tbx      lr";
		
		ArrayList<ARMLex.Token> Tokens = ARMLex.Lexigraph(TestProgram);
		
		for( ARMLex.Token CurToken : Tokens)
		{
			System.out.println(CurToken);
		}
		
		
	}
}
