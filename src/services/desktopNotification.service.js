// Desktop Notification Service using Web Notification API
// Displays native OS/Windows desktop notifications in Google Chrome / Edge

class DesktopNotificationService {
  constructor() {
    this.networkListenerAttached = false;
    this.lastNotifiedMap = new Map();
  }

  // Request native desktop notification permission from Chrome / browser
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Desktop notifications are not supported in this browser.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (err) {
        console.error('Error requesting notification permission:', err);
        return false;
      }
    }

    return false;
  }

  // Check if desktop notification permission is granted
  isPermissionGranted() {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  }

  // Show a native Google Chrome notification on the computer desktop
  async showDesktopAlert({ title, body, icon, tag, data }) {
    if (typeof window === 'undefined' || !('Notification' in window)) return null;

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/Onimta_logo_new.png',
        badge: '/Onimta_logo_new.png',
        tag: tag || 'unpaid-bill-' + Date.now(),
        requireInteraction: true, // Keeps alert visible on Windows computer desktop until clicked
        silent: false,
        data
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
      };

      return notification;
    } catch (err) {
      console.error('Failed to trigger desktop notification:', err);
      return null;
    }
  }

  // Trigger computer desktop alert for an unpaid / pending payment bill
  async notifyUnpaidBill({ docNo, refNo, vendor, amount, dueDate }) {
    const docDisplay = docNo || refNo || 'N/A';
    const refDisplay = refNo || docNo || 'N/A';
    const formattedAmount = typeof amount === 'number'
      ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : (amount ? Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00');

    const title = `⚠️ Unpaid Bill Alert (Ref: ${refDisplay})`;
    const body = `Doc No: ${docDisplay}\nReference No: ${refDisplay}\nVendor: ${vendor || 'Supplier'}\nAmount Due: Rs. ${formattedAmount}\nStatus: Payment Pending (Not Completed)`;

    // Avoid duplicate rapid notifications within 30 seconds for the same document
    const now = Date.now();
    const lastTime = this.lastNotifiedMap.get(docDisplay) || 0;
    if (now - lastTime < 30000) {
      return;
    }
    this.lastNotifiedMap.set(docDisplay, now);

    return this.showDesktopAlert({
      title,
      body,
      tag: `unpaid-bill-${docDisplay}`,
      data: { docNo: docDisplay, refNo: refDisplay, amount: formattedAmount }
    });
  }

  // Global network listener to trigger desktop alert when connected to the network
  initNetworkDesktopNotifier(fetchUnpaidBillsFn) {
    if (this.networkListenerAttached || typeof window === 'undefined') return;
    this.networkListenerAttached = true;

    // Prompt for notification permission on startup
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const checkPendingBills = async () => {
      if (!navigator.onLine) return;
      if (typeof fetchUnpaidBillsFn !== 'function') return;

      try {
        const bills = await fetchUnpaidBillsFn();
        if (Array.isArray(bills) && bills.length > 0) {
          // Send desktop notification for pending unpaid bills
          bills.slice(0, 3).forEach((bill, idx) => {
            setTimeout(() => {
              this.notifyUnpaidBill({
                docNo: bill.docNo || bill.doc_No,
                refNo: bill.refNo || bill.ref_No || bill.reference || bill.docNo,
                vendor: bill.vendorName || bill.vendor || bill.vendorId,
                amount: bill.amount || bill.netAmount || bill.net_Amount,
                dueDate: bill.dueDate || bill.billDueDate || bill.postDate
              });
            }, idx * 1500);
          });
        }
      } catch (e) {
        console.warn('Network bill desktop alert check failed:', e);
      }
    };

    // Listen to network online event
    window.addEventListener('online', () => {
      checkPendingBills();
    });

    // Check once shortly after initialization when online
    if (navigator.onLine) {
      setTimeout(() => {
        checkPendingBills();
      }, 4000);
    }
  }
}

export const desktopNotificationService = new DesktopNotificationService();
