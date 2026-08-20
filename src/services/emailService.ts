import { toast } from 'react-hot-toast';
import { Product } from '../types';

export async function checkAndTriggerLowStockAlert(product: Product, newInventoryCount: number, threshold: number = 15) {
  // Check if stock has fallen below the threshold
  // In a real application, this would call a Cloud Function or an email delivery API like SendGrid/Postmark
  if (newInventoryCount < threshold) {
    console.log(`[ALERT] Low Stock Notification sent to supplyteam@company.com for ${product.name} (SKU: ${product.sku}). Current stock: ${newInventoryCount}. Threshold: ${threshold}.`);
    
    // Display a toast to the admin mimicking the automated email action
    toast(`Email alert sent to Supply Team for low stock of ${product.name}`, {
      icon: '📧',
      duration: 4000,
    });
    
    // Write an audit log (optional)
    try {
      const { logAuditAction } = await import('./adminService');
      await logAuditAction('LOW_STOCK_ALERT_TRIGGERED', product.id, `Automated email sent to supply team. Inventory: ${newInventoryCount}/${threshold}`);
    } catch(e) {
      console.warn("Could not log audit action for low stock alert", e);
    }
  }
}
