const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1302355516642693200/2fuYI7NXwigh81da3WmVvgSUi4lhFiXmV73-Y1ecB6UxWbGmdvy20X4o4m8SvddnJSEp';

export const sendDiscordNotification = async (content: string) => {
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
};