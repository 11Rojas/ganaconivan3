import nodemailer from 'nodemailer'
import siteConfig from '@/config/site'

// Configuración del transporter de Nodemailer para Vercel (serverless)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // Crear transporter en cada llamada para serverless
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    
    // Cerrar la conexión para serverless
    transporter.close()
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Función para enviar notificación de compra
export const sendPurchaseNotification = async (purchaseData: {
  email: string
  name: string
  raffleTitle: string
  numbers: number[]
  totalAmount: number
  paymentMethod: string
  reference: string
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1f27; color: white; padding: 20px;">
      <p style="font-size: 1.1em; margin-bottom: 10px;">Hola ${purchaseData.name},</p>
      <p style="font-size: 1.1em; margin-bottom: 30px;">Tu compra ha sido registrada exitosamente:</p>
      
      <div style="background: #2a2f37; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="color: #22c55e; margin-bottom: 15px; font-size: 1.3em;">${purchaseData.raffleTitle}</h3>
        
        <div style="background: #1a1f27; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h4 style="color: white; margin-bottom: 10px;">Números de tus boletos:</h4>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
            ${purchaseData.numbers.map(number => 
              `<span style="background: #22c55e; color: black; padding: 8px 12px; border-radius: 20px; font-weight: bold; font-size: 1.1em;">${number.toString().padStart(2, '0')}</span>`
            ).join('')}
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 1.1em; margin-bottom: 10px;">¡Gracias por participar!</p>
        <p style="font-size: 1.2em; font-weight: bold; color: #22c55e;">Gana con Iván</p>
      </div>
    </div>
  `

  return await sendEmail(purchaseData.email, `Compra Confirmada - ${siteConfig.siteName}`, html)
}

// Función para enviar email de aprobación de compra
export const sendPurchaseApprovalEmail = async (purchaseData: {
  email: string
  name: string
  raffleTitle: string
  numbers: number[]
  totalAmount: number
  paymentMethod: string
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1f27; color: white; padding: 20px;">
      <h2 style="color: #22c55e; text-align: center; font-size: 2em; margin-bottom: 20px;">¡Compra Aprobada!</h2>
      <p style="font-size: 1.1em; margin-bottom: 10px;">Hola ${purchaseData.name},</p>
      
      <div style="background: #2a2f37; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="color: #22c55e; margin-bottom: 15px; font-size: 1.3em;">${purchaseData.raffleTitle}</h3>
        
        <div style="background: #1a1f27; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h4 style="color: white; margin-bottom: 10px;">Números de tus boletos:</h4>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
            ${purchaseData.numbers.map(number => 
              `<span style="background: #22c55e; color: black; padding: 8px 12px; border-radius: 20px; font-weight: bold; font-size: 1.1em;">${number.toString().padStart(2, '0')}</span>`
            ).join('')}
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 1.1em; margin-bottom: 10px;">¡Gracias por participar!</p>
        <p style="font-size: 1.2em; font-weight: bold; color: #22c55e;">Gana con Iván</p>
      </div>
    </div>
  `

  return await sendEmail(purchaseData.email, `Compra Aprobada - ${siteConfig.siteName}`, html)
}

// Función para enviar email de anuncio de ganador
export const sendWinnerAnnouncementEmail = async (winnerData: {
  email: string
  name: string
  raffleTitle: string
  winningNumber: number
  prize: string
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e, #ffd166); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: #023429; margin: 0; font-size: 2.5em;">🏆 ¡GANADOR! 🏆</h1>
        <p style="color: #023429; font-size: 1.2em; margin: 10px 0;">¡Felicidades!</p>
      </div>
      
      <p>Hola ${winnerData.name},</p>
      <p>¡INCREÍBLES NOTICIAS! Has ganado la rifa:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🎉 ¡GANASTE!</h3>
        <p><strong>Rifa:</strong> ${winnerData.raffleTitle}</p>
        <p><strong>Número Ganador:</strong> <span style="font-size: 1.5em; font-weight: bold; color: #22c55e;">${winnerData.winningNumber}</span></p>
        <p><strong>Premio:</strong> ${winnerData.prize}</p>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3>📞 Próximos Pasos</h3>
        <p>Nos pondremos en contacto contigo en las próximas 24 horas para coordinar la entrega de tu premio.</p>
        <p><strong>¡Disfruta tu victoria!</strong></p>
      </div>
      
      <p>¡Gracias por participar en ${siteConfig.siteName}!</p>
      <p><strong>${siteConfig.siteName}</strong></p>
    </div>
  `

  return await sendEmail(winnerData.email, `¡GANASTE! - ${siteConfig.siteName}`, html)
}