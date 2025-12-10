export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email' }), { status: 400 });
    }
    // TODO: Integrate with backend or mailing service here
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Bad Request' }), { status: 400 });
  }
}


