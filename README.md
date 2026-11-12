# Unlimited Reforged

Web admin panel and in-game admin menu for **FiveM** (Qbox, QBCore and ESX Legacy) and **RedM** (VORP and RSG-Core) servers.
Runs on Windows and Linux, compatible with txAdmin, available in 12 languages.

- Website and getting started: https://asarayja.github.io/unlimited_reforge/
- Downloads: https://github.com/asarayja/unlimited_reforge/releases/latest

## Highlights

- New in v1.0.7: the Server check explains "Duplicate Archetype" (which archetype files define the same model name) and names MLOs that replace the game's own map files and leave old buildings or trees in the game's distant models (needs gta-world.json from Unlimited MapMerge 1.0.2)
- v1.0.6: Discord roles read live (no manual sync) with a new Discord member access mode, a built-in Server check (map and resource checks, script errors explained), an optional Discord status message, a built-in Anti-Cheat (beta, off by default) with seven modules, an action per module (log, warn, kick, ban), screenshot per detection, false positive button and easy unban; the race island on the Live Map and in-game map (optional); the same look on every framework; fixes for double warns, the false data.json message and a noisy startup / Live View console; safer item image upload
- v1.0.5: auto-ban after warnings, a styled ban screen, warnings confirmed with SPACE, private messages, duty time and staff chat channels, Discord roles to panel roles, panel users for txAdmin admins, a Discord bot with slash commands, webhook routing, quick actions and remembered toggles in the in-game menu, a resource manager, hideable panel pages, 7-day position history, and moderation / menu / queue APIs for other scripts
- v1.0.4: a Support page with in-game reports and staff chat plus a notification bell, one search over all logs, script logs (ScriptLog export, Logs → Scripts) with a ready-made ox_inventory add-on, script inventories, adjustable report length limits, a quiet console with one Debug logging switch, a new-version notice, and /admin as the default in-game command on FiveM
- v1.0.3: ESX Legacy on FiveM, in-game reports in the web panel, society money and money per job, To-Do categories, Cayo Perico on the Roxwood map
- Web panel: dashboard, players and characters, money, jobs and gangs, inventories, items editor, vehicles / horses and wagons, live map, Live View (FiveM only), logs, economy, reports and bans, staff tools, whitelist, roles and permissions
- In-game admin menu (full and compact): noclip, freecam, props, teleports, area tools, weather and time, map
- Moderation: warn, kick, ban by license / Discord / HWID, ban-evasion detection, blocked joins log
- RedM: RDR2 map, horses and wagons, gang scripts, VORP whitelist, RSG-Core with rsg-queue integration

## Quick start

1. Download the zip from Releases and put the folder in `resources/`.
2. The framework and inventory are detected automatically. `config.json` is created from `config.example.json` at the first start.
3. Add `ensure <folder>` to `server.cfg` after oxmysql, your framework and your inventory. On ESX Legacy that means after `es_extended` and `esx_inventory` (or `ox_inventory`).
   On Qbox, QBCore, VORP and RSG-Core, newer server artifacts also need `add_filesystem_permission` lines before the ensure line; ESX needs none. The startup report prints the exact lines.
4. Start the server, open the panel address from the console and run the setup wizard.

The full hosting guide (`README-HOSTING.md`) is included in the zip.

## License

MIT, see [LICENSE](LICENSE). The `docs/` folder is the GitHub Pages site.
