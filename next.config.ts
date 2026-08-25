import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * LAN development (Phone Access pass).
   *
   * Next 16 rejects dev-server requests whose `Origin`/`Host` is not
   * localhost with a 403 unless the origin is listed here. Practising
   * speaking happens on a phone, not at a desk, so the dev server has
   * to be reachable from other devices on the same Wi-Fi — the `dev`
   * script binds to `0.0.0.0` and these patterns allow the private
   * IPv4 ranges a home router hands out.
   *
   * These are private, non-routable ranges (RFC 1918): a machine on
   * the public internet cannot present one of these as its origin and
   * reach this server, so this is scoped to the local network only.
   * It applies to `next dev` exclusively and has no effect on a
   * production build.
   */
  allowedDevOrigins: [
    '192.168.*.*',
    '10.*.*.*',
    '172.16.*.*',
    '172.17.*.*',
    '172.18.*.*',
    '172.19.*.*',
    '172.2*.*.*',
    '172.30.*.*',
    '172.31.*.*',
    '*.local',
  ],
};

export default nextConfig;
