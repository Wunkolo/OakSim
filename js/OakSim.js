function HexByte(Value)
{
	Value = Value < 0 ? ( Value += 0x100 ) : Value;
	var Str = "00" + Value.toString(16).toUpperCase();
	return Str.slice(-2);
}


// OakSim Model
var Context = ( function()
{
	/// Methods

	// Assembles current user-code
	this.Assemble = function(Source)
	{
		var ElmMemory = document.getElementById("memory");
		// Context.CodeMirrorInst.getAllMarks().map(
		// 	function( Mark )
		// 	{
		// 		Mark.clear();
		// 	}
		// );

		var Assembled = this.Keystone.asm(Source);
		if (Assembled.failed === true)
		{
			console.log("Error assembling");
			// CodeMirrorInst.markText(
			// 	{line: Assembled.count, ch: 0},
			// 	{line: Assembled.count+1, ch: 0},
			// 	{
			// 		css: "background-color:red"
			// 	}
			// );

			// CodeMirrorInst.markText(
			// 	{line: Assembled.count+1, ch: 0},
			// 	{line: CodeMirrorInst.lineCount(), ch: 0},
			// 	{
			// 		css: "opacity: 0.5"
			// 	}
			// );
			return;
		}

		var MachineCode = Assembled.mc;
		this.Reset();
		this.Unicorn.mem_write(0x10000, MachineCode);
	};

	// Print message to diagnostic log
	this.Log = function(Message)
	{
		document.getElementById("messages").innerHTML = "<span>"
			+ Message
			+ "</span><br>"
			+ document.getElementById("messages").innerHTML;
	};

	// Private util methods
	var Colors = ["#e0e0e0", "#90a959", "#6a9fb5", "#ac4142", "#aa759f", "#f4bf75"];
	var StyleByte = function(Byte)
	{
		var Hex = ( "00" + Byte.toString(16).toUpperCase() ).slice(-2);
		if (Byte === 0x00)
		{
			Hex = "<span style=\"color:#313032\">" + Hex + "</span>";
		}
		else
		{
			Hex = "<span style=\"color:" + Colors[Byte % Colors.length] + "\">" + Hex + "</span>";
		}
		return Hex;
	};
	var AsciiByte = function(Byte)
	{
		if (( Byte > 31 ) && ( Byte < 127 ))
		{
			return "<span style=\"color:" + Colors[Byte % Colors.length] + "\">" + String.fromCharCode(Byte) + "</span>";
		}
		return "<span style=\"color:#313032\">.</span>";
	};
	var HexDump = function(Bytes, Offset, Length, Width)
	{
		Offset = Offset || 0;
		Length = Length || Math.min(Bytes.length, 1024);
		Width = Width || 16;
		var Out = "";

		for (var i = 0; i < Length; i += Width)
		{
			var LineBytes = Bytes.slice(i, i + Width);
			var Hex = LineBytes.reduce(
				function(Line, i)
				{
					return Line + " " + StyleByte(i);
				},
				"0x" + ( "00000000" + ( i + Offset ).toString(16).toUpperCase() ).slice(-8) + ":");
			Out += Hex
				+ LineBytes.reduce(
					function(Print, i)
					{
						return Print + AsciiByte(i);
					},
					" ")
				+ "<br>";
		}
		return Out;
	};
	this.DrawMemory = function()
	{
		document.getElementById("memory").innerHTML = HexDump(
			this.Unicorn.mem_read(0x10000, 4 * 1024),
			0x10000
		);
	};
	this.DrawRegisters = function()
	{
		document.getElementById("registers").innerHTML =
			"Registers:<br>"
			+ "&emsp;r0 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R0).toString(16)
			+ "<br>"
			+ "&emsp;r1 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R1).toString(16)
			+ "<br>"
			+ "&emsp;r2 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R2).toString(16)
			+ "<br>"
			+ "&emsp;r3 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R3).toString(16)
			+ "<br>"
			+ "&emsp;r4 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R4).toString(16)
			+ "<br>"
			+ "&emsp;r5 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R5).toString(16)
			+ "<br>"
			+ "&emsp;r6 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R6).toString(16)
			+ "<br>"
			+ "&emsp;r7 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R7).toString(16)
			+ "<br>"
			+ "&emsp;r8 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R8).toString(16)
			+ "<br>"
			+ "&emsp;r9 : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R9).toString(16)
			+ "<br>"
			+ "&emsp;r10: "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R10).toString(16)
			+ "<br>"
			+ "&emsp;r11: "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R11).toString(16)
			+ "<br>"
			+ "&emsp;r12: "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_R12).toString(16)
			+ "<br>"
			+ "&emsp;SP : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_SP).toString(16)
			+ "<br>"
			+ "&emsp;LR : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_LR).toString(16)
			+ "<br>"
			+ "&emsp;PC : "
			+ this.Unicorn.reg_read_i32(uc.ARM_REG_PC).toString(16)
			+ "<br>";
		document.getElementById("registers").innerHTML +=
			"&emsp;s0 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S0)
			+ "<br>"
			+ "&emsp;s1 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S1)
			+ "<br>"
			+ "&emsp;s2 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S2)
			+ "<br>"
			+ "&emsp;s3 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S3)
			+ "<br>"
			+ "&emsp;s4 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S4)
			+ "<br>"
			+ "&emsp;s5 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S5)
			+ "<br>"
			+ "&emsp;s6 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S6)
			+ "<br>"
			+ "&emsp;s7 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S7)
			+ "<br>"
			+ "&emsp;s8 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S8)
			+ "<br>"
			+ "&emsp;s9 : "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S9)
			+ "<br>"
			+ "&emsp;s10: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S10)
			+ "<br>"
			+ "&emsp;s11: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S11)
			+ "<br>"
			+ "&emsp;s12: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S12)
			+ "<br>"
			+ "&emsp;s13: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S13)
			+ "<br>"
			+ "&emsp;s14: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S14)
			+ "<br>"
			+ "&emsp;s15: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S15)
			+ "<br>"
			+ "&emsp;s16: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S16)
			+ "<br>"
			+ "&emsp;s17: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S17)
			+ "<br>"
			+ "&emsp;s18: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S18)
			+ "<br>"
			+ "&emsp;s19: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S19)
			+ "<br>"
			+ "&emsp;s20: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S20)
			+ "<br>"
			+ "&emsp;s21: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S21)
			+ "<br>"
			+ "&emsp;s22: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S22)
			+ "<br>"
			+ "&emsp;s23: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S23)
			+ "<br>"
			+ "&emsp;s24: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S24)
			+ "<br>"
			+ "&emsp;s25: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S25)
			+ "<br>"
			+ "&emsp;s26: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S26)
			+ "<br>"
			+ "&emsp;s27: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S27)
			+ "<br>"
			+ "&emsp;s28: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S28)
			+ "<br>"
			+ "&emsp;s29: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S29)
			+ "<br>"
			+ "&emsp;s30: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S30)
			+ "<br>"
			+ "&emsp;s31: "
			+ this.Unicorn.reg_read_float(uc.ARM_REG_S31)
			+ "<br>";
	};
	this.Reset = function()
	{
		/*
		0x08000 - 0x10000 Stack
		0x10000 - 0x30000 Code memory
		0x40000 - 0x60000 Working memory
		*/
		// Stack
		this.Unicorn.mem_unmap(0x8000, 0x8000);
		this.Unicorn.mem_map(0x8000, 0x8000);
		this.Unicorn.reg_write_i32(uc.ARM_REG_SP, 0x8000 + 0x8000);
		// Code
		this.Unicorn.mem_unmap(0x10000, 0x30000);
		this.Unicorn.mem_map(0x10000, 0x30000);
		this.Unicorn.reg_write_i32(uc.ARM_REG_IP, 0x10000);
		// WRAM
		this.Unicorn.mem_unmap(0x40000, 0x20000);
		this.Unicorn.mem_map(0x40000, 0x20000);

		this.DrawRegisters();
	};
	// Assembler
	this.Keystone = new ks.Keystone(ks.ARCH_ARM, ks.MODE_ARM);
	//KeyStone.option(ks.OPT_SYNTAX,ks.OPT_SYNTAX_INTEL);
	console.log("Keystone initialized");

	// Emulator
	// simulated as "armv8eb"
	this.Unicorn = new uc.Unicorn(uc.ARCH_ARM, ks.MODE_LITTLE_ENDIAN);
	console.log("Unicorn initialized");

	// Disassembler
	//var Capstone = new cs.Capstone(cs.ARCH_ARM,cs.MODE_ARM);

	// Delay between changing the text box and assembling
	this.AssembleDelay = null;

	// CodeMirror
	this.CodeMirrorInst = CodeMirror.fromTextArea(
		document.getElementById("source"),
		{
			autofocus: true,
			dragDrop: true,
			cursorBlinkRate: 250,
			lineNumbers: true,
			tabSize: 4,
			smartIndent: true,
			indentWithTabs: true,
			mode: "gas",
			theme: "OakSim",
		});

	this.CodeMirrorInst.on(
		"change",
		function()
		{
			clearTimeout(this.AssembleDelay);
			this.AssembleDelay = setTimeout(
				function()
				{
					Assemble(this.CodeMirrorInst.getValue());
					this.DrawMemory();
					this.DrawRegisters();
				},
				125);
		});
	// Default program
	this.CodeMirrorInst.setValue("square:\n\tmov r3, r0\n\tmul r0, r3, r0\n\tbx lr");
	console.log("CodeMirror initialized");


	this.Reset();
	return this;
} )();