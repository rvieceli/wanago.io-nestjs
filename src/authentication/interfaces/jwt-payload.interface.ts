export interface JwtPayload {
  sub: number;
  verifier?: number;
  is2fa?: boolean;
}
