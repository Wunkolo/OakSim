.macro PADGROUP name=""
	.balign 16,0xAB
	.ascii "\name"
	.balign 16,'='
.endm

.arm @ Emit 32-bit ARM code
#.thumb @ Emit 16-bit THUMB code, note now "IntegerDivide" collapses

PADGROUP "Square"
square:
	mov r3, r0
	mul r0, r3, r0
	bx lr

PADGROUP "IntegerDivide"
IntegerDivide:
	mov			r1, #0
	adds		r0, r0, r0
	.rept 32			@ repeat 32 times
		adcs		r1, r2, r1, lsl #1
		subcc		r1, r1, r2
		adcs		r0, r0, r0
	.endr
	mov 	pc, lr

PADGROUP "Mul50Int"
Mul50Int:
	mov			r3, #50
	mul			r0, r3, r0
	bx			lr

PADGROUP "Mul50Float"
Mul50Float:
	vmov		s14, r0
	vldr.32		s15, .L1
	vmul.f32	s15, s14, s15
	vmov		r0, s15
	bx			lr
.L1:
	.float		50.0

PADGROUP "Mul50Double"
Mul50Double:
	vmov		d6, r0, r4
	vldr.64		d7, .L2
	vmul.f64	d7, d6, d7
	vmov		r0, r1, d7
	bx			lr
.L2:
	.double		50.0s

PADGROUP "Data"
Data:
	# Values
	.float 1.0, 0.5, inf	@floats
	.double 1.0, 0.5, inf 	@doubles
	
	# Strings
PADGROUP "Strings"
	.string "Arm assembly right in your browser!"
	.ascii "test\000"
	.space 64,'^'
	.asciiz "YO"
	
	# Rept
PADGROUP "Rept"
	.rept 12				@ x12 1.0-floats
		.float 1.0
	.endr