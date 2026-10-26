**Grok Bot Pet v1.1.0**: no more config editing. A small Setup window opens on first launch (and any time via right-click > Setup…).

- Setup shows your private notification URL (Copy), an optional field for a Grok Bot chat link (`grokbot://` or `https://`), the 3 steps, and a Send test notification button.
- Clicking the ball opens your chat link if set, otherwise opens Setup.
- "Open config file" now opens in a text editor.

**Install**
1. Download the zip for your Mac: `arm64` for Apple Silicon (M1–M4), `x64` for Intel. Unzip, drag `Grok Bot Pet.app` into Applications.
2. The app is unsigned. On macOS 15 Sequoia or newer, right-click > Open no longer works: double-click it once, then System Settings > Privacy & Security > **Open Anyway**. Or run `xattr -cr "/Applications/Grok Bot Pet.app"` in Terminal.
3. Follow the Setup window. Notifications only appear when something posts to your private URL, e.g. `curl -d 'Task done' <your url>`.

Untested on a real Mac (built and checked on Linux).
