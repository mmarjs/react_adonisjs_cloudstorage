export function sampleRate() {
  if (process.env.NODE_ENV === 'production') {
    return 0.4
  } else {
    return 1.0
  }
}
