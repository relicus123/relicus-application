import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import type { Plugin } from 'vite';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export function emailDispatchPlugin(): Plugin {
  return {
    name: 'email-dispatch-plugin',
    configureServer(server) {
      server.middlewares.use('/api/send-email', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const recipients = Array.isArray(data.recipients) ? data.recipients : (data.to ? [data.to] : []);

            if (recipients.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'No recipients specified' }));
              return;
            }

            const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
            const port = parseInt(process.env.SMTP_PORT || '465', 10);
            const user = process.env.SMTP_USER || 'info@relicus.in';
            const pass = (process.env.SMTP_PASS || 'Relicus5252#*').replace(/^"|"$/g, '');

            const transporter = nodemailer.createTransport({
              host,
              port,
              secure: true,
              auth: { user, pass },
              tls: { rejectUnauthorized: false }
            });

            const mailOptions: nodemailer.SendMailOptions = {
              from: process.env.SMTP_FROM || '"Relicus Entrance Coaching" <info@relicus.in>',
              bcc: recipients,
              subject: data.subject || '[Relicus] Scheduled Mega Test Announcement',
              text: data.text || '',
              html: data.html || undefined,
            };

            const info = await transporter.sendMail(mailOptions);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              messageId: info.messageId,
              recipientCount: recipients.length
            }));
          } catch (err: any) {
            console.error('[Email Dispatcher Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: err.message || 'Internal error sending email'
            }));
          }
        });
      });
    }
  };
}
