export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { kategori, nama, whatsapp, negeri } = req.body;

  if (!kategori || !nama || !whatsapp || !negeri) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const now = new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' });
  const waClean = whatsapp.replace(/[^0-9]/g, '');

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.FROM_NAME,
          email: process.env.FROM_EMAIL,
        },
        to: [{ email: process.env.NOTIFY_EMAIL, name: process.env.NOTIFY_NAME }],
        subject: `[Poligami.my] Pendaftaran Baru — ${nama}`,
        htmlContent: `
          <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;border:1px solid #e0e0e0;">
            <div style="background:#111;padding:20px 28px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Poligami.my</p>
              <p style="margin:6px 0 0;font-size:22px;color:#f0f0f0;font-weight:normal;">Pendaftaran Baru Diterima</p>
            </div>
            <div style="padding:28px;background:#fff;">
              <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:12px 0;color:#888;width:130px;">Kategori</td>
                  <td style="padding:12px 0;color:#111;font-weight:600;">${kategori}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:12px 0;color:#888;">Nama</td>
                  <td style="padding:12px 0;color:#111;font-weight:600;">${nama}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:12px 0;color:#888;">WhatsApp</td>
                  <td style="padding:12px 0;">
                    <a href="https://wa.me/${waClean}" style="color:#111;font-weight:600;text-decoration:none;">${whatsapp}</a>
                    &nbsp;<span style="font-size:11px;color:#aaa;">(klik untuk buka WhatsApp)</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;color:#888;">Negeri</td>
                  <td style="padding:12px 0;color:#111;font-weight:600;">${negeri}</td>
                </tr>
              </table>
              <div style="margin-top:20px;padding:12px 14px;background:#f8f8f8;border-left:3px solid #888;">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#999;">Diterima pada: ${now}</p>
              </div>
            </div>
          </div>`,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Brevo error:', err);
    return res.status(500).json({ error: err.message });
  }
}
