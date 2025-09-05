interface UpdateSlackIntegrationParams {
  integrationId: number;
  botToken: string;
  channel: string;
  channelId: string;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
  is_archived: boolean;
}

interface SlackChannelsResponse {
  ok: boolean;
  channels: SlackChannel[];
  error?: string;
}

interface SlackJoinResponse {
  ok: boolean;
  error?: string;
}

interface SlackMembershipResponse {
  ok: boolean;
  channel: {
    is_member: boolean;
  };
  error?: string;
}
