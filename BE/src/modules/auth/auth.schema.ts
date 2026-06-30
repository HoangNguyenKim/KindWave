import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ").max(255),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .max(72, "Mật khẩu tối đa 72 ký tự")
      .regex(/[A-Za-z]/, "Mật khẩu phải có ít nhất một chữ cái")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất một chữ số"),
    fullName: z.string().min(1, "Họ tên không được để trống").max(255),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email không hợp lệ").max(255),
    password: z.string().min(1, "Mật khẩu không được để trống").max(72),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
