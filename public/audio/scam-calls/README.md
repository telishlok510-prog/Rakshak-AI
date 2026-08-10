# Scam Call Audio Files

This directory should contain audio recordings for the Scam Call Simulation feature.

## Required Files

Based on the scenarios defined in `src/lib/scamCall.ts`, the following audio files are needed:

### English Scenarios
1. **bank-kyc-block-en.mp3** (45 seconds)
   - Fake bank KYC expiration call
   - Transcript available in scamCall.ts

2. **digital-arrest-en.mp3** (50 seconds)
   - Digital arrest/money laundering scam call
   - Transcript available in scamCall.ts

### Gujarati Scenarios
3. **bank-kyc-block-gu.mp3** (45 seconds)
   - Gujarati version of fake bank KYC call
   - Transcript available in scamCall.ts

## How to Create These Audio Files

### Option 1: Text-to-Speech (TTS)
Use AI voice generators like:
- Google Cloud Text-to-Speech (supports English & Gujarati)
- Amazon Polly
- ElevenLabs (realistic voices)
- Microsoft Azure Speech Services

### Option 2: Voice Acting
- Hire voice actors to read the transcripts
- Record in a quiet environment
- Use natural, conversational tone
- Add realistic pauses and emotions (urgency, authority, etc.)

### Option 3: Script Recreation
- Based on publicly documented scam patterns
- Never use real recordings with victim personal details
- Anonymize all account numbers, phone numbers, names

## Audio Specifications

- **Format**: MP3
- **Bitrate**: 128kbps or higher
- **Sample Rate**: 44.1kHz
- **Channels**: Mono or Stereo
- **Volume**: Normalized to -3dB to avoid clipping

## Important Notes

⚠️ **Privacy & Ethics**
- Use ONLY recreated/scripted content
- Never use real recordings containing victim PII
- Anonymize all sensitive information
- These are educational tools to help people identify scams

⚠️ **Legal Compliance**
- Ensure you have rights to any voice recordings
- Don't use copyrighted content
- Follow local laws regarding call recordings

## Testing

After adding audio files, test that:
1. Files load correctly in the browser
2. Pause points trigger at correct timestamps
3. Audio quality is clear and understandable
4. Duration matches the specified seconds in scamCall.ts

## Future Expansion

Additional scenarios can be added by:
1. Creating the audio file
2. Adding the scenario data to `src/lib/scamCall.ts`
3. Placing the audio file in this directory
