import { apiPublic } from "@/lib/api";

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function submitContactForm(payload: ContactPayload) {
  return apiPublic<{ submitted: boolean }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function subscribeNewsletter(email: string) {
  return submitContactForm({
    name: "Newsletter",
    email,
    subject: "Newsletter subscription",
    message: `Please add ${email} to the TeacherPoint learning tips newsletter.`,
  });
}
