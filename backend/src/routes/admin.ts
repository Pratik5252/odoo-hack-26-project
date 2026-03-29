import { Router } from "express";
import { prisma } from "../lib/prisma";
import { generatePlainPassword } from "../lib/password";
import { hashPassword } from "../utils/password";
import { sendPasswordEmail } from "../lib/mail";

export const adminRouter = Router();

adminRouter.post("/users/send-password", async (req, res) => {
  const raw = req.body?.email;
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required." });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user) {
      res.status(404).json({ error: "No user found with that email." });
      return;
    }

    const plainPassword = generatePlainPassword();
    const password = await hashPassword(plainPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password },
    });

    try {
      await sendPasswordEmail({
        to: user.email,
        userName: user.name?.trim() || user.email,
        plainPassword,
      });
    } catch (mailErr) {
      console.error("[mail] Failed to send password email:", mailErr);
      res.status(502).json({
        error:
          "Password was updated, but the email could not be sent. Check SMTP configuration and server logs.",
      });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[admin] send-password:", err);
    res.status(500).json({ error: "Could not reset password." });
  }
});
