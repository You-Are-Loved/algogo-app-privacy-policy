// CS Fundamentals - Networking
// What happens when you type a URL: DNS, TCP, TLS, HTTP, and the protocols underneath

import { Category } from '../../types';

export const networking: Category = {
  id: 'cs-networking',
  name: 'Networking',
  slug: 'cs-networking',
  description: 'What happens when you type a URL: DNS, TCP, TLS, HTTP, and the protocols underneath',
  icon: 'globe-outline',
  color: '#10B981',
  colorDark: '#059669',
  premium: true,

  learnContent: [
    {
      id: 'cs-net-1',
      title: 'The Layered Model and Typing a URL',
      content: `Networking is a stack of layers, each solving one problem and handing its payload to the layer below. Interviewers ask "what happens when you type a URL" to see whether you can walk the whole stack in order.

**The Layers (TCP/IP model):**
- **Application** - HTTP, DNS, TLS, SSH: the bytes your program cares about
- **Transport** - TCP (reliable, ordered byte stream) or UDP (fire-and-forget datagrams); addressed by port
- **Internet** - IP: routes packets between networks by address; best effort, may drop, duplicate, or reorder
- **Link** - Ethernet, Wi-Fi: moves frames between directly connected devices using MAC addresses

**Encapsulation:**
Each layer wraps the layer above in its own header: an HTTP request becomes the payload of a TCP segment, which becomes the payload of an IP packet, which becomes the payload of an Ethernet frame. The receiver peels headers off in reverse. Routers look only at IP headers; only the two endpoints look at TCP or HTTP.

**Typing https://example.com/search?q=cats:**
1. Browser parses the URL: scheme \`https\`, host \`example.com\`, port 443, path \`/search\`, query \`q=cats\`
2. Checks HSTS and caches, then resolves \`example.com\` via DNS (browser cache → OS cache → recursive resolver → root / TLD / authoritative)
3. Opens a TCP connection to that IP on port 443 (three-way handshake, 1 RTT)
4. Runs a TLS handshake: verifies the certificate chain, agrees on session keys, negotiates HTTP/2 via ALPN (1 RTT)
5. Sends the HTTP request; a load balancer forwards it to an application server, which returns a response
6. Browser parses the HTML, discovers CSS/JS/images, fetches them over the same connection, builds the DOM, and renders

**Warm vs Cold:**
On a repeat visit most steps collapse: DNS is cached, the TCP connection is kept alive, the TLS session resumes, and assets come from the HTTP cache with a \`304\` or no request at all.

**Why It Matters:**
Every later topic is one step of this walk. A strong answer names each step, says what can fail there (NXDOMAIN, connection refused, certificate error, 5xx), and knows which steps are skipped when warm.`,
      codeExample: `# curl -v shows every layer of the walk in order
$ curl -v https://example.com/

* Resolved example.com -> 203.0.113.10          # DNS (application layer, over UDP 53)
* Trying 203.0.113.10:443...
* Connected to example.com port 443             # TCP three-way handshake complete
* ALPN: curl offers h2,http/1.1                 # sent inside the TLS ClientHello
* TLSv1.3 (OUT), TLS handshake, Client hello
* TLSv1.3 (IN),  TLS handshake, Server hello
* TLSv1.3 (IN),  TLS handshake, Certificate     # leaf + intermediate certs
* TLSv1.3 (IN),  TLS handshake, Finished
* TLSv1.3 (OUT), TLS handshake, Finished        # 1 RTT: client can now send data
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* Server certificate:
*   subject: CN=example.com
*   issuer:  O=Example Trust; CN=Example Intermediate CA
*   SSL certificate verify ok.                  # chain of trust validated
* ALPN: server accepted h2                      # HTTP/2 negotiated

> GET / HTTP/2                                  # application layer request
> Host: example.com
> User-Agent: curl/8.4.0
> Accept: */*
>
< HTTP/2 200
< content-type: text/html; charset=UTF-8
< cache-control: max-age=604800                 # browser may reuse for a week
< etag: "3147526947"
< content-length: 1256
<
<!doctype html> ...

# Second request on the same connection: no DNS, no TCP, no TLS
$ curl -v https://example.com/about --next https://example.com/
* Re-using existing connection with host example.com`
    },
    {
      id: 'cs-net-2',
      title: 'IP, Routing, NAT, and Ports',
      content: `IP delivers packets between networks with no guarantees; everything above it builds on that. Interviewers probe addressing, how packets find their way, and why NAT shapes so much of how the internet really works.

**Addresses and CIDR:**
- IPv4: 32 bits, four octets (\`203.0.113.10\`); IPv6: 128 bits, hex groups (\`2001:db8::1\`)
- CIDR \`10.1.0.0/16\`: the first 16 bits identify the network, the rest the host; a \`/24\` holds 256 addresses, a \`/32\` is one host
- Private ranges (never routed on the public internet): \`10.0.0.0/8\`, \`172.16.0.0/12\`, \`192.168.0.0/16\`; \`127.0.0.0/8\` is loopback

**Routing:**
- Each router holds a table of prefix → next hop and picks the **longest matching prefix**; \`0.0.0.0/0\` is the default route
- Forwarding is hop by hop: no router knows the whole path, each just sends the packet closer
- **TTL** (hop limit) is decremented per hop; at 0 the packet is dropped and an ICMP Time Exceeded goes back - \`traceroute\` sends probes with TTL 1, 2, 3... to map the path
- Inside an organization routes are learned by OSPF or IS-IS; between organizations (autonomous systems) by BGP

**NAT (Network Address Translation):**
- Home and office networks use private addresses behind one public IP
- The NAT router rewrites the source IP:port of outgoing packets to its public IP and a unique port, records the mapping, and reverses it for replies
- Consequence: inbound connections have no mapping and are dropped. Servers need a public IP or port forwarding; peer-to-peer apps use STUN/TURN to hole-punch

**Ports and the 5-Tuple:**
- A port (0-65535) identifies a process on a host: 80 HTTP, 443 HTTPS, 53 DNS, 22 SSH
- A connection is identified by (src IP, src port, dst IP, dst port, protocol); thousands of clients share server port 443 because their source pairs differ
- Clients use OS-assigned **ephemeral** source ports (32768-60999 on Linux), which is also why one client host can run out of ports when hammering a single server

**MTU and Fragmentation:**
Links have a maximum frame size (Ethernet: 1500 bytes). Larger IP packets are fragmented, or with the Don't Fragment bit set, dropped with an ICMP "fragmentation needed" message. Path MTU Discovery uses that signal to find a safe packet size; firewalls that block ICMP cause mysterious hangs on large transfers.`,
      codeExample: `// Longest-prefix match: the core of every routing table
type Route = { prefix: string; bits: number; nextHop: string };

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function matches(ip: string, prefix: string, bits: number): boolean {
  if (bits === 0) return true;                        // 0.0.0.0/0 matches everything
  const mask = (0xffffffff << (32 - bits)) >>> 0;
  return (ipToInt(ip) & mask) === (ipToInt(prefix) & mask);
}

function nextHop(table: Route[], dst: string): string | undefined {
  return table
    .filter((r) => matches(dst, r.prefix, r.bits))
    .sort((a, b) => b.bits - a.bits)[0]?.nextHop;      // most specific route wins
}

const table: Route[] = [
  { prefix: '0.0.0.0',  bits: 0,  nextHop: 'isp-gateway' },   // default route
  { prefix: '10.0.0.0', bits: 8,  nextHop: 'core-router' },
  { prefix: '10.1.0.0', bits: 16, nextHop: 'branch-office' },
];

nextHop(table, '10.1.2.3');     // 'branch-office'  (/16 beats /8)
nextHop(table, '10.9.0.1');     // 'core-router'
nextHop(table, '203.0.113.5');  // 'isp-gateway'

// NAT: private (ip, port) <-> public port, so replies can be mapped back
const natTable = new Map<number, { ip: string; port: number }>();
let nextPublicPort = 40000;

function outbound(srcIp: string, srcPort: number, publicIp: string): string {
  const publicPort = nextPublicPort++;
  natTable.set(publicPort, { ip: srcIp, port: srcPort });
  return publicIp + ':' + publicPort;                  // what the server sees
}

function inbound(publicPort: number) {
  return natTable.get(publicPort);                     // undefined => no mapping, packet dropped
}

outbound('192.168.1.20', 51234, '203.0.113.9');  // '203.0.113.9:40000'
inbound(40000);                                  // { ip: '192.168.1.20', port: 51234 }
inbound(40001);                                  // undefined: unsolicited inbound is blocked`
    },
    {
      id: 'cs-net-3',
      title: 'TCP vs UDP',
      content: `TCP turns IP's unreliable packets into a reliable, ordered byte stream. UDP leaves IP almost bare. Knowing exactly what TCP adds - and what it costs - is the most-asked networking topic.

**Connection Setup - Three-Way Handshake:**
1. Client → **SYN** (seq = x)
2. Server → **SYN-ACK** (seq = y, ack = x + 1)
3. Client → **ACK** (ack = y + 1), and may send data in the same packet
One full round trip before any application data. Both sides now have synchronized sequence numbers; the third message also proves the client really received the server's reply.

**Teardown:**
Four-way FIN/ACK exchange. The side that closes first sits in **TIME_WAIT** for 2×MSL (60 seconds on Linux) so stray segments cannot corrupt a new connection reusing the same 5-tuple. This is why a restarted server sees "address already in use" unless it sets \`SO_REUSEADDR\`.

**Reliability:**
- Every byte has a sequence number; the receiver ACKs the next byte it expects (cumulative ACK), plus optional SACK blocks describing gaps
- Loss detection: a retransmission timeout (RTO, derived from smoothed RTT estimates) or **fast retransmit** after three duplicate ACKs
- Checksums catch corruption; duplicates are dropped by sequence number

**Flow Control vs Congestion Control:**
- **Flow control** protects the *receiver*: it advertises a receive window (rwnd); the sender never has more than rwnd unacknowledged bytes in flight. A zero window pauses the sender, which probes periodically
- **Congestion control** protects the *network*: the sender keeps a congestion window (cwnd). **Slow start** doubles cwnd every RTT from about 10 segments; past ssthresh, **congestion avoidance** adds one segment per RTT; loss cuts it (AIMD: additive increase, multiplicative decrease). CUBIC is the Linux default; BBR models bandwidth and RTT instead of reacting to loss
- Effective window = min(rwnd, cwnd)

**Head-of-Line Blocking:**
The stream must be delivered in order, so one lost segment holds back every later segment already sitting in the receive buffer until the retransmission arrives. HTTP/2 multiplexes many streams over one TCP connection, so a single lost packet stalls all of them - the problem QUIC was built to fix.

**Nagle's Algorithm:**
Coalesces small writes while a previous segment is unacknowledged, to avoid floods of tiny packets. Interactive protocols set \`TCP_NODELAY\` to disable it; combined with delayed ACKs it causes the classic 40 ms stall.

**UDP:**
- No connection, no ordering, no retransmission, no congestion control; 8-byte header vs TCP's 20+
- Message boundaries are preserved: one \`send\` = one datagram = one \`recv\`
- Used where late data is useless or the app does its own recovery: DNS, VoIP, video, games, and QUIC (which reimplements reliability and congestion control in user space on top of UDP)`,
      codeExample: `import * as net from 'net';
import * as dgram from 'dgram';

// TCP: a connection-oriented byte STREAM. 'data' events are arbitrary chunks,
// not messages - two writes may arrive as one chunk, or one write as two.
const tcpServer = net.createServer((socket) => {
  socket.setNoDelay(true);              // disable Nagle for latency-sensitive traffic
  let buffered = '';
  socket.on('data', (chunk) => {
    buffered += chunk.toString();
    let idx: number;
    while ((idx = buffered.indexOf('\\n')) !== -1) {   // re-frame the stream ourselves
      const message = buffered.slice(0, idx);
      buffered = buffered.slice(idx + 1);
      socket.write('echo: ' + message + '\\n');
    }
  });
  socket.on('error', (err) => console.error('tcp error', err.message));
});
// The kernel completes the 3-way handshake before 'connection' fires
tcpServer.listen(4000);

// UDP: connectionless DATAGRAMS. Each 'message' is exactly one packet;
// it may be lost, duplicated, or reordered - the application must cope.
const udpServer = dgram.createSocket('udp4');
udpServer.on('message', (msg, rinfo) => {
  // No handshake happened: rinfo.address is whoever claims to have sent it
  udpServer.send('pong', rinfo.port, rinfo.address);
});
udpServer.bind(4001);

// TCP client: connect() returns immediately; 'connect' fires once the
// handshake's final ACK is sent and the socket is ESTABLISHED.
const client = net.connect({ host: '127.0.0.1', port: 4000 }, () => {
  client.write('hello\\n');
});
client.on('data', (d) => {
  console.log(d.toString());          // 'echo: hello'
  client.end();                       // sends FIN; we enter TIME_WAIT after the close completes
});`
    },
    {
      id: 'cs-net-4',
      title: 'DNS: Resolution, Caching, and Records',
      content: `DNS translates names to addresses through a distributed, cached, hierarchical database. It is the first step of every request and a frequent root cause of outages.

**The Hierarchy:**
- **Root servers** know the name servers for every top-level domain (\`.com\`, \`.org\`, \`.io\`)
- **TLD servers** know the authoritative name servers for each registered domain
- **Authoritative servers** hold the zone's actual records and give definitive answers
- Names read right to left: \`api.example.com.\` is host \`api\` in zone \`example.com\` under TLD \`com\` under the root

**Recursive vs Iterative Resolution:**
- Your OS **stub resolver** sends one *recursive* query to a **recursive resolver** (your ISP's, \`8.8.8.8\`, \`1.1.1.1\`, or a corporate one) and waits for the final answer
- The recursive resolver works *iteratively*: it asks a root server (referral to \`.com\`), a \`.com\` server (referral to \`example.com\`'s NS), then the authoritative server (the A record)
- Every response is cached for its **TTL**; a warm resolver skips straight to the authoritative server or answers from cache

**Caching and TTL:**
- Caches exist in the browser, the OS, the recursive resolver, and often inside apps and runtimes
- Lower the TTL well before a migration so stale answers expire quickly; raise it afterwards to cut load
- **Negative caching**: NXDOMAIN answers are cached too (governed by the SOA minimum), so a typo in a brand-new record can linger

**Record Types:**
- \`A\` / \`AAAA\` - IPv4 / IPv6 address
- \`CNAME\` - alias to another name; a name with a CNAME may hold no other records, so it cannot sit at the zone apex where SOA and NS live (providers offer ALIAS/ANAME flattening)
- \`NS\` - the zone's authoritative servers; \`SOA\` - zone metadata (serial, refresh, negative TTL)
- \`MX\` - mail servers with priority; \`TXT\` - SPF, DKIM, DMARC, ownership verification
- \`PTR\` - reverse lookup (IP → name); \`SRV\` - service location including port

**Transport and Security:**
- Queries use UDP port 53; TCP is used when a response is truncated (over 512 bytes without EDNS) or for zone transfers (AXFR)
- **DNSSEC** signs records so resolvers can detect tampering (it does not encrypt)
- **DoH / DoT** encrypt the stub-to-resolver hop so on-path observers cannot read or spoof lookups

**Interview Angles:**
DNS-based load balancing and GeoDNS return different answers per client. Health checks can pull a bad IP out of rotation, but only as fast as TTLs expire. Round-robin A records give crude client-side balancing; a CDN's CNAME chain is how traffic reaches the nearest edge.`,
      codeExample: `$ dig +trace api.example.com A            # show each iterative step

.                    518400  IN  NS  a.root-servers.net.   # 1. root referral
com.                 172800  IN  NS  a.gtld-servers.net.   # 2. .com TLD referral
example.com.         172800  IN  NS  ns1.example.com.      # 3. authoritative NS
api.example.com.        300  IN  A   203.0.113.10          # 4. the answer, TTL 300s

$ dig www.example.com                     # a normal recursive query
;; ANSWER SECTION:
www.example.com.     300  IN  CNAME  example.com.          # alias resolved first...
example.com.          60  IN  A      203.0.113.10          # ...then the A record
;; Query time: 23 msec
;; SERVER: 1.1.1.1#53(1.1.1.1)            # answered by the recursive resolver

$ dig www.example.com                     # asked again one second later
;; ANSWER SECTION:
www.example.com.     299  IN  CNAME  example.com.          # TTL counting down
example.com.          59  IN  A      203.0.113.10
;; Query time: 1 msec                     # served from the resolver's cache

$ dig nosuch.example.com
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN   # cached negatively per SOA minimum

$ dig example.com MX
example.com.   3600  IN  MX  10 mail1.example.com.        # lower priority number wins
example.com.   3600  IN  MX  20 mail2.example.com.        # backup

// Programmatic lookups in Node
import { promises as dns } from 'dns';

// dns.lookup uses the OS stub resolver (getaddrinfo): honours /etc/hosts and OS cache
const { address } = await dns.lookup('api.example.com');     // '203.0.113.10'

// dns.resolve* talks to the configured name server directly, bypassing /etc/hosts
const ips = await dns.resolve4('api.example.com');           // ['203.0.113.10']
const mx  = await dns.resolveMx('example.com');              // [{ priority: 10, exchange: 'mail1.example.com' }, ...]`
    },
    {
      id: 'cs-net-5',
      title: 'TLS: Handshake, Certificates, and Forward Secrecy',
      content: `TLS gives HTTP its "S": confidentiality, integrity, and server authentication. Interviewers want the handshake, why certificates are trusted, and what forward secrecy actually buys.

**TLS 1.3 Handshake (1 RTT):**
1. **ClientHello** - supported versions and cipher suites, a fresh (EC)DHE key share, **SNI** (the hostname, so the server picks the right certificate), **ALPN** (\`h2\`, \`http/1.1\`)
2. **ServerHello** - chosen cipher and the server's key share. Both sides can now derive handshake keys, so everything after this is encrypted: **Certificate** (leaf + intermediates), **CertificateVerify** (a signature over the transcript with the certificate's private key, proving possession), **Finished**
3. Client verifies the chain and the signature, sends **Finished**, and immediately sends application data
TLS 1.2 needed two round trips and allowed RSA key exchange; 1.3 removed RSA key transport, static DH, and weak ciphers, and encrypts the certificate.

**Chain of Trust:**
- The **leaf** certificate binds a public key to domain names (Subject Alternative Names) and is signed by an **intermediate CA**, which is signed by a **root CA**
- Roots live in the OS or browser trust store; intermediates are sent by the server; the client builds the chain and checks each signature
- The client also checks hostname vs SAN, validity dates, key usage, and revocation (CRL, OCSP, or **OCSP stapling**, where the server attaches a fresh signed status)
- Let's Encrypt automates issuance by proving domain control (ACME \`HTTP-01\` or \`DNS-01\` challenges)

**Forward Secrecy:**
Session keys derive from ephemeral ECDHE key shares generated per handshake and discarded. If an attacker records traffic today and steals the server's long-term private key next year, the recording still cannot be decrypted. RSA key exchange lacked this: the pre-master secret was encrypted to the long-term key, so one leak unlocked every past session.

**Session Resumption and 0-RTT:**
After a full handshake the server issues a pre-shared-key ticket; the next connection resumes in 1 RTT, or sends data in **0-RTT** along with the ClientHello. 0-RTT data can be replayed by an attacker, so it must carry only idempotent requests.

**Symmetric After the Handshake:**
Asymmetric crypto is used only to authenticate and agree keys; bulk data uses AEAD ciphers (AES-GCM, ChaCha20-Poly1305) that encrypt and authenticate every record.

**Common Failure Modes:**
Expired certificate, hostname mismatch (a cert for \`example.com\` served on \`api.example.com\` without a matching SAN), missing intermediate (works in browsers that cache it, fails in curl), client clock skew, and self-signed certs in internal tooling.`,
      codeExample: `$ openssl s_client -connect example.com:443 -servername example.com -alpn h2
CONNECTED(00000003)
---
Certificate chain                               # sent by the server, leaf first
 0 s:CN = example.com                           # leaf: subject
   i:O = Example Trust, CN = Example Intermediate CA
 1 s:O = Example Trust, CN = Example Intermediate CA
   i:O = Example Trust, CN = Example Root CA    # the root itself is NOT sent;
                                                # it lives in the client's trust store
---
SSL handshake has read 4311 bytes and written 393 bytes
Verification: OK                                # chain built up to a trusted root
---
ALPN protocol: h2                               # HTTP/2 negotiated inside the handshake
Protocol  : TLSv1.3
Cipher    : TLS_AES_256_GCM_SHA384              # AEAD cipher for bulk data
Server Temp Key: X25519, 253 bits               # ephemeral key share => forward secrecy
---
Post-Handshake New Session Ticket arrived:      # PSK for resumption / 0-RTT

// Node: an HTTPS request with the client-side checks made explicit
import * as https from 'https';
import * as tls from 'tls';

const req = https.request({
  host: 'api.example.com',
  servername: 'api.example.com',          // SNI: tells the server which cert to present
  minVersion: 'TLSv1.2',
  rejectUnauthorized: true,               // default: fail on an untrusted chain
  checkServerIdentity: (host, cert) =>    // default: hostname must match a SAN
    tls.checkServerIdentity(host, cert),
}, (res) => console.log(res.statusCode));

req.on('error', (e) => console.error(e.message));
// Typical errors: CERT_HAS_EXPIRED, UNABLE_TO_VERIFY_LEAF_SIGNATURE (missing intermediate),
// ERR_TLS_CERT_ALTNAME_INVALID (hostname mismatch), SELF_SIGNED_CERT_IN_CHAIN
req.end();`
    },
    {
      id: 'cs-net-6',
      title: 'HTTP: 1.1, 2, 3, Caching, and Real-Time',
      content: `HTTP is the application protocol nearly every system you will be asked to design runs on. Know how each version uses the connection underneath, how caching is controlled, and how to push data to clients.

**HTTP/1.1:**
- Text protocol: request line, headers, blank line, body; \`Content-Length\` or chunked encoding frames the body
- **Keep-alive** (default in 1.1) reuses one TCP connection for sequential requests, avoiding a handshake per request
- **Pipelining** sends several requests without waiting, but responses must come back in order, so one slow response blocks the rest - browsers disabled it
- Workarounds: about 6 parallel connections per origin, domain sharding, sprite sheets, bundling

**HTTP/2:**
- Same semantics, new binary framing layer: requests and responses become **streams** of frames **multiplexed** over one TCP connection, with prioritization
- **HPACK** compresses headers using a static table plus a dynamic table shared across the connection - a repeated cookie costs a few bytes
- Server push was dropped by Chrome and Firefox; the wins are multiplexing and header compression
- Still one TCP stream underneath, so a single lost packet stalls **every** HTTP/2 stream (TCP head-of-line blocking)

**HTTP/3 and QUIC:**
- QUIC runs over UDP in user space with TLS 1.3 built in: connection setup takes 1 RTT (0 RTT on resumption) instead of TCP + TLS
- Each stream is delivered independently, so loss on one stream does not block the others
- Connections are identified by a **connection ID**, not the 5-tuple, so a phone switching from Wi-Fi to cellular keeps its connection (connection migration)

**Caching Headers:**
- \`Cache-Control: max-age=N\` - fresh for N seconds; \`public\` / \`private\` (shared caches vs browser only); \`no-store\` (never cache); \`no-cache\` (store, but revalidate every time); \`immutable\` (skip revalidation for fingerprinted assets)
- Validation: \`ETag\` + \`If-None-Match\`, or \`Last-Modified\` + \`If-Modified-Since\` → \`304 Not Modified\` with an empty body
- \`Vary: Accept-Encoding\` tells caches which request headers change the response
- Pattern: HTML with \`no-cache\`; fingerprinted assets (\`app.3f9a2c.js\`) with \`max-age=31536000, immutable\`

**Server → Client Push:**
- **Long polling**: the client sends a request the server holds until data exists, then immediately re-requests; simple, works everywhere, costly at scale
- **Server-Sent Events**: one long-lived response with \`Content-Type: text/event-stream\`; server → client only, text only, automatic reconnect with \`Last-Event-ID\`, plain HTTP so proxies and HTTP/2 multiplexing just work
- **WebSockets**: an HTTP \`Upgrade\` handshake, then a persistent, bidirectional, framed connection; binary allowed; needs its own auth, heartbeat, and reconnect logic and can be blocked by some proxies
- Choose SSE for feeds and notifications, WebSockets for chat, games, and collaborative editing`,
      codeExample: `# --- HTTP/1.1 on the wire: a fingerprinted asset ---
GET /app.3f9a2c.js HTTP/1.1
Host: static.example.com
Accept-Encoding: gzip, br
Connection: keep-alive

HTTP/1.1 200 OK
Content-Type: application/javascript
Content-Encoding: br
Cache-Control: public, max-age=31536000, immutable   # cache for a year, never revalidate
ETag: "3f9a2c"
Vary: Accept-Encoding
Content-Length: 48211

# --- The HTML document: always revalidate ---
GET /index.html HTTP/1.1
Host: www.example.com
If-None-Match: "a1b2c3"                              # browser holds a copy with this ETag

HTTP/1.1 304 Not Modified                            # no body: reuse the cached copy
Cache-Control: no-cache
ETag: "a1b2c3"

// --- Server-Sent Events endpoint (Node): one response that never ends ---
import * as http from 'http';

http.createServer((req, res) => {
  if (req.url !== '/events') { res.writeHead(404).end(); return; }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  let id = Number(req.headers['last-event-id'] ?? 0);   // resume after a reconnect
  const timer = setInterval(() => {
    id += 1;
    res.write('id: ' + id + '\\n');
    res.write('event: tick\\n');
    res.write('data: {"price": ' + (100 + id) + '}\\n\\n');  // blank line ends the event
  }, 1000);
  req.on('close', () => clearInterval(timer));         // client went away: stop the work
}).listen(3000);

// Browser side: EventSource reconnects automatically and re-sends Last-Event-ID
// const es = new EventSource('/events');
// es.addEventListener('tick', (e) => console.log(JSON.parse(e.data)));

// WebSocket by contrast starts as an HTTP request asking to switch protocols:
// GET /chat HTTP/1.1
// Upgrade: websocket
// Connection: Upgrade
// Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
// -> HTTP/1.1 101 Switching Protocols, then framed binary/text messages both ways`
    }
  ],

  visualizations: [
    {
      title: 'TCP Three-Way Handshake',
      description: 'One round trip of SYN, SYN-ACK, ACK before any data flows',
      nodes: [
        { id: 'client', label: 'Client\nCLOSED → SYN_SENT', x: 60, y: 40, type: 'primary' },
        { id: 'server', label: 'Server\nLISTEN', x: 320, y: 40, type: 'primary' },
        { id: 'syn', label: '1. SYN\nseq = x', x: 190, y: 100, type: 'secondary' },
        { id: 'synack', label: '2. SYN-ACK\nseq = y, ack = x+1', x: 190, y: 170, type: 'secondary' },
        { id: 'ack', label: '3. ACK\nack = y+1 (+ data)', x: 190, y: 240, type: 'secondary' },
        { id: 'est', label: 'ESTABLISHED\n1 RTT elapsed', x: 190, y: 300, type: 'success' }
      ],
      edges: [
        { from: 'client', to: 'syn' },
        { from: 'syn', to: 'server' },
        { from: 'server', to: 'synack', label: 'SYN_RCVD' },
        { from: 'synack', to: 'client' },
        { from: 'client', to: 'ack' },
        { from: 'ack', to: 'server' },
        { from: 'ack', to: 'est' }
      ]
    },
    {
      title: 'Request Path: DNS → TCP → TLS → HTTP',
      description: 'The steps between typing a URL and seeing a page',
      nodes: [
        { id: 'browser', label: 'Browser\nparses URL', x: 60, y: 50, type: 'primary' },
        { id: 'dns', label: 'DNS\ncache → resolver', x: 190, y: 50, type: 'secondary' },
        { id: 'ip', label: 'IP address\n+ port 443', x: 320, y: 50, type: 'info' },
        { id: 'tcp', label: 'TCP handshake\n1 RTT', x: 320, y: 140, type: 'secondary' },
        { id: 'tls', label: 'TLS handshake\n1 RTT, ALPN → h2', x: 190, y: 140, type: 'secondary' },
        { id: 'http', label: 'HTTP request\nGET /', x: 60, y: 140, type: 'secondary' },
        { id: 'server', label: 'Load balancer\n→ app server', x: 60, y: 240, type: 'warning' },
        { id: 'render', label: 'Render\nfetch subresources', x: 250, y: 240, type: 'success' }
      ],
      edges: [
        { from: 'browser', to: 'dns', label: 'example.com?' },
        { from: 'dns', to: 'ip', label: 'A record' },
        { from: 'ip', to: 'tcp' },
        { from: 'tcp', to: 'tls' },
        { from: 'tls', to: 'http' },
        { from: 'http', to: 'server' },
        { from: 'server', to: 'render', label: '200 + HTML' },
        { from: 'render', to: 'http', label: 'reuse connection' }
      ]
    }
  ],

  flashcards: [
    { id: 'cs-net-c1', front: 'Name the four layers of the TCP/IP model with one protocol at each.', back: 'Link (Ethernet, Wi-Fi), Internet (IP), Transport (TCP, UDP), Application (HTTP, DNS, TLS). Each layer only relies on the one below and wraps the one above.' },
    { id: 'cs-net-c2', front: 'What is encapsulation in networking?', back: 'Each layer prepends its own header to the payload from the layer above: HTTP data → TCP segment → IP packet → Ethernet frame. The receiver strips headers in reverse order. Routers only inspect the IP header.' },
    { id: 'cs-net-c3', front: 'List the major steps between typing a URL and seeing the page.', back: 'Parse URL → DNS resolution → TCP three-way handshake → TLS handshake (cert check, key agreement, ALPN) → HTTP request → server response → browser parses HTML, fetches subresources over the same connection, renders.' },
    { id: 'cs-net-c4', front: 'What problem does NAT solve, and how?', back: 'IPv4 address scarcity. The router rewrites the private source IP:port of outbound packets to its single public IP plus a unique port, records the mapping, and reverses it for replies.' },
    { id: 'cs-net-c5', front: 'Why can a public server not initiate a connection to a device behind NAT?', back: 'The NAT has no mapping for an unsolicited inbound flow, so it drops the packet. Fixes: port forwarding, the device connecting outbound first, or STUN/TURN hole punching for peer-to-peer.' },
    { id: 'cs-net-c6', front: 'What 5-tuple identifies a TCP connection?', back: 'Source IP, source port, destination IP, destination port, protocol. Thousands of clients can all use server port 443 because their (source IP, ephemeral source port) pairs differ.' },
    { id: 'cs-net-c7', front: 'WebSockets vs Server-Sent Events: when do you pick each?', back: 'SSE: server → client only, text, plain HTTP with automatic reconnect and Last-Event-ID; ideal for feeds and notifications. WebSockets: bidirectional, binary-capable, needs its own auth/heartbeat/reconnect; for chat, games, and collaborative editing.' },
    { id: 'cs-net-c8', front: 'How does a router choose where to forward a packet?', back: 'Longest-prefix match against its routing table: the most specific prefix covering the destination wins (10.1.0.0/16 beats 10.0.0.0/8). The default route 0.0.0.0/0 catches everything else.' },
    { id: 'cs-net-c9', front: 'ETag vs Last-Modified for cache validation?', back: 'ETag is an opaque version identifier sent back via If-None-Match; Last-Modified is a timestamp with one-second resolution sent via If-Modified-Since. Both yield 304 Not Modified when unchanged; ETag is more precise and content-based.' },
    { id: 'cs-net-c10', front: 'What does the CIDR notation 10.0.0.0/8 mean?', back: 'The first 8 bits are the network prefix and the remaining 24 are host bits, about 16.7 million addresses. A /24 has 256 addresses (254 usable hosts); a /32 is a single host.' },
    { id: 'cs-net-c11', front: 'Describe the TCP three-way handshake.', back: 'Client sends SYN (seq = x). Server replies SYN-ACK (seq = y, ack = x+1). Client sends ACK (ack = y+1), optionally with data. Both sides now have synchronized sequence numbers; it costs one round trip.' },
    { id: 'cs-net-c12', front: 'Why does TCP need three handshake messages rather than two?', back: 'Each side must prove it can both send and receive: the SYN-ACK proves the server got the SYN, and the final ACK proves the client got the SYN-ACK. It also lets the server discard stale duplicate SYNs that get no follow-up ACK.' },
    { id: 'cs-net-c13', front: 'What is the difference between TCP flow control and congestion control?', back: 'Flow control protects a slow receiver via the advertised receive window (rwnd). Congestion control protects the network via the sender-computed congestion window (cwnd). The sender transmits at most min(rwnd, cwnd).' },
    { id: 'cs-net-c14', front: 'How does TCP slow start work?', back: 'cwnd starts at about 10 segments and doubles every RTT until loss or ssthresh, then congestion avoidance grows it by one segment per RTT. Loss cuts cwnd sharply (multiplicative decrease) - the AIMD sawtooth.' },
    { id: 'cs-net-c15', front: 'How does a TCP sender detect a lost segment?', back: 'Either the retransmission timer (RTO, from smoothed RTT estimates) expires with no ACK, or three duplicate ACKs arrive and trigger fast retransmit without waiting for the timer.' },
    { id: 'cs-net-c16', front: 'What is head-of-line blocking in TCP?', back: 'TCP delivers bytes in order, so one lost segment stalls delivery of every later segment - even ones already received - until the retransmission arrives. HTTP/2 inherits this across all its streams; QUIC fixes it with independent streams.' },
    { id: 'cs-net-c17', front: 'When would you choose UDP over TCP?', back: 'When low latency beats reliability or the app handles recovery itself: DNS, VoIP, video, games, QUIC. UDP has no handshake, ordering, retransmission, or congestion control, and preserves message boundaries.' },
    { id: 'cs-net-c18', front: 'What is TIME_WAIT and why does it exist?', back: 'The side that closes first waits 2×MSL (60 s on Linux) so stray late segments die and the final ACK can be resent if lost. It is why a restarted server gets "address already in use" unless it sets SO_REUSEADDR.' },
    { id: 'cs-net-c19', front: 'What is Nagle\'s algorithm and when do you disable it?', back: 'It buffers small writes while a previous segment is unacknowledged, reducing tiny-packet overhead. Disable it with TCP_NODELAY for latency-sensitive interactive traffic (games, RPC), especially since it interacts badly with delayed ACKs.' },
    { id: 'cs-net-c20', front: 'What is the difference between a recursive and an authoritative DNS server?', back: 'A recursive resolver (e.g. 8.8.8.8) answers on the client\'s behalf by walking root → TLD → authoritative and caching results. An authoritative server hosts the zone\'s records and gives the definitive answer.' },
    { id: 'cs-net-c21', front: 'Walk through an uncached DNS lookup for api.example.com.', back: 'Stub resolver asks the recursive resolver; it asks a root server (referral to .com), a .com TLD server (referral to example.com\'s NS), then the authoritative server, which returns the A record. Each answer is cached for its TTL.' },
    { id: 'cs-net-c22', front: 'What is a CNAME record and what is its main restriction?', back: 'An alias mapping one name to another (www.example.com → example.com). A name with a CNAME can hold no other records, so it cannot be used at a zone apex, which must carry SOA and NS records.' },
    { id: 'cs-net-c23', front: 'What do A, AAAA, MX, NS, and TXT records store?', back: 'A: IPv4 address. AAAA: IPv6 address. MX: mail server hostname with priority. NS: the zone\'s authoritative name servers. TXT: arbitrary text used for SPF, DKIM, DMARC, and domain-ownership verification.' },
    { id: 'cs-net-c24', front: 'Why does DNS use UDP, and when does it fall back to TCP?', back: 'A lookup is one small request and one small response, so UDP avoids handshake cost. TCP is used when the response is truncated (larger than 512 bytes without EDNS) and for zone transfers.' },
    { id: 'cs-net-c25', front: 'What does a TLS certificate prove and how does the client verify it?', back: 'That a CA vouches this public key belongs to these domain names. The client builds the chain leaf → intermediate → trusted root, checks each signature, matches the hostname to a SAN, checks validity dates, and checks revocation.' },
    { id: 'cs-net-c26', front: 'What is forward secrecy?', back: 'Session keys come from ephemeral (EC)DHE key shares generated per handshake and discarded. Compromising the server\'s long-term private key later cannot decrypt previously recorded sessions. TLS 1.3 mandates it.' },
    { id: 'cs-net-c27', front: 'What is ALPN and why does HTTP/2 depend on it?', back: 'Application-Layer Protocol Negotiation: the ClientHello lists protocols (h2, http/1.1) and the server picks one in the handshake, so no extra round trip is spent upgrading. Browsers only speak HTTP/2 over TLS negotiated via ALPN.' },
    { id: 'cs-net-c28', front: 'What does SNI do in TLS?', back: 'Server Name Indication puts the requested hostname in the ClientHello, so a server hosting many domains on one IP can present the right certificate before any HTTP Host header exists.' },
    { id: 'cs-net-c29', front: 'How does HTTP/2 improve on HTTP/1.1 and what limit remains?', back: 'Binary framing multiplexes many streams over one TCP connection and HPACK compresses headers, removing HTTP-level head-of-line blocking and the six-connections-per-origin hack. TCP-level head-of-line blocking remains: one lost packet stalls all streams.' },
    { id: 'cs-net-c30', front: 'What does HTTP/3 change and why?', back: 'It runs over QUIC (UDP) with per-stream loss recovery, so one lost packet stalls only its stream; integrates TLS 1.3 for 1-RTT or 0-RTT setup; and uses connection IDs so a connection survives an IP change (Wi-Fi → cellular).' }
  ],

  quizQuestions: [
    {
      id: 'cs-net-q1',
      question: 'On a first visit to https://example.com, in which order do these happen?',
      options: ['TCP handshake → DNS lookup → TLS handshake → HTTP request', 'TLS handshake → TCP handshake → DNS lookup → HTTP request', 'DNS lookup → TCP handshake → TLS handshake → HTTP request', 'DNS lookup → TLS handshake → TCP handshake → HTTP request'],
      correctAnswer: 2,
      explanation: 'You need an IP before you can open a TCP connection, a TCP connection before TLS can run, and a TLS session before the encrypted HTTP request can be sent. QUIC merges the transport and TLS steps, but the order of concerns is the same.'
    },
    {
      id: 'cs-net-q2',
      question: 'A laptop with address 192.168.1.20 sends a request through a home router to a public server. What source address does the server see?',
      options: ['192.168.1.20', 'The router\'s public IP address', '127.0.0.1', 'The router\'s LAN address 192.168.1.1'],
      correctAnswer: 1,
      explanation: 'NAT rewrites the private source address to the router\'s public IP and a unique port. Private ranges like 192.168.0.0/16 are never routed on the public internet, so the server could not reply to them anyway.'
    },
    {
      id: 'cs-net-q3',
      question: 'A routing table has 10.0.0.0/8 via router A and 10.1.0.0/16 via router B. Where does a packet for 10.1.2.3 go?',
      options: ['Router B, because /16 is the longest matching prefix', 'Router A, because it was listed first', 'Router A, because /8 covers more addresses', 'It is dropped as ambiguous'],
      correctAnswer: 0,
      explanation: 'Routers use longest-prefix match: both routes cover 10.1.2.3, but /16 is more specific than /8, so router B wins. Order in the table and prefix size are irrelevant except through specificity.'
    },
    {
      id: 'cs-net-q4',
      question: 'Which field is NOT part of the 5-tuple that identifies a connection?',
      options: ['Source port', 'Destination IP address', 'Protocol', 'IP time-to-live (TTL)'],
      correctAnswer: 3,
      explanation: 'The 5-tuple is source IP, source port, destination IP, destination port, and protocol. TTL is a per-packet hop counter that changes at every router, so it cannot identify a connection.'
    },
    {
      id: 'cs-net-q5',
      question: 'A client sends SYN with seq = 100. What does a correct server reply contain?',
      options: ['ACK with ack = 100', 'SYN with seq = 100', 'SYN-ACK with its own seq and ack = 101', 'FIN-ACK with ack = 101'],
      correctAnswer: 2,
      explanation: 'The server acknowledges the client\'s SYN (ack = client seq + 1 = 101) and sends its own SYN with its own initial sequence number in the same segment. The client then completes the handshake with ACK.'
    },
    {
      id: 'cs-net-q6',
      question: 'A TCP receiver advertises a window of 0 bytes. What does the sender do?',
      options: ['Closes the connection with RST', 'Stops sending data and periodically sends window probes until the window opens', 'Keeps sending at the congestion-window rate', 'Retransmits the last segment immediately'],
      correctAnswer: 1,
      explanation: 'A zero receive window is flow control saying "I have no buffer space". The sender pauses and uses a persist timer to probe so it learns when the window reopens, since a window-update segment could be lost.'
    },
    {
      id: 'cs-net-q7',
      question: 'A sender receives three duplicate ACKs for sequence number 5000. What happens next?',
      options: ['Fast retransmit of the segment starting at 5000 without waiting for the RTO, and the congestion window is reduced', 'Nothing until the retransmission timer expires', 'The connection is reset because ACKs are out of order', 'The sender enters slow start from one segment'],
      correctAnswer: 0,
      explanation: 'Three duplicate ACKs mean later segments arrived but 5000 did not. Fast retransmit resends it immediately and fast recovery halves cwnd rather than resetting to the tiny slow-start value that a timeout would cause.'
    },
    {
      id: 'cs-net-q8',
      question: 'Ten TCP segments are sent; segment 3 is lost but 4-10 arrive. Which statement describes head-of-line blocking?',
      options: ['Segments 4-10 are discarded and must all be resent', 'The receiver delivers 4-10 to the app and fills in 3 later', 'Segments 4-10 wait in the receive buffer and cannot be delivered to the app until 3 is retransmitted', 'The sender halts sending 4-10 until 3 is acknowledged'],
      correctAnswer: 2,
      explanation: 'TCP guarantees in-order delivery, so buffered later data is held back until the gap is filled. Selective ACK tells the sender only 3 is missing, but the application still sees nothing until it arrives.'
    },
    {
      id: 'cs-net-q9',
      question: 'You stop a server and restart it two seconds later; bind() fails with "address already in use" even though no process is listening. What is the likely cause?',
      options: ['The kernel caches the old process ID', 'Connections from the old process are in TIME_WAIT on that port; set SO_REUSEADDR', 'The port is in the ephemeral range', 'A DNS cache still maps the hostname to the old process'],
      correctAnswer: 1,
      explanation: 'The side that actively closed each connection holds the 5-tuple in TIME_WAIT for 2×MSL. Setting SO_REUSEADDR lets the new listener bind despite those lingering sockets.'
    },
    {
      id: 'cs-net-q10',
      question: 'Why do video-call applications typically use UDP rather than TCP?',
      options: ['UDP has stronger encryption', 'UDP guarantees lower packet loss', 'TCP cannot carry binary data', 'A retransmitted frame arrives too late to be useful, so the app prefers to drop it and keep latency low'],
      correctAnswer: 3,
      explanation: 'TCP\'s retransmission and in-order delivery add latency spikes during loss. Real-time media tolerates a dropped frame better than a stalled stream, so it uses UDP (via RTP) and handles loss with concealment and forward error correction.'
    },
    {
      id: 'cs-net-q11',
      question: 'dig returns "api.example.com. 300 IN A 203.0.113.10". What does 300 mean?',
      options: ['Resolvers may cache this answer for 300 seconds before asking again', 'The query took 300 milliseconds', 'The record is 300 bytes long', 'The authoritative server is 300 hops away'],
      correctAnswer: 0,
      explanation: 'The number is the TTL in seconds. Every cache along the path (browser, OS, recursive resolver) may serve the record for up to that long, which is why changes propagate gradually.'
    },
    {
      id: 'cs-net-q12',
      question: 'You update your site\'s A record to a new IP, but for an hour some users still reach the old server. Why?',
      options: ['The TCP connections must time out first', 'The old server is still advertising via BGP', 'Recursive resolvers cached the old record and serve it until its TTL expires', 'Browsers ignore A-record changes until restarted'],
      correctAnswer: 2,
      explanation: 'DNS caching honours the TTL that was in effect when the old record was fetched. The standard mitigation is to lower the TTL well before the migration so caches expire quickly.'
    },
    {
      id: 'cs-net-q13',
      question: 'A recursive resolver with an empty cache looks up api.example.com. What does a root server return?',
      options: ['The A record for api.example.com', 'A referral to the .com TLD name servers', 'The NS records for example.com', 'An NXDOMAIN, because roots only know TLDs'],
      correctAnswer: 1,
      explanation: 'Root servers know only which servers are authoritative for each TLD. The resolver then asks a .com server, which refers it to example.com\'s name servers, which finally return the A record.'
    },
    {
      id: 'cs-net-q14',
      question: 'Which DNS record type maps a hostname to an IPv6 address?',
      options: ['A', 'CNAME', 'PTR', 'AAAA'],
      correctAnswer: 3,
      explanation: 'AAAA holds a 128-bit IPv6 address (four times the size of an A record\'s 32-bit IPv4 address). CNAME is an alias and PTR is a reverse lookup.'
    },
    {
      id: 'cs-net-q15',
      question: 'A server presents a leaf certificate signed by an intermediate CA, which is signed by a root CA that is not in the client\'s trust store. What happens?',
      options: ['Verification fails: the chain does not end at a trusted root', 'Verification succeeds because the intermediate signed the leaf', 'The client downloads the root from the server and trusts it', 'Verification succeeds if the certificate is not expired'],
      correctAnswer: 0,
      explanation: 'Trust is anchored only in roots the client already has. A valid signature chain that ends at an unknown root proves nothing, so the client reports an unknown issuer. Roots are never accepted from the server itself.'
    },
    {
      id: 'cs-net-q16',
      question: 'What gives TLS 1.3 forward secrecy?',
      options: ['Encrypting the certificate during the handshake', 'Using longer RSA keys', 'Deriving each session\'s keys from ephemeral (EC)DHE key shares that are discarded after the handshake', 'Rotating the server certificate every 90 days'],
      correctAnswer: 2,
      explanation: 'With ephemeral key exchange, the long-term private key only signs the handshake; it never encrypts session secrets. Stealing it later cannot unlock recorded traffic. TLS 1.3 removed RSA key transport for exactly this reason.'
    },
    {
      id: 'cs-net-q17',
      question: 'Without session resumption, how many round trips does a TLS 1.3 handshake take before the client can send application data?',
      options: ['0', '1', '2', '3'],
      correctAnswer: 1,
      explanation: 'TLS 1.3 sends the key share in the ClientHello, so after the server\'s reply the client can send its Finished and data together: one round trip. TLS 1.2 needed two; 0-RTT is only possible on resumption.'
    },
    {
      id: 'cs-net-q18',
      question: 'A response carries "Cache-Control: no-cache" and an ETag. What does the browser do on the next request for that URL?',
      options: ['Never stores the response and always downloads the full body', 'Uses the cached copy without contacting the server', 'Ignores the ETag because no-cache disables validation', 'Sends If-None-Match with the ETag and reuses the cached copy on a 304'],
      correctAnswer: 3,
      explanation: 'no-cache means "store it, but revalidate before use", not "do not store" - that is no-store. The conditional request lets the server answer 304 Not Modified with an empty body when nothing changed.'
    },
    {
      id: 'cs-net-q19',
      question: 'An HTTP/2 connection carries 20 concurrent streams. One TCP packet is lost. What is the effect?',
      options: ['All 20 streams stall until the packet is retransmitted', 'Only the stream whose frame was lost stalls', 'The lost frame is skipped and the stream continues', 'The connection is closed and reopened'],
      correctAnswer: 0,
      explanation: 'HTTP/2 multiplexes streams over a single TCP byte stream, and TCP delivers in order, so every stream waits behind the missing bytes. HTTP/3 over QUIC gives each stream independent delivery to avoid this.'
    },
    {
      id: 'cs-net-q20',
      question: 'You need to push stock-price updates from server to browser, never the other way, through corporate HTTP proxies, with automatic reconnection. What fits best?',
      options: ['WebSockets', 'Short polling every 100 ms', 'Server-Sent Events', 'HTTP/2 server push'],
      correctAnswer: 2,
      explanation: 'SSE is a plain long-lived HTTP response, so proxies and HTTP/2 handle it, and EventSource reconnects automatically with Last-Event-ID. WebSockets add bidirectional complexity you do not need, and server push is unsupported in browsers.'
    }
  ]
};
