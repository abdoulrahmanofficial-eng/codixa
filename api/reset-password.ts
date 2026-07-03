import { Resend } from 'resend'
import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    const appUrl = process.env.APP_URL
    if (!appUrl) {
      return Response.json({ error: 'APP_URL not configured' }, { status: 500 })
    }

    const resetLink = await admin.auth().generatePasswordResetLink(email, {
      url: `${appUrl}/auth`,
      handleCodeInApp: true,
    })

    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from: 'Codixa <noreply@codixa.io>',
      to: email,
      subject: 'إعادة تعيين كلمة المرور - Codixa',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">إعادة تعيين كلمة المرور</h2>
          <p>مرحباً،</p>
          <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك في Codixa.</p>
          <p>اضغط على الزر أدناه لإعادة تعيين كلمة المرور:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0; font-weight: bold;">إعادة تعيين كلمة المرور</a>
          <p style="color: #666; font-size: 14px;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">فريق Codixa</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return Response.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Reset password API error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
