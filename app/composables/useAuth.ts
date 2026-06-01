export function useAuth() {
  const accessToken = useState<string | null>('auth:token', () => null)

  return { accessToken }
}
