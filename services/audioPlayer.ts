
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let audioCtx: AudioContext | null = null;
const audioCache = new Map<string, AudioBuffer>();

/**
 * Enhanced local speech using browser Synthesis.
 * It strictly speaks ONLY the word/letter passed.
 */
export const playLocalSpeech = (text: string) => {
  return new Promise((resolve) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'en-US';
    
    // Attempt to find a higher quality female voice (usually better for kids apps)
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Premium')));
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.rate = 0.85; // Slightly slower for clarity
    utterance.pitch = 1.1; // Cheerful tone
    utterance.volume = 1.0;

    utterance.onend = () => {
      resolve(true);
    };

    utterance.onerror = (e) => {
      console.error("Speech error", e);
      resolve(false);
    };

    window.speechSynthesis.speak(utterance);
  });
};

export const playTTSSound = async (base64Data: string, cacheKey?: string) => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }

  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  let audioBuffer: AudioBuffer;

  if (cacheKey && audioCache.has(cacheKey)) {
    audioBuffer = audioCache.get(cacheKey)!;
  } else {
    const audioBytes = decodeBase64(base64Data);
    audioBuffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);
    if (cacheKey) audioCache.set(cacheKey, audioBuffer);
  }
  
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
  
  return new Promise((resolve) => {
    source.onended = resolve;
  });
};
