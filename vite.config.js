import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { Resend } from 'resend'

function smtpPlugin() {
  return {
    name: 'smtp-plugin',
    configureServer(server) {
      server.middlewares.use('/send-email', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const { to, subject, html } = JSON.parse(body);
              
              const resend = new Resend('re_bygf31vR_5CpLXHeFqBfrvEjKnjhhjr7V');
              const toArray = to.split(',').map(e => e.trim()).filter(e => e);
              
              const { data, error } = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: toArray,
                subject: subject,
                html: html
              });

              if (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: error.message }));
                return;
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data: data }));
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: error.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { 
    plugins: [react(), smtpPlugin()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/swagger': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/sms': {
          target: 'http://sms.airtel.lk:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
