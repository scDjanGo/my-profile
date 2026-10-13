/**
 * Everything `ipconfig`, `ping` and `systeminfo` can learn about the visitor's network
 * without a single permission prompt: Network Information API, WebRTC ICE candidates,
 * User-Agent Client Hints, public DNS-over-HTTPS and IP lookup services.
 */

export interface PublicInfo {
  ip: string;
  isp?: string;
  org?: string;
  asn?: string;
  domain?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  postal?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  utc?: string;
}

export interface NetInfo {
  online: boolean;
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  ipv4?: string;
  ipv6?: string;
  geo?: PublicInfo;
  /** Host candidates: real LAN addresses in old browsers, `<uuid>.local` mDNS names in modern ones */
  hosts: string[];
  /** Address the STUN server sees (public side of the NAT) */
  reflexive: string[];
}

interface Connection {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

const timeout = (ms: number) => AbortSignal.timeout(ms);

async function json<T>(url: string, ms = 5000): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: timeout(ms), cache: "no-store" });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function ipOf(url: string) {
  const data = await json<{ ip: string }>(url, 3500);
  return data?.ip;
}

interface IpWho {
  success: boolean;
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  connection?: { asn?: number; org?: string; isp?: string; domain?: string };
  timezone?: { id?: string; utc?: string };
}

interface IpApi {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  utc_offset?: string;
  asn?: string;
  org?: string;
}

async function geo(ip?: string): Promise<PublicInfo | undefined> {
  const who = await json<IpWho>(`https://ipwho.is/${ip ?? ""}`);
  if (who?.success) {
    return {
      ip: who.ip,
      isp: who.connection?.isp,
      org: who.connection?.org,
      asn: who.connection?.asn ? `AS${who.connection.asn}` : undefined,
      domain: who.connection?.domain,
      city: who.city,
      region: who.region,
      country: who.country,
      countryCode: who.country_code,
      postal: who.postal,
      lat: who.latitude,
      lon: who.longitude,
      timezone: who.timezone?.id,
      utc: who.timezone?.utc,
    };
  }
  const api = await json<IpApi>(ip ? `https://ipapi.co/${ip}/json/` : "https://ipapi.co/json/");
  if (api?.ip) {
    return {
      ip: api.ip,
      isp: api.org,
      asn: api.asn,
      city: api.city,
      region: api.region,
      country: api.country_name,
      countryCode: api.country_code,
      postal: api.postal,
      lat: api.latitude,
      lon: api.longitude,
      timezone: api.timezone,
      utc: api.utc_offset,
    };
  }
  return undefined;
}

/** ICE gathering against a public STUN server — no camera/mic access, so no prompt */
function iceCandidates(ms = 2500): Promise<{ hosts: string[]; reflexive: string[] }> {
  return new Promise((resolve) => {
    const hosts = new Set<string>();
    const reflexive = new Set<string>();
    let pc: RTCPeerConnection;
    try {
      pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    } catch {
      return resolve({ hosts: [], reflexive: [] });
    }
    const done = () => {
      clearTimeout(timer);
      pc.close();
      resolve({ hosts: [...hosts], reflexive: [...reflexive] });
    };
    const timer = setTimeout(done, ms);
    pc.onicecandidate = (e) => {
      if (!e.candidate) return done();
      // candidate:<foundation> <component> <protocol> <priority> <address> <port> typ <type> …
      const parts = e.candidate.candidate.split(" ");
      const address = parts[4];
      const type = parts[7];
      if (!address) return;
      if (type === "host") hosts.add(address);
      if (type === "srflx") reflexive.add(address);
    };
    pc.createDataChannel("ipconfig");
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(done);
  });
}

let cache: Promise<NetInfo> | null = null;

export function collectNetInfo(fresh = false): Promise<NetInfo> {
  if (cache && !fresh) return cache;
  cache = (async () => {
    const conn = (navigator as Navigator & { connection?: Connection }).connection;
    const [ipv4, ipv6, ice] = await Promise.all([
      ipOf("https://api4.ipify.org?format=json"),
      ipOf("https://api6.ipify.org?format=json"),
      iceCandidates(),
    ]);
    const info: NetInfo = {
      online: navigator.onLine,
      type: conn?.type,
      effectiveType: conn?.effectiveType,
      downlink: conn?.downlink,
      rtt: conn?.rtt,
      saveData: conn?.saveData,
      ipv4,
      ipv6: ipv6 && ipv6 !== ipv4 ? ipv6 : undefined,
      geo: await geo(ipv4 ?? ipv6),
      hosts: ice.hosts,
      reflexive: ice.reflexive,
    };
    return info;
  })();
  // a failed lookup should not stick for the whole session
  cache.catch(() => (cache = null));
  return cache;
}

export function flushNetInfo() {
  cache = null;
}

/** Resolves a host name through Google's public DNS-over-HTTPS (CORS-enabled JSON API) */
export async function resolveHost(host: string, type: "A" | "AAAA" = "A"): Promise<string[]> {
  const data = await json<{ Answer?: { type: number; data: string }[] }>(
    `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=${type}`,
    4000,
  );
  const want = type === "A" ? 1 : 28;
  return data?.Answer?.filter((a) => a.type === want).map((a) => a.data) ?? [];
}

/**
 * One "ping": an HTTPS round trip to the host. Browsers cannot send ICMP,
 * so this measures what a page can — the time to reach the server over the network.
 */
export async function httpPing(host: string, signal?: AbortSignal): Promise<number | null> {
  const started = performance.now();
  try {
    await fetch(`https://${host}/favicon.ico?ping=${Date.now()}`, {
      mode: "no-cors",
      cache: "no-store",
      signal: signal ? AbortSignal.any([signal, timeout(4000)]) : timeout(4000),
    });
    return Math.max(1, Math.round(performance.now() - started));
  } catch {
    return null;
  }
}

interface UAData {
  brands?: { brand: string; version: string }[];
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, string | boolean | undefined>>;
}

export interface DeviceInfo {
  browser: string;
  platform: string;
  platformVersion?: string;
  architecture?: string;
  bitness?: string;
  model?: string;
  cores?: number;
  memory?: number;
  screen: string;
  pixelRatio: number;
  timezone: string;
  languages: string[];
  userAgent: string;
}

/** Device details from User-Agent Client Hints — high-entropy hints never prompt the user */
export async function collectDeviceInfo(): Promise<DeviceInfo> {
  const nav = navigator as Navigator & { userAgentData?: UAData; deviceMemory?: number };
  const ua = nav.userAgentData;
  let high: Record<string, string | boolean | undefined> = {};
  try {
    high = (await ua?.getHighEntropyValues?.(["platformVersion", "architecture", "bitness", "model", "fullVersionList"])) ?? {};
  } catch {}
  const brand = ua?.brands?.find((b) => !/not.?a.?brand/i.test(b.brand) && b.brand !== "Chromium") ?? ua?.brands?.[0];
  return {
    browser: brand ? `${brand.brand} ${brand.version}` : nav.userAgent.split(" ").slice(-1)[0],
    platform: ua?.platform || nav.platform,
    platformVersion: high.platformVersion as string | undefined,
    architecture: high.architecture as string | undefined,
    bitness: high.bitness as string | undefined,
    model: (high.model as string | undefined) || undefined,
    cores: nav.hardwareConcurrency,
    memory: nav.deviceMemory,
    screen: `${screen.width}x${screen.height}`,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: [...navigator.languages],
    userAgent: nav.userAgent,
  };
}
