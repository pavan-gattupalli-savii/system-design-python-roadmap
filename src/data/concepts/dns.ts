import type { Concept } from "./index";

export const dns: Concept = {
  slug:     "dns",
  title:    "DNS",
  emoji:    "📡",
  category: "Networking",
  tagline:  "How domain names resolve to IP addresses",
  roadmapKeywords: ["dns", "domain", "nameserver", "ttl", "a record", "cname", "mx", "route53", "resolve"],
  related:  ["cdn", "load-balancing", "latency"],

  sections: [
    {
      heading: "Why DNS Exists",
      body: `Computers communicate via IP addresses (e.g., 142.250.80.46). Humans are bad at memorising numbers. DNS (Domain Name System) is the internet's phone book — a globally distributed database that maps human-readable domain names (google.com) to machine-readable IP addresses.

DNS was designed in 1983 by Paul Mockapetris as a replacement for a single HOSTS.TXT file that every computer on the internet downloaded periodically. As the internet grew, a central file became unmanageable. DNS introduced a hierarchical, distributed, and cacheable naming system that scales to billions of domains.

DNS is critical infrastructure: it runs on almost every internet request. A browser loads a page → DNS resolves 20-30 domain names for analytics, fonts, CDNs, APIs. DNS failures or slowness directly impact page load time and availability.`,
      diagram: "dns-resolution",
    },
    {
      heading: "DNS Resolution — Step by Step",
      body: `When your browser needs to resolve api.example.com:

1. Browser cache: browsers cache DNS results (Chrome: up to 1 minute). Check here first.
2. OS cache / hosts file: operating system has its own DNS cache. /etc/hosts file on Linux/Mac is checked before any network query.
3. Recursive resolver (DNS resolver): your ISP or configured DNS server (e.g., 8.8.8.8 Google, 1.1.1.1 Cloudflare). This server does the heavy lifting — it queries other DNS servers on your behalf and caches results.
4. Root nameserver: the recursive resolver asks a root server "who handles .com?" There are 13 root server addresses (a.root-servers.net to m.root-servers.net), each operated by different organisations, with thousands of anycast instances worldwide.
5. TLD (Top-Level Domain) nameserver: the root server says "for .com, ask Verisign's nameservers." The recursive resolver asks Verisign "who handles example.com?"
6. Authoritative nameserver: Verisign points to example.com's authoritative nameserver (e.g., Route 53, Cloudflare DNS). This server has the actual DNS records for example.com. It returns the A record: api.example.com → 93.184.216.34.
7. Response cached and returned: recursive resolver caches the result for the record's TTL duration and returns the IP to the browser.

Total time for a cold (uncached) lookup: 50-100ms. Warm (cached): 0ms.`,
    },
    {
      heading: "DNS Record Types",
      table: {
        cols: ["Record Type", "Full Name", "What it does", "Example value"],
        rows: [
          ["A",      "Address",              "Maps domain to IPv4 address",                                    "93.184.216.34"],
          ["AAAA",   "IPv6 Address",         "Maps domain to IPv6 address",                                    "2606:2800:220:1:248:1893:25c8:1946"],
          ["CNAME",  "Canonical Name",       "Alias from one domain to another. The target must be an A/AAAA record, not an IP.", "api.example.com → app.myhost.com"],
          ["MX",     "Mail Exchange",        "Specifies mail server for the domain; has priority (lower = higher priority)", "10 mail.example.com, 20 backup-mail.example.com"],
          ["NS",     "Name Server",          "Specifies the authoritative DNS servers for the domain",          "ns1.awsdns-01.com"],
          ["TXT",    "Text",                 "Arbitrary text; used for domain verification, SPF, DKIM, DMARC",  "v=spf1 include:_spf.google.com ~all"],
          ["SRV",    "Service",              "Specifies host + port for a service. Used by SIP, XMPP, Kubernetes", "_http._tcp.example.com → 10 0 80 web.example.com"],
          ["SOA",    "Start of Authority",   "Metadata about the zone: primary NS, admin email, serial number, refresh/retry intervals", "ns1.example.com. admin.example.com. 2025042901 3600 900 604800 300"],
          ["PTR",    "Pointer",              "Reverse DNS: maps IP address back to domain name",                "34.216.184.93.in-addr.arpa → example.com"],
          ["CAA",    "Certification Authority Authorization", "Restricts which CAs can issue SSL certs for the domain", "0 issue 'letsencrypt.org'"],
        ],
      },
      callout: {
        kind: "note",
        text: "CNAME cannot be used on the zone apex (the root domain, e.g., example.com without a subdomain) — only on subdomains. This is why Cloudflare and Route 53 invented 'ALIAS' or 'ANAME' records: they resolve CNAME-like at the DNS level but return A records, allowing use at the apex. This is how example.com can point to a load balancer DNS name.",
      },
    },
    {
      heading: "TTL — Time to Live",
      body: `Every DNS record has a TTL (Time to Live) value in seconds. This tells resolvers and caches how long they can store the record before querying again.

High TTL (e.g., 86400 = 24 hours): resolver caches the record for a day. Fewer queries to your authoritative DNS server (lower cost, lower latency for cached lookups). But: if you change the record (e.g., change server IP during an incident), it takes up to TTL seconds for all clients to pick up the change. During a disaster recovery, you might be waiting hours for old IPs to expire globally.

Low TTL (e.g., 60 = 1 minute): DNS changes propagate in ~1 minute globally. But: every resolver re-queries every minute. More DNS query volume, slightly higher cost, and slightly higher lookup latency for uncached requests.

TTL strategy for production:
- Normal operation: use TTL 300-3600 (5 min to 1 hour) for A records. Good balance.
- Before a planned migration: lower TTL to 60-300 a few days before the change. Wait for caches to flush. Make the change. After migration is stable, raise TTL back.
- For static nameserver records (NS): use very high TTL (172800 = 48 hours) — these rarely change.`,
    },
    {
      heading: "DNS-Based Load Balancing and Geo-Routing",
      body: `DNS can be used as a primitive load balancer by returning different IPs for the same domain:

Round-robin DNS: configure multiple A records for the same name: example.com → [1.2.3.4, 5.6.7.8]. Resolvers cycle through them. Not true load balancing (ignores server health and load), but distributes traffic at the DNS level.

Weighted routing (AWS Route 53): assign weights to different records. 80% of queries → production server, 20% → canary server. Useful for canary deployments.

Latency-based routing (AWS Route 53, Google Cloud DNS): return the IP of the endpoint with the lowest network latency from the user's location. A user in Singapore gets the Singapore server's IP automatically.

Geolocation routing: return different IP based on user's country/region. EU users → EU servers (GDPR compliance). US users → US servers.

Health-check-based failover: DNS actively monitors endpoint health. If primary IP is unhealthy, automatically switch DNS responses to secondary IP. Route 53 health checks enable this with ~30 second failover time (faster than TTL expiry with pre-lowered TTL).`,
    },
    {
      heading: "DNS Security — DNSSEC, DoH, DoT",
      body: `DNS was designed in 1983 without security in mind. Original DNS is unencrypted, unauthenticated, and vulnerable to several attacks.

DNS cache poisoning (Kaminsky attack, 2008): attacker floods resolver with forged responses, tricking it into caching a fake IP for a legitimate domain. All users of that resolver are redirected to the attacker's server.

DNSSEC (DNS Security Extensions): adds cryptographic signatures to DNS records. Resolvers verify signatures against a chain of trust rooted at the root zone's signing key. Proves that responses are authentic and unmodified. Doesn't encrypt — just signs.

DNS-over-HTTPS (DoH): encrypts DNS queries inside HTTPS requests. ISP and network observers can't see which domains you're resolving. Used by Firefox (Cloudflare DoH by default), Chrome, and iOS.

DNS-over-TLS (DoT): encrypts DNS queries over TLS on port 853. More transparent than DoH (runs on dedicated port, easier to monitor by network admins). Supported by Android 9+, many enterprise DNS resolvers.`,
      callout: {
        kind: "tip",
        text: "For production systems: use AWS Route 53 or Cloudflare DNS for high-availability authoritative DNS (both offer 100% SLA). Enable health checks with automatic failover. Lower TTL to 60-300 before any planned infrastructure change. Never let TTL be the reason your incident lasts longer.",
      },
    },
  ],
};
