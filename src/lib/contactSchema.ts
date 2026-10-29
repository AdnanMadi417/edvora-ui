import { z } from "zod";
import { contact } from "./content";

// Shared by the contact form (client) and its server action. Messages say
// what is wrong and how to fix it (brief §8).
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name so we know who to reply to."),
  email: z.string().trim().email("Enter an email address like name@company.com."),
  company: z.string().trim().max(120, "Use 120 characters or fewer.").optional().or(z.literal("")),
  budget: z.enum(contact.budgets as [string, ...string[]], { errorMap: () => ({ message: "Choose a budget range." }) }),
  details: z.string().trim().min(20, "Add a few more details: at least 20 characters.").max(4000, "Keep it under 4,000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
