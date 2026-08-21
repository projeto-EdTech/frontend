import emailjs from '@emailjs/browser'

export interface ContactEmailData {
  nome: string
  email: string
  assunto: string
  mensagem: string
}

interface EmailJSConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

function getEmailJSConfig(): EmailJSConfig {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'Ops, as configurações do serviço de e-mail estão faltando. Verifique o arquivo .env.',
    )
  }

  return { serviceId, templateId, publicKey }
}

export function initEmailJS(): void {
  const { publicKey } = getEmailJSConfig()
  emailjs.init(publicKey)
}

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  const { serviceId, templateId, publicKey } = getEmailJSConfig()

  await emailjs.send(
    serviceId,
    templateId,
    {
      name: data.nome,
      email: data.email,
      subject: data.assunto,
      message: data.mensagem,
    },
    publicKey,
  )
}
