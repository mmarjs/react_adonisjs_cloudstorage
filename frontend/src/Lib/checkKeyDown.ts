export function checkKeyDown(e: React.KeyboardEvent): void {
  if (e.key === 'Enter') {
    e.preventDefault()
  }
}
