const PROJECT_PREFIX = import.meta.env.VITE_PROJECT_PREFIX || 'imoveis_milionarios';

export const TABLE_NAMES = {
  CHAT_HISTORIES: `${PROJECT_PREFIX}_chat_histories`,
  LEAD_MANAGEMENT: `${PROJECT_PREFIX}_lead_management`,
  SDR_SELLER: `${PROJECT_PREFIX}_sdr_seller`,
  CONVERSATION_READS: `${PROJECT_PREFIX}_conversation_reads`,
} as const;

export const RPC_FUNCTIONS = {
  GET_CHAT_MESSAGES_WITH_PAGINATION: `get_${PROJECT_PREFIX}_chat_messages_with_pagination`,
  GET_CHAT_OVERVIEW: `get_${PROJECT_PREFIX}_chat_overview`,
  GET_CONVERSATIONS_OVERVIEW: `get_${PROJECT_PREFIX}_conversations_overview`,
} as const;

export { PROJECT_PREFIX };