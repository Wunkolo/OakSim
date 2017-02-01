


import java.util.ArrayList;
import ARMLex.*;

public class Main {
	public static void main(String[] Args)
	{
		String TestProgram = 
				".global _start\n"
				+ "_start: @Start of the program\n"
				+ "\tldr r0, [r1]\n"
				+ "\tstmia   r0!, {r3}\n"
				+ "\tldr     r3, [r1, r2, lsl #2]\n"
				+ "\tldr r0, [r1]\n"
				+ "\tadd     r2, r0, #16\n"
				+ "\tldr     r1,=obj_buffer\n"
				+ "\tldrcs   r3, [r1], #4\n"
				+ ".ascii \"Hello World\\n\"\n"
				+ "\tbx main\n";
		
		ArrayList<ARMLex.Token> Tokens = ARMLex.Lexigraph(TestProgram);
		
		for( ARMLex.Token CurToken : Tokens)
		{
			System.out.println(CurToken);
		}		
	}
}
