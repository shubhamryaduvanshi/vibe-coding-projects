'use server'

import puppeteer from 'puppeteer';

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  isPurchased: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
  items?: ShoppingListItem[];
}

export async function generateShoppingListPDF(data: ShoppingList) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Simple grouping by purchased status since categories aren't available in data
    const pendingItems = (data.items || []).filter(item => !item.isPurchased);
    const purchasedItems = (data.items || []).filter(item => item.isPurchased);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #18181b;
              line-height: 1.5;
              padding: 40px;
            }
            .header {
              border-bottom: 2px solid #10b981;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 900;
              color: #064e3b;
              letter-spacing: -0.025em;
            }
            .date {
              color: #71717a;
              font-size: 14px;
              font-weight: 500;
            }
            .section {
              margin-bottom: 40px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #065f46;
              background-color: #ecfdf5;
              padding: 8px 16px;
              border-radius: 8px;
              margin-bottom: 16px;
              display: inline-block;
            }
            .item-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            .item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              border-bottom: 1px solid #f4f4f5;
            }
            .checkbox {
              width: 18px;
              height: 18px;
              border: 2px solid #d4d4d8;
              border-radius: 4px;
              flex-shrink: 0;
            }
            .checkbox.checked {
              background-color: #10b981;
              border-color: #10b981;
              position: relative;
            }
            .checkbox.checked::after {
              content: '';
              position: absolute;
              left: 5px;
              top: 1px;
              width: 5px;
              height: 10px;
              border: solid white;
              border-width: 0 2px 2px 0;
              transform: rotate(45deg);
            }
            .item-name {
              font-size: 16px;
              font-weight: 600;
            }
            .item-qty {
              font-size: 14px;
              color: #71717a;
              margin-left: auto;
              font-weight: 700;
            }
            .purchased {
              opacity: 0.5;
            }
            .purchased .item-name {
              text-decoration: line-through;
            }
            @media print {
              body { padding: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${data.name}</h1>
              <div style="margin-top: 4px; color: #059669; font-weight: 700;">CookSuite Shopping List</div>
            </div>
            <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
          </div>

          ${pendingItems.length > 0 ? `
            <div class="section">
              <div class="section-title">Items to Buy</div>
              <div class="item-grid">
                ${pendingItems.map(item => `
                  <div class="item">
                    <div class="checkbox"></div>
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">${item.quantity} ${item.unit}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${purchasedItems.length > 0 ? `
            <div class="section purchased">
              <div class="section-title" style="background-color: #f4f4f5; color: #71717a;">Already Purchased</div>
              <div class="item-grid">
                ${purchasedItems.map(item => `
                  <div class="item">
                    <div class="checkbox checked"></div>
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">${item.quantity} ${item.unit}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${(!data.items || data.items.length === 0) ? `
            <div style="text-align: center; padding: 100px 0; color: #71717a;">
              <p style="font-size: 18px; font-weight: 700;">Your list is empty</p>
            </div>
          ` : ''}

          <div style="position: fixed; bottom: 40px; left: 40px; right: 40px; border-top: 1px solid #f4f4f5; pt: 20px; font-size: 10px; color: #a1a1aa; text-align: center;">
            Enjoy your cooking with CookSuite! &copy; ${new Date().getFullYear()}
          </div>
        </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();

    return {
      success: true,
      pdf: Buffer.from(pdf).toString('base64'),
    };
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return { success: false, error: error.message };
  }
}
