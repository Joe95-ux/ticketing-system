// Custom events for ticket-related actions
export const TICKET_EVENTS = {
  CREATED: 'ticket-created',
} as const;

// Type-safe event dispatcher
export function dispatchTicketEvent(event: keyof typeof TICKET_EVENTS) {
  window.dispatchEvent(new Event(TICKET_EVENTS[event]));
}

// Helper function to handle ticket creation response
export function handleTicketCreated(response: { event?: string }) {
  if (response.event === TICKET_EVENTS.CREATED) {
    dispatchTicketEvent('CREATED');
  }
} 