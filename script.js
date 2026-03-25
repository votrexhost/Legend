const STORAGE_KEY = "legendCraftStore_final_v2"

const defaultData = {
  users: [
    {
      name: "Admin",
      email: "admin@legendcraft.com",
      username: "admin",
      password: "123456789",
      balance: 0,
      verified: true,
      isAdmin: true,
      rank: "Administrator",
      purchases: [],
      cart: []
    }
  ],
  roles: [
    { id: "king", name: "King", price: 15, desc: "Premium red rank", type: "role" },
    { id: "spider", name: "Spider", price: 10, desc: "Dark black rank", type: "role" },
    { id: "emperor", name: "Emperor", price: 7.5, desc: "Royal golden rank", type: "role" },
    { id: "booster", name: "Booster", price: 0, desc: "Discord boost required", type: "role" },
    { id: "knight", name: "Knight", price: 5, desc: "Strong starter rank", type: "role" }
  ],
  keys: [
    { id: "key1", name: "Epic Key", price: 3, desc: "Special crate key", type: "key" },
    { id: "key2", name: "Legend Key", price: 6, desc: "High value crate key", type: "key" }
  ],
  orders: [],
  supportTickets: [],
  logShop: [],
  currentUser: null
}

let appData = loadData()
let currentUser = getCurrentUser()
let selectedTicketId = null
let pendingCheckout = null

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
    return JSON.parse(JSON.stringify(defaultData))
  }
  return JSON.parse(saved)
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData))
}

function getCurrentUser() {
  if (!appData.currentUser) return null
  return appData.users.find(u => u.username === appData.currentUser) || null
}

function syncCurrentUser() {
  currentUser = getCurrentUser()
}

function openMenu() {
  document.getElementById("sidebar").classList.add("open")
  document.getElementById("overlay").classList.add("show")
}

function closeMenu() {
  document.getElementById("sidebar").classList.remove("open")
  document.getElementById("overlay").classList.remove("show")
}

function showMessage(text) {
  const box = document.getElementById("messageBox")
  box.innerText = text
  box.style.display = "block"
  clearTimeout(box.hideTimer)
  box.hideTimer = setTimeout(() => {
    box.style.display = "none"
  }, 2600)
}

function showPurchaseEffect() {
  const effect = document.getElementById("purchaseEffect")
  effect.classList.remove("show")
  void effect.offsetWidth
  effect.classList.add("show")
}

function switchAuth(type) {
  const tabs = document.querySelectorAll(".tab")
  tabs.forEach(t => t.classList.remove("active"))

  if (type === "register") {
    tabs[0].classList.add("active")
    document.getElementById("registerForm").style.display = "block"
    document.getElementById("loginForm").style.display = "none"
  } else {
    tabs[1].classList.add("active")
    document.getElementById("registerForm").style.display = "none"
    document.getElementById("loginForm").style.display = "block"
  }
}

function register() {
  const name = document.getElementById("regName").value.trim()
  const email = document.getElementById("regEmail").value.trim().toLowerCase()
  const username = document.getElementById("regUser").value.trim()
  const password = document.getElementById("regPass").value.trim()

  if (!name || !email || !username || !password) {
    showMessage("Fill all fields")
    return
  }

  const exists = appData.users.find(
    u => u.email === email || u.username.toLowerCase() === username.toLowerCase()
  )

  if (exists) {
    showMessage("Email or username already exists")
    return
  }

  appData.users.push({
    name,
    email,
    username,
    password,
    balance: 0,
    verified: false,
    isAdmin: false,
    rank: "Member",
    purchases: [],
    cart: []
  })

  saveData()
  document.getElementById("regName").value = ""
  document.getElementById("regEmail").value = ""
  document.getElementById("regUser").value = ""
  document.getElementById("regPass").value = ""
  showMessage("Account created. Wait for staff verification.")
  switchAuth("login")
}

function login() {
  const value = document.getElementById("loginUser").value.trim().toLowerCase()
  const password = document.getElementById("loginPass").value.trim()

  const user = appData.users.find(
    u =>
      (u.username.toLowerCase() === value || u.email.toLowerCase() === value) &&
      u.password === password
  )

  if (!user) {
    showMessage("Invalid login")
    return
  }

  if (!user.verified) {
    showMessage("Your account is not verified yet")
    return
  }

  appData.currentUser = user.username
  saveData()
  syncCurrentUser()
  applyLoginUI()
  showSection("buyRolesSection")
  showMessage("Login successful")
}

function logout() {
  appData.currentUser = null
  saveData()
  syncCurrentUser()
  hideAllSections()
  resetAdminUI()
  document.getElementById("authSection").style.display = "block"
  document.getElementById("homeSection").style.display = "none"
  document.getElementById("topUser").style.display = "none"
  closeMenu()
  showMessage("Logged out")
}

function applyLoginUI() {
  document.getElementById("authSection").style.display = "none"
  document.getElementById("homeSection").style.display = "block"
  refreshTopUser()
  refreshAdminUI()
  refreshAll()
}

function refreshTopUser() {
  const topUser = document.getElementById("topUser")
  if (!currentUser) {
    topUser.style.display = "none"
    return
  }
  topUser.style.display = "block"
  topUser.innerText = `${currentUser.username} • ${currentUser.rank}`
}

function resetAdminUI() {
  document.getElementById("adminDivider").style.display = "none"
  document.getElementById("adminDashboardBtn").style.display = "none"
  document.getElementById("adminLogShopBtn").style.display = "none"
  document.getElementById("adminTicketsBtn").style.display = "none"
  document.getElementById("adminAddBalanceBtn").style.display = "none"
  document.getElementById("adminAddKeyBtn").style.display = "none"
}

function refreshAdminUI() {
  resetAdminUI()
  if (!currentUser || !currentUser.isAdmin) return
  document.getElementById("adminDivider").style.display = "block"
  document.getElementById("adminDashboardBtn").style.display = "flex"
  document.getElementById("adminLogShopBtn").style.display = "flex"
  document.getElementById("adminTicketsBtn").style.display = "flex"
  document.getElementById("adminAddBalanceBtn").style.display = "flex"
  document.getElementById("adminAddKeyBtn").style.display = "flex"
}

function hideAllSections() {
  document.querySelectorAll(
    ".section, #cartSection, #checkoutSection, #confirmSection, #balanceSection, #ordersSection, #supportSection, #accountSection, #adminDashboardSection, #logShopSection, #staffTicketsSection, #addBalanceSection, #addKeySection"
  ).forEach(sec => {
    sec.style.display = "none"
  })
}

function showSection(id) {
  if (!currentUser) {
    showMessage("Please login first")
    return
  }
  hideAllSections()
  const el = document.getElementById(id)
  el.style.display = "block"
  closeMenu()
  refreshAll()
}

function refreshAll() {
  syncCurrentUser()
  renderRoles()
  renderKeys()
  renderCart()
  renderOrders()
  renderSupportMessages()
  renderTickets()
  renderLogShop()
  renderDashboard()
  renderAccount()
  renderBalance()
  refreshTopUser()
}

function renderRoles() {
  const grid = document.getElementById("rolesGrid")
  grid.innerHTML = ""

  appData.roles.forEach(item => {
    grid.innerHTML += `
      <div class="store-card">
        <div class="rank-cover">${item.name}</div>
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="price">${item.price === 0 ? "Boost Required" : item.price.toFixed(2) + " Credits"}</div>
        <button class="main-btn" onclick="addToCart('role','${item.id}')">Add to Cart</button>
      </div>
    `
  })
}

function renderKeys() {
  const grid = document.getElementById("keysGrid")
  grid.innerHTML = ""

  appData.keys.forEach(item => {
    grid.innerHTML += `
      <div class="store-card">
        <div class="rank-cover">${item.name}</div>
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="price">${item.price.toFixed(2)} Credits</div>
        <button class="main-btn" onclick="addToCart('key','${item.id}')">Add to Cart</button>
      </div>
    `
  })
}

function addToCart(type, id) {
  if (!currentUser) return

  let item = null
  if (type === "role") item = appData.roles.find(x => x.id === id)
  if (type === "key") item = appData.keys.find(x => x.id === id)
  if (!item) return

  currentUser.cart.push({
    type,
    id: item.id,
    name: item.name,
    price: item.price
  })

  saveData()
  renderCart()
  showMessage(item.name + " added to cart")
}

function renderCart() {
  if (!currentUser) return

  const list = document.getElementById("cartList")
  const totalBox = document.getElementById("cartTotal")
  const count = document.getElementById("cartCount")
  list.innerHTML = ""

  if (!currentUser.cart.length) {
    list.innerHTML = `<div class="list-item">Your cart is empty</div>`
    totalBox.innerText = "Total: 0.00 Credits"
    count.innerText = "0"
    return
  }

  let total = 0
  count.innerText = currentUser.cart.length

  currentUser.cart.forEach((item, index) => {
    total += item.price
    list.innerHTML += `
      <div class="list-item">
        <strong>${item.name}</strong><br>
        Type: ${item.type}<br>
        Price: ${item.price === 0 ? "Boost Required" : item.price.toFixed(2) + " Credits"}
        <button class="ghost-btn" onclick="removeCartItem(${index})">Remove</button>
      </div>
    `
  })

  totalBox.innerText = `Total: ${total.toFixed(2)} Credits`
}

function removeCartItem(index) {
  currentUser.cart.splice(index, 1)
  saveData()
  renderCart()
  showMessage("Item removed")
}

function clearCart() {
  currentUser.cart = []
  saveData()
  renderCart()
  showMessage("Cart cleared")
}

function showCheckout() {
  if (!currentUser.cart.length) {
    showMessage("Your cart is empty")
    return
  }
  hideAllSections()
  document.getElementById("checkoutSection").style.display = "block"
}

function preparePurchase() {
  const discordName = document.getElementById("discordName").value.trim()
  const minecraftName = document.getElementById("minecraftName").value.trim()

  if (!discordName || !minecraftName) {
    showMessage("Fill all fields")
    return
  }

  const total = currentUser.cart.reduce((sum, item) => sum + item.price, 0)

  pendingCheckout = {
    discordName,
    minecraftName,
    items: [...currentUser.cart],
    total
  }

  document.getElementById("confirmText").innerText =
    `Are you sure you want to purchase ${pendingCheckout.items.length} item(s) for ${total.toFixed(2)} Credits?`

  hideAllSections()
  document.getElementById("confirmSection").style.display = "block"
}

function confirmPurchase() {
  if (!pendingCheckout || !currentUser) return

  const total = pendingCheckout.items.reduce((sum, item) => sum + item.price, 0)

  if (currentUser.balance < total) {
    showMessage("Not enough credits")
    return
  }

  currentUser.balance -= total

  const boughtNames = pendingCheckout.items.map(i => i.name)
  const order = {
    id: Date.now(),
    username: currentUser.username,
    discordName: pendingCheckout.discordName,
    minecraftName: pendingCheckout.minecraftName,
    items: boughtNames,
    total,
    status: "Pending",
    createdAt: new Date().toLocaleString()
  }

  appData.orders.push(order)
  appData.logShop.push({ ...order })

  pendingCheckout.items.forEach(item => {
    currentUser.purchases.push(
      `${item.name} | ${item.type} | ${item.price.toFixed(2)} Credits | Discord: ${pendingCheckout.discordName} | Minecraft: ${pendingCheckout.minecraftName}`
    )
    if (item.type === "role" && item.name !== "Booster") {
      currentUser.rank = item.name
    }
  })

  currentUser.cart = []
  pendingCheckout = null
  document.getElementById("discordName").value = ""
  document.getElementById("minecraftName").value = ""

  saveData()
  refreshAll()
  showPurchaseEffect()
  showMessage("Purchase completed")
  showSection("ordersSection")
}

function renderBalance() {
  if (!currentUser) return
  document.getElementById("balanceAmount").innerText = `${currentUser.balance.toFixed(2)} Credits`
}

function renderOrders() {
  const list = document.getElementById("ordersList")
  list.innerHTML = ""
  if (!currentUser) return

  const myOrders = appData.orders.filter(o => o.username === currentUser.username)

  if (!myOrders.length) {
    list.innerHTML = `<div class="list-item">No orders yet</div>`
    return
  }

  myOrders.slice().reverse().forEach(order => {
    list.innerHTML += `
      <div class="list-item">
        <strong>Items:</strong> ${order.items.join(", ")}<br>
        <strong>Discord:</strong> ${order.discordName}<br>
        <strong>Minecraft:</strong> ${order.minecraftName}<br>
        <strong>Total:</strong> ${order.total.toFixed(2)} Credits<br>
        <strong>Date:</strong> ${order.createdAt}<br>
        <span class="status ${order.status.toLowerCase()}">${order.status}</span>
      </div>
    `
  })
}

function renderAccount() {
  if (!currentUser) return

  document.getElementById("accountInfo").innerHTML = `
    <div><strong>Name:</strong> ${currentUser.name}</div>
    <div><strong>Email:</strong> ${currentUser.email}</div>
    <div><strong>Username:</strong> ${currentUser.username}</div>
    <div><strong>Verified:</strong> ${currentUser.verified ? "Yes" : "No"}</div>
    <div><strong>Rank:</strong> ${currentUser.rank}</div>
    <div><strong>Balance:</strong> ${currentUser.balance.toFixed(2)} Credits</div>
  `

  const history = document.getElementById("purchaseHistory")
  history.innerHTML = ""

  if (!currentUser.purchases.length) {
    history.innerHTML = `<div class="list-item">No purchases yet</div>`
    return
  }

  currentUser.purchases.slice().reverse().forEach(item => {
    history.innerHTML += `<div class="list-item">${item}</div>`
  })
}

function changePassword() {
  if (!currentUser) return
  const newPassword = document.getElementById("newPassword").value.trim()

  if (!newPassword) {
    showMessage("Enter a new password")
    return
  }

  currentUser.password = newPassword
  document.getElementById("newPassword").value = ""
  saveData()
  showMessage("Password changed")
}

function sendSupportMessage() {
  if (!currentUser) return
  const input = document.getElementById("supportInput")
  const text = input.value.trim()

  if (!text) {
    showMessage("Write a message first")
    return
  }

  let ticket = appData.supportTickets.find(t => t.username === currentUser.username)

  if (!ticket) {
    ticket = {
      id: Date.now(),
      username: currentUser.username,
      messages: []
    }
    appData.supportTickets.push(ticket)
  }

  ticket.messages.push({
    sender: currentUser.username,
    text,
    time: new Date().toLocaleString()
  })

  input.value = ""
  saveData()
  renderSupportMessages()
  renderTickets()
  showMessage("Message sent")
}

function renderSupportMessages() {
  const box = document.getElementById("supportMessages")
  if (!box || !currentUser) return

  const ticket = appData.supportTickets.find(t => t.username === currentUser.username)

  if (!ticket || !ticket.messages.length) {
    box.innerHTML = `<div class="list-item">No messages yet</div>`
    return
  }

  box.innerHTML = ""
  ticket.messages.forEach(msg => {
    box.innerHTML += `
      <div class="chat-message">
        <strong>${msg.sender}:</strong> ${msg.text}<br>
        <small>${msg.time}</small>
      </div>
    `
  })
}

function renderTickets() {
  const list = document.getElementById("ticketsList")
  if (!list) return
  list.innerHTML = ""

  if (!appData.supportTickets.length) {
    list.innerHTML = `<div class="list-item">No tickets</div>`
    return
  }

  appData.supportTickets.forEach(ticket => {
    list.innerHTML += `
      <div class="list-item">
        <strong>${ticket.username}</strong><br>
        Messages: ${ticket.messages.length}
        <button class="main-btn" onclick="openTicket(${ticket.id})">Open Ticket</button>
      </div>
    `
  })
}

function openTicket(id) {
  selectedTicketId = id
  const ticket = appData.supportTickets.find(t => t.id === id)
  if (!ticket) return

  document.getElementById("staffReplyPanel").style.display = "block"
  const box = document.getElementById("staffTicketMessages")
  box.innerHTML = ""

  ticket.messages.forEach(msg => {
    box.innerHTML += `
      <div class="chat-message">
        <strong>${msg.sender}:</strong> ${msg.text}<br>
        <small>${msg.time}</small>
      </div>
    `
  })
}

function replyTicket() {
  if (!currentUser || !currentUser.isAdmin) return
  const input = document.getElementById("staffReplyInput")
  const text = input.value.trim()

  if (!selectedTicketId || !text) {
    showMessage("Write a reply first")
    return
  }

  const ticket = appData.supportTickets.find(t => t.id === selectedTicketId)
  if (!ticket) return

  ticket.messages.push({
    sender: "Staff",
    text,
    time: new Date().toLocaleString()
  })

  input.value = ""
  saveData()
  openTicket(selectedTicketId)
  renderSupportMessages()
  showMessage("Reply sent")
}

function renderLogShop() {
  const list = document.getElementById("logShopList")
  if (!list) return
  list.innerHTML = ""

  if (!appData.logShop.length) {
    list.innerHTML = `<div class="list-item">No shop logs yet</div>`
    return
  }

  appData.logShop.slice().reverse().forEach(log => {
    list.innerHTML += `
      <div class="list-item">
        <strong>User:</strong> ${log.username}<br>
        <strong>Items:</strong> ${log.items.join(", ")}<br>
        <strong>Discord:</strong> ${log.discordName}<br>
        <strong>Minecraft:</strong> ${log.minecraftName}<br>
        <strong>Total:</strong> ${log.total.toFixed(2)} Credits<br>
        <strong>Date:</strong> ${log.createdAt}<br>
        <span class="status ${log.status.toLowerCase()}">${log.status}</span>
      </div>
    `
  })
}

function renderDashboard() {
  const dashboardStats = document.getElementById("dashboardStats")
  const pendingList = document.getElementById("pendingAccountsList")
  const allList = document.getElementById("allAccountsList")
  const recentOrders = document.getElementById("adminRecentOrders")

  if (!dashboardStats || !pendingList || !allList || !recentOrders) return

  const nonAdminUsers = appData.users.filter(u => !u.isAdmin)
  const pendingUsers = nonAdminUsers.filter(u => !u.verified)
  const totalBalance = nonAdminUsers.reduce((sum, u) => sum + u.balance, 0)

  dashboardStats.innerHTML = `
    <div class="dashboard-stat">Users<strong>${nonAdminUsers.length}</strong></div>
    <div class="dashboard-stat">Pending<strong>${pendingUsers.length}</strong></div>
    <div class="dashboard-stat">Orders<strong>${appData.orders.length}</strong></div>
    <div class="dashboard-stat">Credits<strong>${totalBalance.toFixed(2)}</strong></div>
  `

  pendingList.innerHTML = ""
  if (!pendingUsers.length) {
    pendingList.innerHTML = `<div class="list-item">No pending accounts</div>`
  } else {
    pendingUsers.forEach(user => {
      pendingList.innerHTML += `
        <div class="list-item">
          <strong>${user.username}</strong><br>
          ${user.email}
          <div class="action-row">
            <button class="small-btn" onclick="verifyAccount('${user.username}')">Verify</button>
            <button class="small-btn" onclick="deleteAccount('${user.username}')">Delete</button>
          </div>
        </div>
      `
    })
  }

  allList.innerHTML = ""
  if (!nonAdminUsers.length) {
    allList.innerHTML = `<div class="list-item">No accounts</div>`
  } else {
    nonAdminUsers.forEach(user => {
      allList.innerHTML += `
        <div class="list-item">
          <strong>${user.username}</strong><br>
          ${user.email}<br>
          Verified: ${user.verified ? "Yes" : "No"}<br>
          Balance: ${user.balance.toFixed(2)} Credits<br>
          Rank: ${user.rank}
          <div class="action-row">
            <button class="small-btn" onclick="verifyAccount('${user.username}')">Verify</button>
            <button class="small-btn" onclick="deleteAccount('${user.username}')">Delete</button>
          </div>
        </div>
      `
    })
  }

  recentOrders.innerHTML = ""
  if (!appData.orders.length) {
    recentOrders.innerHTML = `<div class="list-item">No orders yet</div>`
  } else {
    appData.orders.slice().reverse().slice(0, 8).forEach(order => {
      recentOrders.innerHTML += `
        <div class="list-item">
          <strong>${order.username}</strong><br>
          ${order.items.join(", ")}<br>
          ${order.total.toFixed(2)} Credits<br>
          <span class="status ${order.status.toLowerCase()}">${order.status}</span>
          <div class="action-row">
            <button class="status-btn" onclick="setOrderStatus(${order.id}, 'Completed')">Complete</button>
            <button class="status-btn" onclick="setOrderStatus(${order.id}, 'Rejected')">Reject</button>
            <button class="status-btn" onclick="setOrderStatus(${order.id}, 'Pending')">Pending</button>
          </div>
        </div>
      `
    })
  }
}

function setOrderStatus(id, status) {
  if (!currentUser || !currentUser.isAdmin) return

  const order = appData.orders.find(o => o.id === id)
  if (!order) return

  order.status = status

  const log = appData.logShop.find(l => l.id === id)
  if (log) log.status = status

  saveData()
  renderDashboard()
  renderLogShop()
  renderOrders()
  showMessage("Order status updated")
}

function verifyAccount(username) {
  if (!currentUser || !currentUser.isAdmin) return
  const user = appData.users.find(u => u.username === username)
  if (!user) return
  user.verified = true
  saveData()
  renderDashboard()
  showMessage(username + " verified")
}

function deleteAccount(username) {
  if (!currentUser || !currentUser.isAdmin) return

  appData.users = appData.users.filter(u => u.username !== username)
  appData.supportTickets = appData.supportTickets.filter(t => t.username !== username)
  appData.orders = appData.orders.filter(o => o.username !== username)
  appData.logShop = appData.logShop.filter(o => o.username !== username)

  saveData()
  renderDashboard()
  renderTickets()
  renderLogShop()
  showMessage(username + " deleted")
}

function addBalance() {
  if (!currentUser || !currentUser.isAdmin) return

  const username = document.getElementById("moneyUsername").value.trim()
  const amount = parseFloat(document.getElementById("moneyAmount").value)

  const user = appData.users.find(u => u.username.toLowerCase() === username.toLowerCase())
  if (!user) {
    showMessage("User not found")
    return
  }

  if (isNaN(amount) || amount <= 0) {
    showMessage("Invalid amount")
    return
  }

  user.balance += amount
  saveData()
  document.getElementById("moneyUsername").value = ""
  document.getElementById("moneyAmount").value = ""
  renderDashboard()
  showMessage(`Added ${amount.toFixed(2)} credits to ${user.username}`)
}

function addKey() {
  if (!currentUser || !currentUser.isAdmin) return

  const name = document.getElementById("newKeyName").value.trim()
  const price = parseFloat(document.getElementById("newKeyPrice").value)

  if (!name || isNaN(price) || price < 0) {
    showMessage("Fill all fields correctly")
    return
  }

  appData.keys.push({
    id: "key_" + Date.now(),
    name,
    price,
    desc: "Custom key item",
    type: "key"
  })

  saveData()
  document.getElementById("newKeyName").value = ""
  document.getElementById("newKeyPrice").value = ""
  renderKeys()
  showMessage("Key added successfully")
}

function initApp() {
  syncCurrentUser()

  if (currentUser) {
    applyLoginUI()
    showSection("buyRolesSection")
  } else {
    document.getElementById("authSection").style.display = "block"
    document.getElementById("homeSection").style.display = "none"
    resetAdminUI()
  }
}

initApp()