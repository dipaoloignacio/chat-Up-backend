import * as jose from 'jose';

interface JwtPayload {
  userId: string;
}

export const generateJwtToken = async (userId: string) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(secret);

  return token;
};

export const validateJwtToken = async (token: string): Promise<JwtPayload> => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload } = await jose.jwtVerify<JwtPayload>(token, secret);

  return payload;
};
