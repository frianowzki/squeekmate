<div align="center">

# SQUEEKMATE

**Your Squeek, alive in your pocket.**

A Tamagotchi for your Squeek NFT — fed by live Squeekchain data,
not by make-believe numbers.

[Live app](https://squeekmate.vercel.app/) · Sepolia testnet · Read-only wallet · No build step

</div>

---

Connect a wallet, pick one of your Squeeks, and it moves into a little
handheld console on your screen. Its level, power, merge state and
claimable SQK are read straight from the chain. Feed it, play the
wheel with it, put it to sleep — then check what the whole network
has been doing while you were gone.

No account. No signing. No custody. Squeekmate only ever *reads*.

## What you get

| | |
|---|---|
| **A pet that is actually yours** | Your Squeek's real artwork, with its NFT background stripped out, living inside the LCD. Any Squeek from #1 to #9999 works — yours, or one you visit as a guest. |
| **Care that means something** | Feed, Play, Nap and Pet, driven by live vitals: Energy from the wheel's current RPM, Fullness from settled block progress, Mood from your on-chain standing, Bond from care given this session. |
| **A world that keeps moving** | The live WHEELY9000 wheel, the full SQK economy, and a chain activity feed polling the official Squeekchain API every 15 seconds — whether your pet is awake or not. |
| **Six places to live** | Home, Beach, Forest, Snow, Desert and City — each with a day and a night variant that follows your clock, and each one animated: waves, falling leaves, snow, a camel crossing the desert, traffic in the city. |

## The console

```
┌─────────────────────────────────────────┐
│  PET ──────── your Squeek + care bar    │
│  PACK ─────── your Squeeks + visit any  │
│  WORLD ────── wheel · SQK · activity    │
│  WALLET ───── balances · earnings       │
└─────────────────────────────────────────┘
```

**PET** — The gadget itself. Egg-shaped shell, pixel LCD, A / B / C
buttons. Care for your Squeek, check its vitals, and open the
On-Chain Card for level, base power, merge state, next merge block
and claimable SQK. Feeling fast? **Spin Dash** gives you 15 seconds
to out-tap the wheel's live RPM.

**PACK** — One scrollable tab. Your Squeek Pack on top — tap any
Squeek to make it your pet. Below it, *Visit Any Squeek*: enter an
ID or roll a random one and host it as a guest pet, artwork cleaned
exactly like your own.

**WORLD** — The network, live. The Wheel's speed, distance and
settlement queue; **SQK Economy** as a bar, a dot field or a donut
(Premint 210M · Launch bonus 105M · Mined · Remaining, against the
2.1B cap); and Chain Activity as it happens.

**WALLET** — SQK balance, Squeeks held (wallet + staked, counted
together), Sepolia ETH, claimable SQK, account power and your last
7 days of earnings — charted the same way as the SQK Economy.

## LCD themes

| Theme | Day | Night |
|---|---|---|
| Home | Butterflies, falling petals | Fireflies, moonlight |
| Beach | Rolling waves, shells, sand castle | Moonlit water |
| Forest | Pine, birch and oak, birds | Fireflies in the trees |
| Snow | Snow-capped firs, a peeking penguin | Dim winter sun, snowfall |
| Desert | Cacti, an oasis, a passing camel | Cold dunes under hard stars |
| City | Traffic lights, a helicopter overhead | Lit windows, night traffic |

Themes follow the Auto / Light / Dark toggle — Auto switches by
local time (light 06:00–17:59, dark 18:00–05:59) — and your choice
is remembered in `localStorage`.

## Connect a wallet

- **Extension wallets** via EIP-6963 and `window.ethereum` —
  MetaMask, Rabby, Coinbase, Brave, Trust, OKX and Phantom are
  recognised with their real brand marks.
- **Sepolia only.** The app asks your wallet to switch to chain
  `11155111` if it is anywhere else.
- **Read-only, always.** Squeekmate never asks for a signature and
  never sends a transaction. Watching an address works without
  connecting anything at all.
- **WalletConnect** is supported once you add your own free Reown
  project ID from [cloud.reown.com](https://cloud.reown.com).

Your session survives a page reload. It does not survive a
redeploy — reconnecting is one tap.

## Run it

It is a static site. Three files, no build step, no server:

```text
index.html
styles.css
app.js
assets/
```

Serve the folder with anything:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open it, connect a wallet that holds a Squeek on Sepolia,
and say hello.

## Under the hood

- **Data** — [api.squeekchain.com/v1](https://api.squeekchain.com/v1)
  for Squeeks, the wheel, supply and the `/v1/events` activity feed,
  plus the public Sepolia RPC for balances.
- **Artwork** — Squeek SVGs are cleaned in the browser: every
  full-canvas background rect and background pattern group is
  removed, so the character sits directly on the LCD theme.
  Pack thumbnails keep the original art untouched.
- **Stack** — Vanilla HTML, CSS and JavaScript. Fonts are
  Quicksand, Barlow Condensed and IBM Plex Mono.
- **Sound** — An optional retro chiptune loop (WebAudio), off by
  default. You turn it on; it never surprises you.

---

<div align="center">

*Squeeks are on Sepolia testnet. SQK and Squeeks have no monetary value —
the value here is a pet that is genuinely yours, on a chain that is genuinely live.*

</div>
