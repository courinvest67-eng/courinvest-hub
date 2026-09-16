/**
 * Courinvest Hub — Cloud Function de envio de relatórios por e-mail
 * ---------------------------------------------------------------
 * Recebe (via httpsCallable, chamado pelo app): nome/e-mail do cliente, tipo de
 * serviço (GP ou GF), mês de referência e o PDF do relatório em base64.
 * Envia o e-mail via Gmail SMTP (conta courinvest.67@gmail.com), com o PDF
 * anexado, usando o template abaixo.
 *
 * Só pode ser chamado por um usuário autenticado no Firebase (o próprio app).
 * A senha de app do Gmail fica em Secret Manager — nunca no código-fonte.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const nodemailer = require("nodemailer");

const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

/* ==== CONFIGURAÇÃO ==== */
const GMAIL_USER = "courinvest.67@gmail.com";
const REMETENTE = `"Courinvest Consultoria" <${GMAIL_USER}>`;

/* Apenas este e-mail pode disparar envios (mesmo padrão de whitelist do app) */
const WHITELIST = ["courinvest.67@gmail.com"];

/* ===== Template do e-mail — varia o texto conforme GP (patrimônio) ou GF (financeira) ===== */
function montarEmailHtml({ clienteNome, tipoServico, mesRefNome }) {
  const primeiroNome = String(clienteNome || "").split(" ")[0];
  const tituloServico = tipoServico === "GP" ? "Gestão de Patrimônio" : "Gestão Financeira";
  const textoIntro =
    tipoServico === "GP"
      ? "Preparamos a análise da sua carteira: patrimônio, rentabilidade e comparativo com os principais benchmarks do mês."
      : "Preparamos o panorama do seu orçamento: receitas, despesas, evolução por categoria e recomendações personalizadas.";
  const emoji = tipoServico === "GP" ? "📈" : "📊";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Relatório ${tituloServico} — ${mesRefNome}</title>
</head>
<body style="margin:0;padding:0;background:#F1F3F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F3F8;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0A1628;border-radius:16px 16px 0 0;">
          <tr>
            <td style="padding:32px 36px 28px;background:linear-gradient(135deg,#0A1628 0%,#142B52 100%);border-radius:16px 16px 0 0;">
              <div style="font-size:11px;letter-spacing:3px;color:#D4A328;font-weight:700;text-transform:uppercase;margin-bottom:10px;">
                ${emoji} ${tituloServico} · ${mesRefNome}
              </div>
              <div style="font-size:24px;line-height:1.3;font-weight:800;color:#fff;">
                Seu relatório está pronto, ${primeiroNome}.
              </div>
            </td>
          </tr>
        </table>
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;">
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#334155;">
                Olá, ${primeiroNome}!
              </p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#334155;">
                ${textoIntro}
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.65;color:#334155;">
                O relatório completo em PDF está anexado a este e-mail. Qualquer dúvida, ajuste ou se quiser agendar
                uma conversa de acompanhamento, é só responder este e-mail — estamos à disposição.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                <tr>
                  <td style="background:#D4A328;border-radius:8px;">
                    <a href="mailto:${GMAIL_USER}" style="display:inline-block;padding:12px 22px;font-size:13px;font-weight:700;color:#0A1628;text-decoration:none;">
                      Falar com meu consultor
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 32px;">
              <div style="height:1px;background:#EEF1F6;margin-bottom:24px;"></div>
              <p style="margin:0;font-size:11px;line-height:1.6;color:#94A3B8;">
                Este e-mail foi enviado automaticamente pela Courinvest Consultoria em Investimentos com base
                nos dados financeiros compartilhados por você. As informações são confidenciais — não repasse
                este e-mail a terceiros.
              </p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0A1628;border-radius:0 0 16px 16px;">
          <tr>
            <td align="center" style="padding:20px 36px;">
              <div style="font-size:10px;letter-spacing:2px;color:#4A5F82;text-transform:uppercase;">
                Courinvest Consultoria em Investimentos
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

exports.enviarRelatorioEmail = onCall(
  { secrets: [GMAIL_APP_PASSWORD], region: "us-central1", cors: true },
  async (request) => {
    /* ===== 1. Autenticação ===== */
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "É preciso estar autenticado para enviar relatórios.");
    }
    const emailChamador = request.auth.token && request.auth.token.email;
    if (!emailChamador || !WHITELIST.includes(emailChamador)) {
      throw new HttpsError("permission-denied", "Usuário não autorizado a enviar relatórios.");
    }

    /* ===== 2. Validação do payload ===== */
    const { clienteNome, clienteEmail, tipoServico, mesRefNome, pdfBase64 } = request.data || {};
    if (!clienteEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteEmail)) {
      throw new HttpsError("invalid-argument", "E-mail do cliente inválido ou ausente.");
    }
    if (!pdfBase64 || typeof pdfBase64 !== "string" || pdfBase64.length < 100) {
      throw new HttpsError("invalid-argument", "PDF do relatório não foi recebido corretamente.");
    }
    if (tipoServico !== "GP" && tipoServico !== "GF") {
      throw new HttpsError("invalid-argument", "tipoServico deve ser 'GP' ou 'GF'.");
    }
    /* Limite de segurança: base64 de ~20MB já cobre relatórios bem extensos (Gmail aceita até 25MB) */
    const tamanhoBytesAprox = (pdfBase64.length * 3) / 4;
    if (tamanhoBytesAprox > 20 * 1024 * 1024) {
      throw new HttpsError("invalid-argument", "PDF gerado é grande demais para envio por e-mail (limite: 20MB).");
    }

    /* ===== 3. Monta e envia o e-mail via Gmail SMTP ===== */
    const tituloServico = tipoServico === "GP" ? "Gestão de Patrimônio" : "Gestão Financeira";
    const nomeArquivo = `Relatorio_${tituloServico.replace(/\s+/g, "_")}_${(mesRefNome || "").replace(/[\/\s]+/g, "-")}_${String(clienteNome || "cliente").replace(/[^a-zA-Z0-9]+/g, "_")}.pdf`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD.value(),
      },
    });

    try {
      const info = await transporter.sendMail({
        from: REMETENTE,
        to: clienteEmail,
        replyTo: GMAIL_USER,
        subject: `${tipoServico === "GP" ? "📈" : "📊"} Seu Relatório de ${mesRefNome} está pronto — Courinvest`,
        html: montarEmailHtml({ clienteNome, tipoServico, mesRefNome }),
        attachments: [
          {
            filename: nomeArquivo,
            content: pdfBase64,
            encoding: "base64",
          },
        ],
      });

      console.log(`✅ E-mail enviado para ${clienteEmail} (${tipoServico} · ${mesRefNome}) — id: ${info.messageId}`);
      return { success: true, id: info.messageId };
    } catch (err) {
      console.error("Erro ao enviar e-mail via Gmail SMTP:", err);
      throw new HttpsError("internal", err.message || "Erro inesperado ao enviar e-mail.");
    }
  }
);
