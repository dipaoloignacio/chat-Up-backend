import { prisma } from '../prisma/db';
import { generateJwtToken } from '../utils/jwt-validation';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
};

export const handleApiRequest = async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === 'POST' && url.pathname === '/api/login') {
    return handleLogin(req);
  }
};

const handleLogin = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { email = '', password = '' } = body as any;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const isPasswordValid = Bun.password.verifySync(`${password}`, user.password);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Invalid Password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const token = await generateJwtToken(user.id);

    return new Response(
      JSON.stringify({ token, user: { id: user.id, name: user.name, email: user.email } }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.log({ error });
    return new Response(JSON.stringify({ error: 'Unknown Error' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};