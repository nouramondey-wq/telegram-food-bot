import { BotContext } from '../middleware/auth';
import { OrderService } from '../../services/order_service';
import { env } from '../../config/env';
import { getOrderInlineKeyboard } from '../keyboards/order_keyboard';

export function setupStatusCommand(bot: any) {
  bot.command('status', async (ctx: BotContext) => {
    const session = (ctx as any).session;
    if (!session?.customerId) {
      await ctx.reply('⚠️ يرجى البدء أولاً via /start');
      return;
    }

    await ctx.reply('⏳ جاري تحميل طلباتك...');

    try {
      const orderService = new OrderService();
      const orders = await orderService.getCustomerOrders(session.customerId, 5);

      if (orders.length === 0) {
        await ctx.reply(
          '📋 لا توجد طلبات سابقة.\n\n' +
          '🍔 ابدأ أول طلب لك من القائمة!',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🍔 فتح القائمة', web_app: { url: env.miniApp.url } }],
              ],
            },
          }
        );
        return;
      }

      // Show summary + last order detail
      const summary = orderService.formatOrdersList(orders);
      await ctx.reply(summary, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🍔 طلب جديد', web_app: { url: env.miniApp.url } }],
          ],
        },
      });

      // If there's an active order, show it in detail with action buttons
      const activeOrder = orders.find(
        (o: any) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
      );

      if (activeOrder) {
        const detail = orderService.formatOrderForBot(activeOrder);
        const keyboard = getOrderInlineKeyboard(activeOrder.id, activeOrder.status);
        await ctx.reply(detail, {
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup,
        });
      }
    } catch (error) {
      console.error('Error in /status:', error);
      await ctx.reply('❌ عذراً، حدث خطأ أثناء تحميل طلباتك. الرجاء المحاولة مرة أخرى.');
    }
  });
}
