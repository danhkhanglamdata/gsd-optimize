---
name: realtime-component-builder
description: Build Supabase realtime logic - subscriptions, broadcast, live updates
---

# realtime-component-builder

Build reliable realtime features with Supabase for EventVibe.

## Realtime Requirements

- **Latency target**: <2s (ideally <1.5s) for quiz answers, media feed updates, leaderboard sync
- **Reliability**: Proper error handling, reconnection logic
- **Mobile-first**: Handle flaky connections gracefully

## Supabase Patterns

### Channel Subscriptions
```typescript
// Always cleanup on unmount
useEffect(() => {
  const channel = supabase
    .channel('table:event_id')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quiz_answers' }, handleNewAnswer)
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [eventId])
```

### Broadcast (for high-frequency updates like leaderboard)
```typescript
// Use broadcast for ephemeral, high-frequency updates
const channel = supabase.channel('leaderboard:event_123')
channel.send({ type: 'broadcast', event: 'leaderboard_update', payload: { ... } })
```

### Presence (for online users)
```typescript
channel.track({ user_id, nickname, avatar_url })
```

## Error Handling

- Always wrap subscriptions in try-catch
- Implement reconnection logic with exponential backoff
- Show user-friendly offline/loading states
- Log errors for debugging

## Performance

- Debounce rapid updates
- Batch updates where possible
- Use optimistic updates for perceived speed
- Cleanup subscriptions to prevent memory leaks
