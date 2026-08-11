const fs = require('fs');
let content = fs.readFileSync('src/components/UserProfile.tsx', 'utf-8');

// Add import for OrderStatusStepper
if (!content.includes("import OrderStatusStepper")) {
    content = content.replace(
      "import OrderTrackingMap from './OrderTrackingMap';",
      "import OrderTrackingMap from './OrderTrackingMap';\nimport OrderStatusStepper from './OrderStatusStepper';"
    );
}

// Render the stepper above the map
content = content.replace(
  "<OrderTrackingMap orderId={order.id} status={order.status} onClose={() => setTrackingOrderId(null)} />",
  "<OrderStatusStepper status={order.status} />\n                                  <OrderTrackingMap orderId={order.id} status={order.status} onClose={() => setTrackingOrderId(null)} />"
);

fs.writeFileSync('src/components/UserProfile.tsx', content);
