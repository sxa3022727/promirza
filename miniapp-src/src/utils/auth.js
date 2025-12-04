// Set user token - call this when app initializes
// Token should be fetched from your backend based on Telegram user ID
export const initializeUserToken = () => {
  // For now, set your token manually
  // In production, get this from Telegram WebApp initData or your backend
  const token = '4c094485afb0540fccd7056dace5cbd7df1f590d' // Your token
  localStorage.setItem('user_token', token)
  return token
}

export const getUserToken = () => {
  return localStorage.getItem('user_token')
}

export const clearUserToken = () => {
  localStorage.removeItem('user_token')
}
