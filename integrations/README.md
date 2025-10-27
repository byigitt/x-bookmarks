# Integrations

Shared notification clients live in this workspace and are consumed by other packages (for example, the cron scheduler).

## Discord Webhook
- Configure `DISCORD_WEBHOOK_URL` in the environment of any package that calls `sendReminder` with the `discord` channel.
- `src/discord/webhookClient.js` formats unread bookmarks into Discord embeds and batches requests respecting the platform limits.

## Adding New Channels
1. Create a subdirectory under `src/` for the new provider.
2. Export a client function that matches the signature `(options) => Promise`.
3. Register the handler in `src/index.js` by adding it to `CHANNEL_HANDLERS`.
4. Update consuming services to pass the new channel name when sending reminders.
