# Transcription Debugging Guide

## Issue: Nothing happens when speaking in interview

This guide will help you diagnose why transcription might not be working.

## Enhanced Debug Logging

I've added comprehensive logging throughout the transcription pipeline. Open your browser's **Developer Console** (F12 or Cmd+Option+I) and look for these messages:

### 1. Test Startup Phase

When you click "Start Test", you should see:

```
🚀 Starting test...
🎤 Requesting microphone access...
✅ Microphone access granted: [Microphone Name]
🔌 Setting up streaming transcription...
✅ Streaming transcription setup complete
✅ Test started successfully - Ready to record!
```

**If you DON'T see these:**
- Check if guidelines modal appeared (you must accept it first)
- Check browser microphone permissions
- Look for error messages in red

### 2. WebSocket Connection Phase

After test starts, you should see:

```
🌍 WebSocket connected - AssemblyAI ready with GLOBAL ACCENT RECOGNITION
🎯 Enhanced features enabled: Language detection, accent detection...
✨ Optimized for: American, British, Australian, Indian...
🌍 Recording started - Capturing speech from ANY accent worldwide
```

**If you DON'T see these:**
- Check your internet connection
- Verify the API token is valid in `.env` file
- Look for WebSocket error messages

### 3. Audio Streaming Phase

While recording, every ~10 seconds you should see:

```
📡 Streaming: 100 packets | Audio level: 12.45% | Last transcript: 2.3s ago
📡 Streaming: 200 packets | Audio level: 15.67% | Last transcript: 1.1s ago
```

**If you DON'T see these:**
- Your microphone might not be working
- Audio processing might have failed
- Check audio level percentage (should be > 1% when speaking)

**If audio level is 0% or very low:**
- Microphone might be muted
- Wrong microphone selected
- Microphone permissions issue

### 4. Transcript Reception Phase

When you speak, you should see:

```
📨 WebSocket message type: PartialTranscript Text: Hello world
📨 WebSocket message type: FinalTranscript Text: Hello world I am testing
🟢 [95.5%] "Hello world I am testing"
✅ UPDATING TRANSCRIPT: {
  cleanedText: "Hello world I am testing",
  newAccumulated: "Hello world I am testing",
  questionIndex: 0
}
💾 Transcriptions state updated: Hello world I am testing
📺 Display updated: Hello world I am testing
```

**If you DON'T see `📨 WebSocket message` lines:**
- AssemblyAI is not recognizing your speech
- Audio might be too quiet
- Microphone quality issue
- Internet connection problem

**If you see `📨` but NO `✅ UPDATING TRANSCRIPT`:**
- Transcript is being blocked by deduplication logic
- Check for messages like "🚫 Duplicate detected"
- Transcript might be too short (minimum length check)

## Common Issues & Solutions

### Issue 1: No microphone access
**Symptoms:** Alert saying "Microphone permissions" or error in console

**Solutions:**
1. Check browser permissions (click padlock icon in address bar)
2. Reload the page and grant microphone access
3. Try a different browser (Chrome recommended)
4. Check system microphone permissions (Windows Settings > Privacy)

### Issue 2: WebSocket won't connect
**Symptoms:** "Failed to connect" or WebSocket error messages

**Solutions:**
1. Check internet connection
2. Verify API key in `src/pages/api/session.ts`
3. Check if AssemblyAI service is down
4. Try refreshing the page

### Issue 3: Audio streaming but no transcripts
**Symptoms:** See `📡 Streaming` but no `📨 WebSocket message`

**Solutions:**
1. **Speak louder** - Audio level should be > 5%
2. **Check microphone quality** - Built-in mics might not work well
3. **Reduce background noise** - Noise cancellation might filter your voice
4. **Wait 2-3 seconds** - AssemblyAI needs time to process
5. **Try different words** - Some words are harder to recognize

### Issue 4: Transcripts received but not displaying
**Symptoms:** See `📨` and `✅ UPDATING TRANSCRIPT` but text doesn't appear

**Solutions:**
1. Check React DevTools - verify state is updating
2. Look for JavaScript errors in console
3. Try refreshing the page
4. Clear browser cache and cookies

### Issue 5: Duplicates or wrong order
**Symptoms:** Same text appears twice or in wrong order

**This should be fixed with the existing deduplication logic, but if it persists:**
1. Note the sequence of console logs
2. Check if rate limiting is triggering
3. Report the issue with console logs

## Debug Checklist

Run through this checklist in order:

- [ ] 1. Open browser console (F12)
- [ ] 2. Click "Start Test"
- [ ] 3. Accept guidelines modal
- [ ] 4. Grant microphone access
- [ ] 5. Verify you see "✅ Test started successfully"
- [ ] 6. Verify you see "🌍 WebSocket connected"
- [ ] 7. Speak clearly into microphone
- [ ] 8. Wait 2-3 seconds
- [ ] 9. Check for "📡 Streaming" messages
- [ ] 10. Check audio level is > 5%
- [ ] 11. Look for "📨 WebSocket message" lines
- [ ] 12. Look for "✅ UPDATING TRANSCRIPT" lines
- [ ] 13. Check if text appears in the transcript box

## Console Log Reference

| Icon | Message Type | What it means |
|------|-------------|---------------|
| 🚀 | Startup | Test initialization |
| 🎤 | Microphone | Audio device access |
| ✅ | Success | Operation completed |
| ❌ | Error | Something failed |
| 🔌 | WebSocket | Connection events |
| 📡 | Streaming | Audio data being sent |
| 📨 | Message | Transcript received |
| 🟢/🟡/🔴 | Confidence | Transcript quality |
| 💾 | State | React state updated |
| 📺 | Display | UI updated |
| ⚠️ | Warning | Potential issue |
| 🚫 | Blocked | Duplicate/invalid transcript |

## Advanced Debugging

### Check WebSocket State

In console, type:
```javascript
// Check if WebSocket is connected
wsRef.current?.readyState
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
```

### Check Audio Ref

In console, type:
```javascript
// Check if audio stream exists
audioStreamRef.current?.active
// Should be true
```

### Check Current Transcript

In console, type:
```javascript
// See accumulated transcript
accumulatedTranscriptRef.current
// Should show your speech
```

### Monitor Audio Level

Watch the "Audio level" in streaming messages:
- **0-1%**: No audio or microphone muted
- **1-5%**: Very quiet, might not transcribe
- **5-20%**: Normal speaking volume
- **20-50%**: Loud speaking
- **50%+**: Very loud or clipping

## Testing Microphone

To test if your microphone is working:

1. Go to https://www.onlinemictest.com/
2. Click "Test my mic"
3. Speak - you should see green bars
4. If it doesn't work there, fix microphone first
5. Come back and try the interview again

## Browser Compatibility

**Best supported:**
- Chrome 90+
- Edge 90+

**Limited support:**
- Firefox 88+ (might have audio issues)
- Safari 14+ (might have WebSocket issues)

## Getting Help

If nothing works after checking everything:

1. Take screenshots of console logs
2. Note what browser and OS you're using
3. Note at which step it fails
4. Report the issue with all this information

## Emergency Fallback

If transcription completely fails:

1. Type your answers manually (if feature is available)
2. Try a different browser
3. Try a different device
4. Contact support with debug logs

