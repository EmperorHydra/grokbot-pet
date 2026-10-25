# Grok Bot Pet

A small black floating ball (white eyes) that sits above your other windows on your Mac and shows a bubble and a badge when a notification arrives.

## Install (Mac)
1. Download the right zip: **Apple Silicon = `arm64`** (any Mac with an M1, M2, M3 or M4 chip), **Intel = `x64`**. Not sure? Apple menu > About This Mac: "Chip: Apple M…" means arm64; "Processor: Intel…" means x64.
2. Unzip, and drag **Grok Bot Pet** into **Applications**.
3. **First open:** right-click the app > **Open** > **Open**. The app is **unsigned** (I'm not a registered Apple developer), so macOS warns the first time. If it says the app is "damaged", run `xattr -cr "/Applications/Grok Bot Pet.app"` in Terminal and try again.

No Node.js or npm needed. There is no Dock icon.

## How notifications work (plainly)
- The ball only notifies when **something posts to your notification URL**. Nothing is detected automatically.
- On first launch the app makes a random private topic. Right-click the ball > **Copy my notification URL**, then send a message, e.g.:
  `curl -d 'Task done' https://ntfy.sh/<your-topic>`   (add `-H 'Title: My title'` for a title)
- The topic acts like a password: anyone who knows the URL can send you notifications and read them. Don't share it.
- A message makes the ball jump, plays a beep, shows a bubble (~15s) and a red unread badge.

## Using it
- **Click** the ball: clears the bubble/badge. If `clickUrl` is set in the config, it also opens that link (default: empty, does nothing else).
- **Drag** to move; position is remembered. **Right-click**: Send test notification, Copy my notification URL, Open config file, Mute sounds, Size, Hide, Quit. **Option+Space**: show/hide.
- **Config file** (right-click > Open config file, restart the app after editing):
  `{ "topic": "...", "server": "https://ntfy.sh", "sound": true, "clickUrl": "" }`
  `clickUrl` can be any link, e.g. a `grokbot://app/v1/agent?id=...` link (works only if that app is installed and registers the link) or `https://...`.

## Build from source (developers)
`npm install`, then `npm start` to run; `npx electron-builder --mac zip --arm64 --x64` to build. Edit `config.default.json` for build-time defaults.
