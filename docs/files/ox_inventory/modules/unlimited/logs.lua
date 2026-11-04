--[[
    Unlimited Reforged script logs for ox_inventory
    ================================================
    What it is
        An add-on that sends ox_inventory activity (give, drop, stash/trunk/glovebox moves, shop
        purchases, crafting, optionally item use) to Unlimited Reforged (Logs -> Scripts) and/or to
        a Discord webhook. Works on Qbox, QBCore and ESX: it does not touch the framework.
        Without Unlimited and without a webhook it does nothing: no errors, no prints.

    Install (one file, one line)
        1. Put this file at   ox_inventory/modules/unlimited/logs.lua
        2. In ox_inventory/fxmanifest.lua, add this line to server_scripts, after 'init.lua':
               'modules/unlimited/logs.lua',
        3. Restart ox_inventory.
        After you update ox_inventory, only step 2 may need repeating.

    Convars (server.cfg), all optional
        set ox_inventory_logs_unlimited true              # false = never send to Unlimited
        set ox_inventory_logs_unlimited_resource "auto"   # or the exact resource name of Unlimited
        set ox_inventory_logs_webhook ""                  # Discord webhook URL, read server-side only
        set ox_inventory_logs_use false                   # true = also log item use (noisy)

    How it works
        Only ox_inventory's public API is used (exports.ox_inventory:registerHook). The hooks are
        registered without a callback, so ox never calls into this file during an action and nothing
        can be cancelled or slowed; we only listen to the post-event ox fires with success true/false
        and log successes. No ox_inventory source code is copied or patched here.
        Unlimited is found at runtime by its fxmanifest author line ('Unlimited Reforged-Team');
        there is never a dependency on it. Limit: 20 entries per second.

    Tested with ox_inventory 2.47.9. Older versions need the registerHook export with post-events
    (TriggerEvent(hookId, success, payload)); if an older version lacks them, nothing is logged.

    License: this file is original work, not derived from ox_inventory source. It talks to
    ox_inventory only through its documented exports/events.
--]]
local RES = GetCurrentResourceName()

local function convarBool(name, default)
    local v = GetConvar(name, default and 'true' or 'false')
    return not (v == 'false' or v == '0' or v == 'off' or v == 'no')
end

local UNL_AUTHOR = 'Unlimited Reforged-Team'
local unl = nil

local function setting()
    if not convarBool('ox_inventory_logs_unlimited', true) then return false end
    return GetConvar('ox_inventory_logs_unlimited_resource', 'auto')
end
local function pinned()
    local v = setting()
    if type(v) == 'string' and v ~= 'auto' and v ~= '' then return v end
    return nil
end

local function isUnlimited(res, running)
    if setting() == false or type(res) ~= 'string' or res == '' or res == RES then return false end
    local state = GetResourceState(res)
    if state ~= 'started' and not (running and state == 'starting') then return false end
    local pin = pinned()
    if pin then return res == pin end
    return GetResourceMetadata(res, 'author', 0) == UNL_AUTHOR
end

local function findUnlimited()
    if setting() == false then return nil end
    local pin = pinned()
    if pin then return isUnlimited(pin) and pin or nil end
    for i = 0, GetNumResources() - 1 do
        local res = GetResourceByFindIndex(i)
        if isUnlimited(res) then return res end
    end
    return nil
end

local function setLinked(res)
    if res == unl then return end
    local was = unl
    unl = res
    if res then print(('[%s] linked with Unlimited (%s)'):format(RES, res))
    elseif was then print(('[%s] unlinked from Unlimited (%s stopped)'):format(RES, was)) end
end
local function link() setLinked(findUnlimited()) end

if setting() ~= false then
    CreateThread(function() Wait(1500) link() end)
end
AddEventHandler('onResourceStart', function(res)
    if setting() == false or res == RES then return end
    if res == pinned() or (not pinned() and GetResourceMetadata(res, 'author', 0) == UNL_AUTHOR) then SetTimeout(1500, link) end
end)
AddEventHandler('onResourceStop', function(res)
    if res == unl then setLinked(nil) end
end)

local LEVELS = { info = true, warn = true, error = true }
local COLOUR = { info = 3447003, warn = 15105570, error = 15158332 }

local function flat(data)
    if type(data) ~= 'table' then return nil end
    local out, any = {}, false
    for k, v in pairs(data) do
        local t = type(v)
        if (type(k) == 'string' or type(k) == 'number') and (t == 'string' or t == 'number' or t == 'boolean') then
            out[tostring(k)] = t == 'string' and v:sub(1, 200) or v
            any = true
        end
    end
    if not any then return nil end
    local ok, encoded = pcall(json.encode, out)
    if not ok or type(encoded) ~= 'string' or #encoded > 4096 then return nil end
    return out
end

local UNL_PER_SECOND = 20
local unlWindow, unlCount = 0, 0
local function toUnlimited(entry)
    if not unl then return end
    local now = GetGameTimer()
    if now - unlWindow >= 1000 then unlWindow, unlCount = now, 0 end
    if unlCount >= UNL_PER_SECOND then return end
    unlCount = unlCount + 1
    if GetResourceState(unl) ~= 'started' then return end
    pcall(function() exports[unl]:ScriptLog(entry) end)
end

local HOOK_GAP, HOOK_BATCH, HOOK_QUEUE = 2000, 10, 100
local queue, draining, pausedUntil, refused = {}, false, 0, false

local function hookUrl()
    if refused then return nil end
    local url = GetConvar('ox_inventory_logs_webhook', '')
    if type(url) ~= 'string' or not url:find('^https://') then return nil end
    return url
end

local function drain()
    if draining then return end
    draining = true
    CreateThread(function()
        while #queue > 0 do
            local wait = pausedUntil - GetGameTimer()
            if wait > 0 then Wait(wait) end
            local url = hookUrl()
            if not url then queue = {} break end
            local embeds = {}
            while #embeds < HOOK_BATCH and #queue > 0 do embeds[#embeds + 1] = table.remove(queue, 1) end
            PerformHttpRequest(url, function(status)
                if status == 429 then pausedUntil = GetGameTimer() + 10000
                elseif (status == 401 or status == 404) and not refused then
                    refused = true
                    print(('^3[%s]^7 the logs webhook answered %s: it was deleted, or the URL is wrong. Logs no longer go to Discord.'):format(RES, tostring(status)))
                end
            end, 'POST', json.encode({ username = RES, embeds = embeds }), { ['Content-Type'] = 'application/json' })
            Wait(HOOK_GAP)
        end
        draining = false
    end)
end

local function who(player)
    if type(player) ~= 'number' then return tostring(player) end
    return ('%s (id %d)'):format(GetPlayerName(player) or ('#' .. player), player)
end

local function toWebhook(entry)
    if not hookUrl() then return end
    local fields = {}
    if entry.category then fields[#fields + 1] = { name = 'Category', value = entry.category, inline = true } end
    if entry.player ~= nil then fields[#fields + 1] = { name = 'Player', value = who(entry.player), inline = true } end
    if entry.data then
        local keys, lines = {}, {}
        for k in pairs(entry.data) do keys[#keys + 1] = k end
        table.sort(keys)
        for _, k in ipairs(keys) do lines[#lines + 1] = ('%s: %s'):format(k, tostring(entry.data[k])) end
        fields[#fields + 1] = { name = 'Data', value = table.concat(lines, '\n'):sub(1, 1000) }
    end
    local ok, stamp = pcall(os.date, '!%Y-%m-%dT%H:%M:%SZ')
    if #queue >= HOOK_QUEUE then table.remove(queue, 1) end
    queue[#queue + 1] = { title = ('[%s] %s'):format(RES, entry.level), description = entry.message,
                          color = COLOUR[entry.level], fields = fields, timestamp = ok and stamp or nil }
    drain()
end

local function active() return unl ~= nil or hookUrl() ~= nil end

local function Log(level, category, message, player, data)
    if message == nil then return end
    local entry = {
        level    = LEVELS[level] and level or 'info',
        category = category ~= nil and tostring(category):sub(1, 40) or nil,
        message  = tostring(message):sub(1, 1000),
        player   = (type(player) == 'number' or type(player) == 'string') and player or nil,
        data     = flat(data),
    }
    pcall(toUnlimited, entry)
    pcall(toWebhook, entry)
end

-- ── the ox_inventory hooks ──────────────────────────────────────────────────────────────────
local function slotInfo(slot)
    if type(slot) ~= 'table' then return nil, nil end
    local md = type(slot.metadata) == 'table' and slot.metadata or nil
    return slot.name, md and md.serial and tostring(md.serial) or nil
end

local function onSwap(success, p)
    if not success or not active() then return end
    local from, to = tostring(p.fromInventory), tostring(p.toInventory)
    if from == to then return end                       -- slot shuffling inside one inventory
    local item, serial = slotInfo(p.fromSlot)
    if not item then return end
    local count = tonumber(p.count) or 1
    local fromType, toType = p.fromType, p.toType
    local category
    if toType == 'drop' or fromType == 'drop' then category = 'drop'
    elseif p.action == 'give' or (fromType == 'player' and toType == 'player') then category = 'give'
    else category = 'stash' end
    local msg
    if category == 'drop' then
        msg = toType == 'drop' and ('Dropped %dx %s'):format(count, item) or ('Picked up %dx %s from a drop'):format(count, item)
    elseif category == 'give' then
        msg = ('Gave %dx %s to %s'):format(count, item, to)
    else
        msg = toType == 'player' and ('Took %dx %s from %s %s'):format(count, item, fromType, from)
            or ('Put %dx %s into %s %s'):format(count, item, toType, to)
    end
    local swapItem = type(p.toSlot) == 'table' and p.toSlot.name or nil
    Log('info', category, msg, tonumber(p.source), {
        item = item, count = count, action = p.action, serial = serial, swapItem = swapItem,
        from = from, to = to, fromType = fromType, toType = toType,
    })
end

local function onBuy(success, p)
    if not success or not active() then return end
    local item = p.itemName or 'item'
    local count = tonumber(p.count) or 1
    local price = p.totalPrice or p.price
    Log('info', 'shop', ('Bought %dx %s for %s %s'):format(count, item, tostring(price), tostring(p.currency)), tonumber(p.source), {
        item = item, count = count, price = price, currency = p.currency,
        shop = p.shopType and tostring(p.shopType) or nil, shopId = p.shopId and tostring(p.shopId) or nil,
    })
end

local function onCraft(success, p)
    if not success or not active() then return end
    local name = type(p.recipe) == 'table' and p.recipe.name or 'item'
    local count = type(p.recipe) == 'table' and tonumber(p.recipe.count) or 1
    Log('info', 'craft', ('Crafted %dx %s'):format(count or 1, name), tonumber(p.source), {
        item = name, count = count or 1, bench = p.benchId and tostring(p.benchId) or nil,
    })
end

local function onUse(success, p)
    if not success or not active() then return end
    local item = slotInfo(p.item)
    if not item then return end
    Log('info', 'use', ('Used %s'):format(item), tonumber(p.source), { item = item })
end

local function register(event, handler)
    pcall(function()
        local id = exports.ox_inventory:registerHook(event, nil, {})   -- no callback at all: only the post-event is used, so nothing can block
        if id then
            AddEventHandler(id, function(success, payload)
                pcall(handler, success, payload or {})
            end)
        end
    end)
end

CreateThread(function()
    Wait(0)
    register('swapItems', onSwap)
    register('buyItem', onBuy)
    register('craftItem', onCraft)
    if convarBool('ox_inventory_logs_use', false) then register('usingItem', onUse) end
end)
