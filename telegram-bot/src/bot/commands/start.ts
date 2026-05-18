import { BotContext } from '../middleware/auth';
import { getMainKeyboard } from '../keyboards/main_keyboard';
import { env } from '../../config/env';
import { OrderService } from '../../services/order_service';

export function setupStartCommand(bot: any) {
  bot.start(async (ctx: BotContext) => {
    const firstName = ctx.from?.first_name || 'عميلنا العزيز';
    const messageText = (ctx.message as any)?.text || '';
    const payload = messageText.split(' ')[1];

    // ── Deep Link: Order tracking ──
    if (payload?.startsWith('order_')) {
      const orderId = payload.replace('order_', '');
      try {
        const orderService = new OrderService();
        const order = await orderService.getOrder(orderId);

        if (order) {
          const orderMsg = orderService.formatOrderForBot(order);
          await ctx.reply(
            `👋 أهلاً بك يا ${firstName}!\n\n` +
            `📋 *متابعة الطلب #${order.order_number}*\n\n` +
            orderMsg,
            {
              parse_mode: 'Markdown',
              reply_markup: getMainKeyboard().reply_markup,
            }
          );
          return;
        }
      } catch {
        // Fall through to default welcome
      }
    }

    // ── Deep Link: Reorder ──
    if (payload?.startsWith('reorder_')) {
      const orderId = payload.replace('reorder_', '');
      try {
        const orderService = new OrderService();
        const session = (ctx as any).session;
        
        if (session?.customerId) {
          const reorder = await orderService.prepareReorder(orderId, session.customerId);
          if (reorder) {
            let msg = 
              `👋 أهلاً بك يا ${firstName}!\n\n` +
              `🔄 *إعادة الطلب #${reorder.originalOrderNumber}*\n\n`;
            
            if (!reorder.allAvailable) {
              msg += `⚠️ بعض الأصناف غير متوفرة حالياً: ${reorder.unavailableItems.join(', ')}\n\n`;
            }
            
            msg += `اضغط على الزر لفتح التطبيق وإعادة الطلب.`;

            await ctx.reply(msg, {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🔄 فتح التطبيق لإعادة الطلب', url: `${env.miniApp.url}?reorder=${orderId}` }],
                ],
              },
            });
            return;
          }
        }
      } catch {
        // Fall through to default welcome
      }
    }

    // ── Default Welcome ──
    const welcomeMessage = 
      `السلام عليكم! 👋\n\n` +
      `أهلاً بك يا *${firstName}* في *${env.restaurant.name}* 🏪\n\n` +
      `🍔 نقدم أشهى المأكولات الشرقية والغربية\n` +
      `⚡ اطلب الآن واستلم خلال ٢٠-٣٠ دقيقة\n` +
      `💳 الدفع عند الاستلام\n\n` +
      `👇 اختر من القائمة أدناه:`;

    await ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: getMainKeyboard().reply_markup,
    });
  });
}
