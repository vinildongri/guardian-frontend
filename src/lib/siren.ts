let ctx: AudioContext | null = null;
let osc: OscillatorNode | null = null;
let timer: ReturnType<typeof setInterval> | undefined;

// Browsers only allow audio after a user gesture, so this must run from a click.
export async function enableAudio() {
  ctx ??= new AudioContext();
  await ctx.resume();
}

export function startSiren() {
  if (!ctx || osc) return;

  const gain = ctx.createGain();
  gain.gain.value = 0.2;
  const oscillator = ctx.createOscillator();
  oscillator.type = "square";
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start();
  osc = oscillator;

  let high = false;
  timer = setInterval(() => {
    high = !high;
    oscillator.frequency.value = high ? 880 : 660;
  }, 500);
}

export function stopSiren() {
  clearInterval(timer);
  osc?.stop();
  osc = null;
}
