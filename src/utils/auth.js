export const auth = {
  // Save credentials to localStorage
  saveCredentials(username, password) {
    const credentials = { username, password }
    localStorage.setItem('hpr-credentials', JSON.stringify(credentials))
  },

  // Get credentials from localStorage
  getCredentials() {
    const credentials = localStorage.getItem('hpr-credentials')
    return credentials ? JSON.parse(credentials) : null
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('hpr-credentials')
  },

  // Clear credentials
  logout() {
    localStorage.removeItem('hpr-credentials')
  }
}

// Router guard for authentication
export const authGuard = (to, from, next) => {
  if (auth.isLoggedIn()) {
    next()
  } else {
    next('/login')
  }
}
