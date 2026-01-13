import { z } from "zod";

export const SignupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	name: z.string().min(1),
});

export const SigninSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export const CreateCanvasSchema = z.object({
	name: z.string().min(1).max(50),
	isPublic: z.boolean().optional().default(false),
	userId: z.string(),
});

export type SignupType = z.infer<typeof SignupSchema>;
export type SigninType = z.infer<typeof SigninSchema>;
export type CreateCanvasType = z.infer<typeof CreateCanvasSchema>;

export const UpdateCanvasSchema = z.object({
	data: z.string(),
});

export type UpdateCanvasType = z.infer<typeof UpdateCanvasSchema>;
