function HexByte(Value)
{
	Value = Value < 0 ? Value += 0x100 : Value;
	var Str = "00" + Value.toString(16).toUpperCase();
	return Str.slice(-2);
}

var RegisterType =
{
	uint32: 0,
	int32: 1,
	uint64: 2,
	int64: 3,
	float32: 4,
	float64: 5
};


var CurContext = new ( function()
{
	var Context = this;
	this.Registers = new ( function()
	{
		this.Entries = [];
		this.Update = function()
		{
			this.Entries.forEach(
				function(CurRegister)
				{
					CurRegister.Update();
				}
			);
		};
		this.PushRegister = function(NewRegister)
		{
			this.Entries.push(NewRegister);
		};

		this.Reset = function()
		{
			this.Entries.forEach(
				function(CurRegister)
				{
					CurRegister.Reset();
				}
			);
		};
		return this;
	} )();

	function Register(
		Name, // register Display Name
		RegisterType, // RegisterType enum for display type
		Identifier // Unicorn Engine register identifier
	)
	{
		this.Name = Name;
		this.RegisterType = RegisterType;
		this.Identifier = Identifier;
		this.Value = 0;
		this.OldValue = this.Value;
		this.Changed = false;


		this.Update = function()
		{
			var NewValue;
			switch( this.RegisterType )
			{
			default:
			case RegisterType.uint32:
			case RegisterType.int32:
			{
				NewValue = Context.Unicorn.reg_read_i32(this.Identifier);
				break;
			}
			case RegisterType.float32:
			{
				NewValue = Context.Unicorn.reg_read_float(this.Identifier);
				break;
			}
			}
			if( this.Value !== NewValue )
			{
				this.Changed = true;
			}
			else
			{
				this.Changed = false;
			}
			this.OldValue = this.Value;
			this.Value = NewValue;
		};
		this.Reset = function()
		{
			this.Value = 0;
			Context.Unicorn.reg_write_i32(this.Identifier, 0);
		};
		return this;
	}

	this.Registers.PushRegister(new Register("R0", RegisterType.uint32, uc.ARM_REG_R0));
	this.Registers.PushRegister(new Register("R1", RegisterType.uint32, uc.ARM_REG_R1));
	this.Registers.PushRegister(new Register("R2", RegisterType.uint32, uc.ARM_REG_R2));
	this.Registers.PushRegister(new Register("R3", RegisterType.uint32, uc.ARM_REG_R3));
	this.Registers.PushRegister(new Register("R4", RegisterType.uint32, uc.ARM_REG_R4));
	this.Registers.PushRegister(new Register("R5", RegisterType.uint32, uc.ARM_REG_R5));
	this.Registers.PushRegister(new Register("R6", RegisterType.uint32, uc.ARM_REG_R6));
	this.Registers.PushRegister(new Register("R7", RegisterType.uint32, uc.ARM_REG_R7));
	this.Registers.PushRegister(new Register("R8", RegisterType.uint32, uc.ARM_REG_R8));
	this.Registers.PushRegister(new Register("R9", RegisterType.uint32, uc.ARM_REG_R9));
	this.Registers.PushRegister(new Register("R10", RegisterType.uint32, uc.ARM_REG_R10));
	this.Registers.PushRegister(new Register("R11", RegisterType.uint32, uc.ARM_REG_R11));
	this.Registers.PushRegister(new Register("R12", RegisterType.uint32, uc.ARM_REG_R12));
	this.Registers.PushRegister(new Register("SP", RegisterType.uint32, uc.ARM_REG_SP));
	this.Registers.PushRegister(new Register("LR", RegisterType.uint32, uc.ARM_REG_LR));
	this.Registers.PushRegister(new Register("PC", RegisterType.uint32, uc.ARM_REG_PC));
	this.Registers.PushRegister(new Register("CPSR", RegisterType.uint32, uc.ARM_REG_CPSR));
	this.Assemble = function(Source)
	{
		var ElmMemory = document.getElementById("memory");
		var Assembled = this.Keystone.asm(Source);
		if( Assembled.failed === true || Assembled.mc === undefined )
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
	var Colors = [
		"#e0e0e0", "#90a959", "#6a9fb5", "#ac4142", "#aa759f", "#f4bf75"
	];
	var StyleByte = function(Byte)
	{
		var Hex = ( "00" + Byte.toString(16).toUpperCase() ).slice(-2);
		if( Byte === 0x00 )
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
		if( Byte > 31 && Byte < 127 )
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

		for( var i = 0; i < Length; i += Width )
		{
			var LineBytes = Bytes.slice(i, i + Width);
			var RowByte = 0;
			var PC = Context.Unicorn.reg_read_i32(uc.ARM_REG_PC);
			var Hex = LineBytes.reduce(
				function(Line, CurByte)
				{
					var ByteOffset = Offset + i + RowByte;
					var Armed = ( PC <= ByteOffset ) && ( ( PC + 4 ) > ByteOffset );
					RowByte++;
					return Line
						+ " "
						+ ( Armed ? "<u>" : "" )
						+ StyleByte(CurByte)
						+ ( Armed ? "</u>" : "" );
				},
				"0x" + ( "00000000" + ( i + Offset ).toString(16).toUpperCase() ).slice(-8) + ":");
			Out += Hex
				+ LineBytes.reduce(
					function(Print, CurByte)
					{
						return Print + AsciiByte(CurByte);
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
		Context.Registers.Update();
		document.getElementById("registers").innerHTML =
			"<table>"
			+ "<thead><tr><th>Register</th><th>Value</th></tr></thead>"
			+ "<tbody>"
			+ Context.Registers.Entries.reduce(
				function(RegList, CurRegister)
				{
					return RegList
						+ "<tr><td>"
						+ CurRegister.Name
						+ "</td>"
						+ "<td>"
						+ ( CurRegister.Changed ? "<span style=\"color:#f4bf75;\">" : "" )
						+ CurRegister.Value.toString(16)
						+ ( CurRegister.Changed ? "</span>" : "" )
						+ "</td></tr>";
				},
				""
			)
			+ "</tbody><table>";
	};
	this.Reset = function()
	{
		Context.Registers.Reset();
		/*
		0x08000 - 0x10000 Stack ( Descending )
		0x10000 - 0x30000 Code memory
		0x40000 - 0x60000 Working memory
		*/
		// Stack
		try
		{
			this.Unicorn.mem_unmap(0x8000, 0x8000);
		}
		catch( e )
		{
		}
		this.Unicorn.mem_map(0x8000, 0x8000, uc.PROT_READ | uc.PROT_WRITE);
		this.Unicorn.reg_write_i32(uc.ARM_REG_SP, 0x8000 + 0x8000);
		// Code
		try
		{
			this.Unicorn.mem_unmap(0x10000, 0x30000);
		}
		catch( e )
		{
		}
		this.Unicorn.mem_map(0x10000, 0x30000, uc.PROT_ALL);
		this.Unicorn.reg_write_i32(uc.ARM_REG_PC, 0x10000);

		this.Unicorn.hook_add(
			uc.HOOK_INSN,
			function(handle, user_data)
			{
				console.log("Code Hook Test");
			},
			null,
			0x10000,
			0x40000
		);

		// WRAM
		try
		{
			this.Unicorn.mem_unmap(0x40000, 0x20000);
		}
		catch( e )
		{
		}
		this.Unicorn.mem_map(0x40000, 0x20000, uc.PROT_READ | uc.PROT_WRITE);

		document.getElementById("messages").innerHTML = "";

		this.Refresh();
	};
	this.Refresh = function()
	{
		this.DrawRegisters();
		this.DrawMemory();
	};
	this.Step = function(Instructions)
	{
		var PC = this.Unicorn.reg_read_i32(uc.ARM_REG_PC);
		try
		{
			this.Unicorn.emu_start(PC, 0x40000, 0, Instructions);
		}
		catch( e )
		{
			this.Log(e);
			return false;
		}
		this.Refresh();
		return true;
	};
	// Assembler
	this.Keystone = new ks.Keystone(ks.ARCH_ARM, ks.MODE_ARM);
	//KeyStone.option(ks.OPT_SYNTAX,ks.OPT_SYNTAX_INTEL);
	console.log("Keystone initialized");

	// Emulator
	// simulated as "armv8eb"
	this.Unicorn = new uc.Unicorn(uc.ARCH_ARM, uc.MODE_LITTLE_ENDIAN | uc.MODE_THUMB);
	console.log("Unicorn initialized");

	// Disassembler
	//var Capstone = new cs.Capstone(cs.ARCH_ARM,cs.MODE_ARM);

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
			theme: "OakSim"
		});
	// Default program
	this.CodeMirrorInst.setValue("Loop:\n\tadd r0, r0, #1\n\tmul r1, r0, r0\n\tb Loop");

	console.log("CodeMirror initialized");

	// Delay between changing the text box and assembling
	this.AssembleProc = function()
	{
		Context.Assemble(Context.CodeMirrorInst.getValue());
		Context.Refresh();
	};
	this.AssembleDelay = setTimeout(
		this.AssembleProc,
		125
	);


	this.CodeMirrorInst.on(
		"change",
		function()
		{
			clearTimeout(Context.AssembleDelay);
			Context.AssembleDelay = setTimeout(
				Context.AssembleProc,
				125
			);
		}
	);


	// Button Setup
	this.Run = false;
	this.RunInterval = null;
	this.ToggleRun = function()
	{
		CurContext.Run = !CurContext.Run;
		if( CurContext.Run === true )
		{
			document.getElementById("RunButton").classList += "active";
			document.getElementById("RunDelay").readOnly = true;
			document.getElementById("StepButton").disabled = true;
			var Delay = document.getElementById("RunDelay").valueAsNumber;
			CurContext.RunInterval = setInterval(
				function()
				{
					if( CurContext.Step(1) === false )
					{
						CurContext.ToggleRun();
					}
				},
				Delay
			);
		}
		else
		{
			document.getElementById("RunButton").classList = [];
			clearInterval(CurContext.RunInterval);
			document.getElementById("RunDelay").readOnly = false;
			document.getElementById("StepButton").disabled = false;
		}
	};
	document.getElementById("RunButton").onclick = function()
	{
		CurContext.ToggleRun();
	};
	document.getElementById("RunDelay").onchange = function()
	{
	};

	document.getElementById("StepButton").onclick = function()
	{
		Context.Step(1);
	};
	document.getElementById("ResetButton").onclick = function()
	{
		Context.Reset();
		Context.AssembleProc();
	};

	this.Reset();
	return this;
} )();