.arm @ Emit 32-bit ARM cdoe
#.thumb @ Emit 16-bit THUMB code, note now "IntegerDivide" collapses

IntegerDivide:
  mov r1, #0
  adds r0, r0, r0
  .rept 32			@ repeat 32 times
	adcs r1, r2, r1, lsl #1
	subcc r1, r1, r2
	adcs r0, r0, r0
  .endr
  mov pc, lr

Mul50Int:
  mov     r3, #50
  mul     r0, r3, r0
  bx      lr
		

Mul50Float:
  vmov    s14, r0
  vldr.32 s15, .L3
  vmul.f32        s15, s14, s15
  vmov    r0, s15
  bx      lr
.L3:
  .word   1112014848
		

Mul50Double:
  vmov    d6, r0, r4
  vldr.64 d7, .L6
  vmul.f64        d7, d6, d7
  vmov    r0, r1, d7
  bx      lr
.L6:
  .word   0
  .word   1078525952

Data:
	# Values
	.balign 16,0
	.float  1.0, 0.5, inf	@floats
	
	.balign 16,0
	.double 1.0, 0.5, inf 	@doubles
	
	# Strings
	.balign 16,0
	.string "Arm assembly right in your browser!"
	.ascii "test\000"
	.balign 16,0
	.space 64,'^'
	.asciiz "YO"
	
	# Rept
	.balign 16,0
	.rept 64 				@ x64 1.0-floats
		.float 1.0
	.endr