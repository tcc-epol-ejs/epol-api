export async function enviarEmailRecuperacao({ email, nome, token }) {
  const link = `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: "nico17tcc@gmail.com", name: "EPOL" },
      to: [{ email, name: nome }],
      subject: "Recuperação de senha — EPOL",
      htmlContent: `
          <p>Olá, ${nome}!</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no EPOL.</p>
          <p>Clique no link abaixo para criar uma nova senha. O link é válido por ${
            process.env.RECUPERACAO_TOKEN_EXPIRA_HORAS || 1
          } hora(s):</p>
          <p><a href="${link}">${link}</a></p>
          <p>Se você não solicitou a recuperação, ignore este e-mail.</p>
        `,
    }),
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(`Erro ao enviar e-mail: ${JSON.stringify(erro)}`);
  }
}
