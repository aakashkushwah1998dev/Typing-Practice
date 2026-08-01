// Preload keeps renderer isolated; no Node APIs exposed to the page.
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('typingPracticeDesktop', {
  platform: process.platform,
  isDesktop: true,
})
