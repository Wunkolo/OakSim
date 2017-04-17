function HexByte(Value)
{
	Value = Value < 0 ? Value += 0x100 : Value;
	var Str = "00" + Value.toString(16).toUpperCase();
	return Str.slice(-2);
}

//var CurContext = null;

var RegisterType =
{
	uint32: 0,
	int32: 1,
	uint64: 2,
	int64: 3,
	float32: 4,
	float64: 5
};

function Register
(
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
		var NewValue = -1;
		switch (this.RegisterType)
		{
		default:
		case RegisterType.uint32:
		case RegisterType.int32:
			{
				NewValue = CurContext.Unicorn.reg_read_i32(this.Identifier);
				break;
			}
		case RegisterType.float32:
			{
				NewValue = CurContext.Unicorn.reg_read_float(this.Identifier);
				break;
			}
		}
		if (this.Value !== NewValue)
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
	};
}

CurContext = new ( function()
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
		return this;
	} )();

	function Register
	(
		Name, // register Display Name
		RegisterType, // RegisterType enum for display type
		Identifier // Unicorn Engine register identifier
	)
	{
		var Instance = this;
		this.Name = Name;
		this.RegisterType = RegisterType;
		this.Identifier = Identifier;
		this.Value = 0;
		this.OldValue = this.Value;
		this.Changed = false;


		this.Update = function()
		{
			var NewValue;
			switch (this.RegisterType)
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
			if (Instance.Value !== NewValue)
			{
				Instance.Changed = true;
			}
			else
			{
				Instance.Changed = false;
			}
			Instance.OldValue = Instance.Value;
			Instance.Value = NewValue;
		};
		this.Reset = function()
		{
			this.Value = 0;
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
		if (Assembled.failed === true || Assembled.mc === undefined)
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
		if (Byte > 31 && Byte < 127)
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
				function(Line, CurByte)
				{
					return Line + " " + StyleByte(CurByte);
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
			"Registers:<br>"
			+ Context.Registers.Entries.reduce(
				function(RegList, CurRegister, Index)
				{
					return RegList
						+ "\t"
						+ CurRegister.Name
						+ ": "
						+ CurRegister.Value.toString(16)
						+ "<br>";
				},
				"");
	};
	this.Reset = function()
	{
		/*
		0x08000 - 0x10000 Stack
		0x10000 - 0x30000 Code memory
		0x40000 - 0x60000 Working memory
		*/
		// Stack
		try
		{
			this.Unicorn.mem_unmap(0x8000, 0x8000);
		}
		catch (e)
		{
		}
		this.Unicorn.mem_map(0x8000, 0x8000);
		this.Unicorn.reg_write_i32(uc.ARM_REG_SP, 0x8000 + 0x8000);
		// Code
		try
		{
			this.Unicorn.mem_unmap(0x10000, 0x30000);
		}
		catch (e)
		{
		}
		this.Unicorn.mem_map(0x10000, 0x30000);
		this.Unicorn.reg_write_i32(uc.ARM_REG_IP, 0x10000);
		// WRAM
		try
		{
			this.Unicorn.mem_unmap(0x40000, 0x20000);
		}
		catch (e)
		{
		}
		this.Unicorn.mem_map(0x40000, 0x20000);

		this.DrawRegisters();
	};
	// Assembler
	this.Keystone = new ks.Keystone(ks.ARCH_ARM, ks.MODE_ARM);
	//KeyStone.option(ks.OPT_SYNTAX,ks.OPT_SYNTAX_INTEL);
	console.log("Keystone initialized");

	// Emulator
	// simulated as "armv8eb"
	this.Unicorn = new uc.Unicorn(uc.ARCH_ARM, uc.MODE_LITTLE_ENDIAN);
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
	this.CodeMirrorInst.setValue("square:\n\tmov r3, r0\n\tmul r0, r3, r0\n\tbx lr");

	console.log("CodeMirror initialized");

	// Delay between changing the text box and assembling
	this.AssembleProc = function()
	{
		Context.Assemble(Context.CodeMirrorInst.getValue());
		Context.DrawMemory();
		Context.DrawRegisters();
	};
	this.AssembleDelay = setTimeout(
		this.AssembleProc,
		125
	);


	this.CodeMirrorInst.on(
		"change",
		function()
		{
			clearTimeout(this.AssembleDelay);
			this.AssembleDelay = setTimeout(
				this.AssembleProc,
				125);
		}
	);

	this.Reset();
	return this;
} )();