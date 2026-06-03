export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { negocio, oferta, cliente, ciudad, tono } = req.body;

  if (!negocio || !oferta) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const prompt = `Eres un experto en publicidad digital y copywriting para Meta Ads (Facebook e Instagram).

Genera exactamente 3 anuncios publicitarios diferentes para este negocio:
- Tipo de negocio: ${negocio}
- Oferta / promoción: ${oferta}
- Público objetivo: ${cliente || 'clientes en general'}
- Ciudad: ${ciudad || 'no especificada'}
- Tono: ${tono || 'profesional'}

Responde SOLO con un JSON válido, sin texto extra, sin backticks, con esta estructura exacta:
{
  "anuncios": [
    {
      "titulo": "Título del anuncio (máx 40 caracteres)",
      "cuerpo": "Texto principal del anuncio (2-3 oraciones naturales y persuasivas)",
      "cta": "Llamada a la acción (máx 20 caracteres)"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content.map(i => i.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'Error al generar anuncios. Intenta nuevamente.' });
  }
}
