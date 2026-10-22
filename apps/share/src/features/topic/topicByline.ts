import { BRANDING_LOBE_AI_NAME } from '@lobechat/business-const';

import { type SharedTopicData } from '@/types/topic';

export const buildTopicByline = (data: SharedTopicData) => {
  const isInboxAgent = !data.groupId && data.agentMeta?.slug === 'inbox';

  return data.groupMeta?.title || (isInboxAgent ? BRANDING_LOBE_AI_NAME : data.agentMeta?.title);
};
