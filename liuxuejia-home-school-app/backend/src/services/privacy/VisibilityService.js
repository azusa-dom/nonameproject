export class VisibilityService {
  applyVisibility(event, level = 'summary_only') {
    if (level === 'hidden') return null;
    if (level === 'summary_only') return { id: event.id, title: event.title, start_at: event.start_at };
    return event;
  }
}


