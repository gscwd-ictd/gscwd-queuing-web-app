import { AccountStatus, Role } from "@prisma/client";
import { z } from "zod";

export const userAccountRoles = Object.values(Role).filter(
  (role): role is Exclude<Role, "superadmin"> => role !== "superadmin"
);

export const newUserAccountSchema = z.object({
  firstName: z.string("Please enter first name"),
  middleName: z.string().optional(),
  lastName: z.string("Please enter last name"),
  nameExtension: z.string().optional(),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(userAccountRoles, {
    message: "Please select a role",
  }),
  department: z.string("Please enter department"),
  position: z.string("Please enter position"),
});

export const editUserAccountSchema = z.object({
  firstName: z.string("Please enter first name"),
  middleName: z.string().optional(),
  lastName: z.string("Please enter last name"),
  nameExtension: z.string().optional(),
  email: z.email("Please enter a valid email address"),
  role: z.enum(userAccountRoles, {
    message: "Please select a role",
  }),
  accountStatus: z.enum(AccountStatus, {
    message: "Please select account status",
  }),
  departmentId: z.string().min(1, "Please select a department"),
  position: z.string("Please enter position"),
});
