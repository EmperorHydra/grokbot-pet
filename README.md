# Grok Bot Pet

A small black floating ball (white eyes) that sits above your other windows on your Mac and shows a bubble and a red badge when a notification arrives.

## Install (Mac)
1. Download the right zip: **Apple Silicon = `arm64`** (any Mac with an M1, M2, M3 or M4 chip), **Intel = `x64`**. Not sure? Apple menu > About This Mac: "Chip: Apple M…" means arm64; "Processor: Intel…" means x64.
2. Unzip, and drag **Grok Bot Pet** into **Applications**.
3. **First open.** The app is **unsigned** (no paid Apple developer account), so macOS blocks it the first time:
   - **macOS 15 Sequoia or newer:** right-click > Open no longer works. Double-click the app once, then go to **System Settings > Privacy & Security**, scroll down and click **Open Anyway** next to "Grok Bot Pet".
   - **Any macOS:** or run this once in Terminal, then open the app normally: `xattr -cr "/Applications/Grok Bot Pet.app"`

No Node.js or npm needed. There is no Dock icon; the ball floats on screen.

## First run: a small Setup window opens
- It shows **your private notification URL** (Copy button). It acts like a password: anyone who knows it can send you notifications, so don't share it.
- Optional: paste a **Grok Bot chat link** (`grokbot://…` or `https://…`). Clicking the ball then opens it. If you leave it empty, clicking the ball opens this Setup window.
- Three steps: 1. Copy the URL. 2. Tell your Grok Bot: *"When you finish tasks, post a short message to <your URL> with curl -d"*. 3. Click Done.
- **Send test notification** checks everything works. Reopen Setup any time: right-click the ball > **Setup…**

## How notifications work (plainly)
The ball only notifies when **something posts to your notification URL**. Nothing is detected automatically. For example: `curl -d 'Task done' <your-url>` (add `-H 'Title: My title'` for a title). A message makes the ball jump, beep, show a bubble (~15s) and a red badge.

## Using it
- **Click** the ball: clears the bubble/badge, then opens your chat link (or Setup if none is set).
- **Drag** to move; position is remembered. **Option+Space**: show/hide.
- **Right-click**: Setup…, Send test notification, Copy my notification URL, Open config file (opens in a text editor; restart the app after editing), Mute sounds, Size, Hide, Quit.
- Config file fields: `topic`, `server` (default `https://ntfy.sh`), `sound`, `clickUrl`.

## Build from source (developers)
`npm install`, then `npm start` to run; `npx electron-builder --mac zip --arm64 --x64` to build. `config.default.json` holds build-time defaults (empty topic and `clickUrl` for public builds; each install generates its own random topic).
