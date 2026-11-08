<p align="center">
  <a href="https://squeekmate.xyz">
    <img src="docs/readme-header.png" alt="Squeekmate" width="720">
  </a>
</p>

<p align="center">
  <a href="https://squeekmate.xyz">
    <img src="assets/squeekchain-mark.jpg" alt="Squeekchain mark used on the Squeekmate shell" width="96">
  </a>
</p>

<p align="center">
  <a href="https://squeekmate.xyz"><b>Live app</b></a>
  · Sepolia testnet · read-only · no build step
</p>

Squeekmate is a small handheld console in the browser. Connect a wallet, watch an address, or visit a token id, and one Squeek sits on the LCD. Levels, merge state, claimable SQK, wheel speed, and the activity feed are read from Squeekchain. Care buttons, the nap timer, and Spin Dash stay on this page.

The app never sends a transaction and never calls a signing method. Connecting an extension still asks that wallet for permission to share an account.

**Live app:** [https://squeekmate.xyz](https://squeekmate.xyz)

## Contents

- [The console](#the-console)
- [Feature matrix](#feature-matrix)
- [How data moves](#how-data-moves)
- [Run it locally](#run-it-locally)
- [Repository layout](#repository-layout)
- [Squeekchain API](#squeekchain-api)
- [Polling, retries, and failure](#polling-retries-and-failure)
- [The wheel](#the-wheel)
- [Wallet, Sepolia, and Etherscan](#wallet-sepolia-and-etherscan)
- [Care, themes, and sound](#care-themes-and-sound)
- [Honest limitations](#honest-limitations)

## The console

Four tabs. The files on `main` are one static document: [`index.html`](index.html), [`styles.css`](styles.css), and [`app.js`](app.js).

| Tab | What it holds |
| --- | --- |
| **Pet** | LCD, care row (Feed, Play, Nap, Pet), Spin Dash, vitals, and the on-chain card |
| **Pack** | Squeeks returned for the connected or watched address, plus Visit Any Squeek |
| **World** | Wheel, core counters, SQK economy chart, and Chain Activity |
| **Wallet** | Connection, balances, claimable SQK, power, stake, and the last earnings window |

Visit Any Squeek accepts a token id from **1 through 9999**. Random draws **1 through 8017** (`1 + Math.floor(8017 * Math.random())`).

Spin Dash runs for 15 seconds. Its tap target is `max(20, round(0.9 × RPM))` when the latest status measurement has RPM above zero, and **45** when it does not.

## Feature matrix

| Surface | What you see | Source in this repo |
| --- | --- | --- |
| Pet artwork and level | Name, level, merge state, traits, base power, next merge block | `GET /v1/squeeks/{id}` |
| LCD background removal | Character drawn over the theme when the SVG can be cleaned | `cleanSqueekSvg` / `squeekArtUri` in [`app.js`](app.js). The original data URI is kept when cleaning does not apply |
| Energy | Bar plus an RPM sentence | Latest `measurement` on `GET /v1/status`, then session care nudges |
| Fullness | Bar | `core.blockProgress` from `GET /v1/core` when that body is `available`, then session feeds |
| Mood | Bar | Squeek level, merge state, and claimable SQK, then session care |
| Bond | Bar | Session care counts only. Nothing writes bond back to the API |
| Nap | 45-second local timer and a sleep pose on the pet | `S.napUntil`. The status payload has no sleep field |
| Wheel picture | Inline SVG rotor `#wvRotor` | [`index.html`](index.html) and `updateWheelViz` in [`app.js`](app.js) |
| Core counters | Block, work, work per 1,000 blocks, settled round, progress | `GET /v1/core` after it arrives. Until then, the hardcoded `SNAPSHOT` |
| SQK economy | Supply, mined, burned, staked, NFT live/issued, merges open, bar / dots / pie | `GET /v1/economy/state`. The chart is seeded first from constants in [`app.js`](app.js) |
| Chain Activity | All, Protocol, Players, My activity | `GET /v1/events` or `GET /v1/accounts/{address}/activity` |
| Transaction chip | Text link “Etherscan” when the hash matches `0x` plus 64 hex digits | `https://sepolia.etherscan.io/tx/…` |
| SQK and Squeek counts | Wallet SQK, Squeek NFT balance, Sepolia ETH | Sepolia `eth_call` `balanceOf` and `eth_getBalance` |
| Claimable SQK, power, stake, pack, earnings | Account panel and pack grid | `GET /v1/accounts/{address}` |
| Your Earnings | Bar, dots, and pie for up to the last 7 `earnings` rows | Same account payload |
| Shell badge and claim row image | Squeekchain mark | [`assets/squeekchain-mark.jpg`](assets/squeekchain-mark.jpg). This repo does not identify that file as an SQK token logo |

## How data moves

```mermaid
flowchart LR
  page[Squeekmate page]
  api["api.squeekchain.com/v1"]
  rpc[Sepolia JSON-RPC]
  scan[sepolia.etherscan.io]

  page -->|"every 15s: /status, /core, /economy/state"| api
  page -->|"visible tab, every 5s: /events or account activity"| api
  page -->|"eth_call balanceOf and eth_getBalance"| rpc
  page -->|"transaction links only"| scan
```

There is no WebSocket and no server in this repository. `apiGet` uses `fetch` with `cache: "no-store"`. Chain Activity copy in the page says the list is live from the Squeekchain API and refreshes every 5 seconds. That sentence describes the poll, not a stream.

The 15-second world refresh also calls the current feed category, including while the tab is hidden. The dedicated 5-second timer runs only when `document.hidden` is false, and once more when the tab becomes visible again.

## Run it locally

Any static file server is enough. From this directory:

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000`. The public site is [https://squeekmate.xyz](https://squeekmate.xyz).

A wallet that holds a Squeek is optional: Watch any address, or visit a token id, still loads public API data.

Fonts (Quicksand, Barlow Condensed, IBM Plex Mono) are requested from Google Fonts. WalletConnect’s library is loaded from jsDelivr only after you paste a Reown project id and click WalletConnect. The WalletConnect mark on the button is loaded from `cdn.simpleicons.org`, and several extension logos are remote images. Those are runtime requests, not a compile step.

## Repository layout

```text
index.html                 page, tabs, wordmark, and the inline wheel SVG
styles.css                 gadget, LCD themes, charts
app.js                     API client, wallet, vitals, feed, economy, wheel motion
docs/readme-header.png     wordmark used at the top of this README
assets/squeekchain-mark.jpg
assets/wallets/logo-0.svg
```

`main` does not contain `wheel.js` or a separate wheel image set. The rotor is the `#wvRotor` group in [`index.html`](index.html).

## Squeekchain API

The data client is in [`app.js`](app.js) on `main`. This README records that file.

| Piece | Where |
| --- | --- |
| Base URL `https://api.squeekchain.com/v1` | [`app.js`](app.js) line 1, constant `API` |
| `apiGet`, `refreshWorld`, `loadFeed`, `loadSqueek`, `loadAccount` | same file, the first script block |
| 15-second world timer | [`app.js`](app.js) line 18, `setInterval(refreshWorld, 15e3)` |
| 5-second event timer | [`app.js`](app.js) lines 35–38 |
| Wheel motion for that status body | `updateWheelViz` in [`app.js`](app.js), applied to `#wvRotor` |
| WalletConnect session metadata URL `https://api.squeekchain.com` | [`app.js`](app.js), `metadata.url` on the provider. This is not a `/v1` data call |

`apiGet(path)` requests `API + path`, sends `accept: application/json`, and aborts after 12 seconds.

| Call | Used for |
| --- | --- |
| `GET /status` | `measurement` (`coreStatus`, `rpmMilli`, speed, distance), `oracle.state`, `settlementQueue.state` |
| `GET /core` | Painted only when `status` is `"available"` and `core` is present: block height, block progress, cumulative work, work per thousand blocks, settled round |
| `GET /economy/state` | Painted only when `status` is `"available"`: supply, staking total, NFT live/issued, merges open, chain safe block, lifecycle stage and round, schedule |
| `GET /events?category={all\|protocol\|players}&limit=40` | Chain Activity for those three chips |
| `GET /accounts/{address}/activity?limit=40` | My activity. Requires a connected or watched address |
| `GET /accounts/{address}?limit=100` | Pack, rewards, power, stake, earnings. Further pages use `cursor` |
| `GET /squeeks/{id}` | The pet. A body whose `status` is not `"available"` is treated as a failed load |

`updateWheelViz` reads `measurement.coreStatus` and `measurement.rpmMilli`. It does not read `freshness`. `ACTIVE` starts the rotor animation. Any other core status, including `IDLE`, takes the idle branch even when `rpmMilli` is above zero. Zero milli-RPM is not a separate API sleep value. The status route has no hamster running field and no sleep field.

Account and event bodies that are not `"available"` surface `reason` when the API sends one. The feed then says the indexer may be catching up. A thrown `fetch` says the feed, the account, or the Squeek could not be reached.

## Polling, retries, and failure

| Timer | What it requests | When it stops |
| --- | --- | --- |
| 15 seconds | `/status`, `/core`, `/economy/state`, then the current feed category | It keeps firing, including in a hidden tab |
| 5 seconds | Current feed category only | Skipped while `document.hidden` is true |
| Immediate | Same feed request | When the tab becomes visible |

`apiGet` retries twice more (three tries total):

- HTTP 429 or any status of 500 and above waits for `Retry-After`, clamped between 1 and 5 seconds. A missing header waits 2 seconds.
- Any other failure waits `1200 × attempt` milliseconds. A failed `/status` marks the live dot off before that wait.
- After the last failure the error is thrown. Callers decide what stays on screen.

What stays on screen:

| Failure | What the page does |
| --- | --- |
| `/status` fails | Live dot turns off. The last RPM, speed, distance, and core label are left as they were |
| `/core` fails, or `status` is not `"available"` | Previous core numbers stay. If none have arrived, the startup snapshot stays |
| `/economy/state` fails, or `status` is not `"available"` | Previous economy text and chart stay. Before the first success, the chart is the hardcoded seed |
| Events fail | The list is replaced with an error sentence |
| Squeek load fails | Up to 3 extra tries, 3.5 seconds apart, then the LCD empty state and Try again |

Startup snapshot, written before the first successful `/core`:

| Field | Hardcoded value |
| --- | --- |
| `blockHeight` | 1999, labeled “(snapshot)” until `/core` replaces it |
| `cumulativeWork` | 18553 |
| `workPerThousandBlocks` | 8238 |
| `settledThroughRound` | 533 |
| `blockProgress` | 322478319, stored on `SNAPSHOT` and not copied into the progress bar at startup |

SQK chart seed, used until `supply.capBaseUnits` arrives: premint `210000000` SQK, launch bonus `105000000` SQK, cap `2100000000` SQK, each with 18 decimal base units in the source. Mined starts at zero. A successful economy response replaces premint, mined, burned, staked, and the bonus amount from `schedule.launchBonusBaseUnits`.

Those seeds and the snapshot are why a number on screen can be a placeholder or a previous response. A pulsing live dot means the latest `/status` payload had a measurement whose `coreStatus` is `ACTIVE`. It does not mean every other figure was refreshed in that same moment.

## The wheel

On `main`, the World wheel is the inline SVG in [`index.html`](index.html). `updateWheelViz` only changes that drawing:

| Condition in `app.js` | What the SVG does |
| --- | --- |
| The local nap timer is still running | Class `wheelviz state-sleep`. This follows the Nap button on the pet, not an API field |
| `measurement.coreStatus` is `ACTIVE` | Class `state-run`. `#wvRotor` animation duration is `60 / RPM` seconds, clamped between 0.45 and 6, or 1.15 seconds when RPM is 0 |
| Any other status, or no measurement | Class `state-idle`. The RPM text is still filled from `rpmMilli` when a measurement exists |

There is no separate hamster sprite and no `wheel.js` on `main`. The API does not send a running pose or a sleep pose for the drawing. The sleep class is the local 45-second nap.

## Wallet, Sepolia, and Etherscan

| Item | Value in code |
| --- | --- |
| Chain | Sepolia, id `11155111`, hex `0xaa36a7` |
| Primary RPC | `https://ethereum-sepolia-rpc.publicnode.com` |
| `eth_call` fallbacks | `https://sepolia.drpc.org`, then `https://ethereum-sepolia.blockpi.network/v1/rpc/public` |
| ETH balance | `eth_getBalance` on the primary RPC only |
| SQK token | `0xd78a3956cf63164d1fa1c622ad3c66623162fa1e`, `balanceOf` (`0x70a08231`) |
| Squeek NFT | `0xc4c7982657f00509548f3a3a41db7fa439a6856b`, `balanceOf` |
| Staking constant | `0x50fd1780526c3186a0c037c7622203bc4fb611ca` is declared and not passed to `eth_call` |
| Explorer | `https://sepolia.etherscan.io`, including `/tx/{hash}` |
| Add-chain payload | Native currency “Sepolia ETH”, the primary RPC, and that explorer |

Extension wallets are discovered with EIP-6963 and `window.ethereum`. The connect call is `eth_requestAccounts`. If the chain is not Sepolia, the page calls `wallet_switchEthereumChain`, and on code `4902` or `-32603` it calls `wallet_addEthereumChain`. Names and icons prefer the EIP-6963 record. Logo URLs are matched when the name contains metamask, rabby, coinbase, brave, trust, okx, or phantom.

WalletConnect needs a project id from [cloud.reown.com](https://cloud.reown.com). The id is not stored in this repo. The button image is the Simple Icons mark requested from `https://cdn.simpleicons.org/walletconnect`.

Watch any address sets no provider and assumes Sepolia. It can still load the public account, pack, and activity routes.

A session is stored in `localStorage` under `squeekmate-session-v1` with build tag `2026-11-08-v17`. Disconnect removes it. A different build tag removes it on the next load, so a redeploy that changes the tag asks you to connect again. The tag match is a reload check, not a signature.

## Care, themes, and sound

Feed, Play, Nap, and Pet change session counters and the speech bubble. Nap lasts 45 seconds and adds energy only inside `computeVitals`. Leaving nap for another care action clears the timer. Pet copy states that the on-chain level stays until a real merge. Merge instructions point at the wallet on Squeekchain; this page does not send the merge.

LCD themes are `home`, `beach`, `forest`, `snow`, `desert`, and `city`, remembered as `squeekmate-lcd-theme`. Appearance is `auto`, `light`, or `dark` (`squeekmate-lcd-mode`). Auto is light from 06:00 through 17:59 local time and dark otherwise, rechecked every 30 seconds.

Button sounds start on (`S.sound` is true). The chiptune loop starts off.

## Honest limitations

- The live app link is [https://squeekmate.xyz](https://squeekmate.xyz).
- Chain Activity is polled. The visible-tab interval is 5 seconds. Status, core, and economy are polled every 15 seconds. Nothing here subscribes to a stream.
- The first paint of the core counters is the hardcoded snapshot above. Economy slices start from the hardcoded cap, premint, and launch bonus. A failed later poll keeps the last successful numbers. Not every figure is a live reading on every visit.
- The rotor animation runs when `coreStatus` is `ACTIVE`. It does not read freshness, and it does not read a hamster pose. Local nap adds the class `state-sleep` for 45 seconds. That class is not an API sleep state.
- [`assets/squeekchain-mark.jpg`](assets/squeekchain-mark.jpg) is the Squeekchain mark on the shell and on the claimable-SQK row. This repository does not establish it as the official SQK token logo.
- Care, bond, nap, and Spin Dash are local. They do not post to `/v1`.
- Balances come from public Sepolia RPC endpoints. If those endpoints fail, the balance cells become an em dash. Account data can still load from the API, and the other way around.
- The app is a read-only Sepolia interface. It does not claim mainnet balances, and it does not submit merges, claims, or transfers.
