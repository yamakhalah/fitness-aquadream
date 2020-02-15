const WebhookManager = require('webhook-manager')

const manager = new WebhookManager(4001)

manager.on('ready', () => {
  console.log(`WebhookManager started on port :${manager.PORT}`);
})

manager.on('/', data => {
  console.log("Received / webhook with following data:");
  console.log(data)
  console.log(data.id)
})

manager.on('/checkout/', data => {
  console.log("Received /checkout webhook with following data:", data);
})