# Unlimited Reforged

Web admin panel and in-game admin menu for **FiveM** (Qbox / QBCore) and **RedM** (VORP) servers.
Runs on Windows and Linux, compatible with txAdmin, available in 12 languages.

- Website and getting started: https://asarayja.github.io/unlimited_reforge/
- Downloads: https://github.com/asarayja/unlimited_reforge/releases

## Highlights

- Web panel: dashboard, players and characters, money, jobs and gangs, inventories, items editor, vehicles / horses and wagons, live map, Live View (FiveM only), logs, economy, reports and bans, staff tools, whitelist, roles and permissions
- In-game admin menu (full and compact): noclip, freecam, props, teleports, area tools, weather and time, map
- Moderation: warn, kick, ban by license / Discord / HWID, ban-evasion detection, blocked joins log
- RedM: RDR2 map, horses and wagons, gang scripts, VORP whitelist

## Quick start

1. Download the zip from Releases and put the folder in `resources/`.
2. Set your framework and inventory in `config.json`.
3. Add `ensure <folder>` to `server.cfg` after oxmysql, your framework and your inventory.
4. Start the server, open the panel address from the console and run the setup wizard.

The full hosting guide (`README-HOSTING.md`) is included in the zip.

## License

MIT, see [LICENSE](LICENSE). The `docs/` folder is the GitHub Pages site.
