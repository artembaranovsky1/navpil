const jwtToken = process.env.JWT_SECRET_KEY;

if (!jwtToken) {
    throw new Error('JWT_SECRET_KEY is not set');
}

export const JWT_SECRET: string = jwtToken;
export const JWT_EXPIRES_IN = 60 * 60;