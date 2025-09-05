export const sendSlackAlert = async (eventName: string, payload: object) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('SLACK_WEBHOOK_URL environment variable is not set');
  }

  // Format payload as key-value pairs
  const payloadText = Object.entries(payload)
    .map(([key, value]) => `*${key}:* ${value}`)
    .join('\n');

  const message = {
    text: `🚨 *${eventName}*\n\n${payloadText}`,
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Failed to send Slack alert: ${response.statusText}`);
  }
};

export async function fetchSlackChannels(
  botToken: string
): Promise<SlackChannel[]> {
  try {
    const response = await fetch('https://slack.com/api/conversations.list', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        types: 'public_channel,private_channel',
        exclude_archived: 'true',
        limit: '1000',
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch channels from Slack API');
      return [];
    }

    const data: SlackChannelsResponse = await response.json();

    if (!data.ok) {
      console.error('Slack API error:', data.error);
      return [];
    }

    // Filter and sort channels
    return data.channels
      .filter(channel => !channel.is_archived)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Failed to fetch Slack channels:', error);
    return [];
  }
}

export async function checkSlackBotMembership(
  botToken: string,
  channelId: string
): Promise<boolean> {
  try {
    const response = await fetch('https://slack.com/api/conversations.info', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        channel: channelId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to check bot membership from Slack API');
      return false;
    }

    const data: SlackMembershipResponse = await response.json();

    if (!data.ok) {
      console.error('Slack API error:', data.error);
      return false;
    }

    return data.channel.is_member;
  } catch (error) {
    console.error('Error checking bot membership:', error);
    return false;
  }
}

export async function joinSlackChannel(
  botToken: string,
  channelId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://slack.com/api/conversations.join', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${botToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        channel: channelId,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to join channel' };
    }

    const data: SlackJoinResponse = await response.json();

    if (!data.ok) {
      return { success: false, error: data.error || 'Failed to join channel' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error joining channel:', error);
    return { success: false, error: 'Unknown error occurred' };
  }
}
