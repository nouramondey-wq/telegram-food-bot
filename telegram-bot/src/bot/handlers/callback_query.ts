import { BotContext } from '../middleware/auth';
import { OrderService } from '../../services/order_service';
import { NotificationService } from '../../services/notification_service';
import { getConfirmCancelKeyboard, getOrderSuccessKeyboard } from '../keyboards/order_keyboard';
import { env } from '../../config/env';

interface CallbackContext extends BotContext {
  match?: RegExpExecArray;
}

export function setupCallbackHandler(bot: any) {
  const orderService = new OrderService();
  const notificationService = new NotificationService();

  // ── Track Order ──
  bot.action(/track_(.+)/, async (ctx: CallbackContext) => {
    await ctx.answerCbQuery();
    const orderId = ctx.match![1];

    try {
      const order = await orderService.getOrder(orderId);
      if (!order) {
        await ctx.reply('❌ الطلب غير موجود.');
        return;
      }

      const message = orderService.formatOrderForBot(order);
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🍔 طلب جديد', web_app: { url: env.miniApp.url } }],
          ],
        },
      });
    } catch (error) {
      console.error('Error tracking order:', error);
      await ctx.reply('❌ عذراً، حدث خطأ.');
    }
  });

  // ── Cancel Step 1: Confirmation ──
  bot.action(/cancel_(.+)/, async (ctx: CallbackContext) => {
    await ctx.answerCbQuery();
    const orderId = ctx.match![1];

    await ctx.reply(
      `⚠️ هل أنت متأكد من إلغاء الطلب؟\n\nلا يمكن التراجع عن هذا الإجراء.`,
      {
        reply_markup: getConfirmCancelKeyboard(orderId).reply_markup,
      }
    );
  });

  // ── Cancel Step 2: Confirm ──
  bot.action(/confirm_cancel_(.+)/, async (ctx: CallbackContext) => {
    await ctx.answerCbQuery();
    const session = (ctx as any).session;
    const orderId = ctx.match![1];

    if (!session?.customerId) {
      await ctx.reply('⚠️ يرجى البدء أولاً via /start');
      return;
    }

    try {
      const success = await orderService.cancelOrder(orderId, session.customerId);
      if (success) {
        await ctx.editMessageText('✅ تم إلغاء الطلب بنجاح.');
        await ctx.reply(
          '📋 لا تقلق، يمكنك طلب وجبة جديدة في أي وقت! 😊',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🍔 فتح القائمة', web_app: { url: env.miniApp.url } }],
              ],
            },
          }
        );
      } else {
        await ctx.editMessageText('❌ عذراً، لا يمكن إلغاء الطلب. الطلب إما قيد التحضير أو تم تسليمه.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      await ctx.reply('❌ عذراً، حدث خطأ أثناء إلغاء الطلب.');
    }
  });

  // ── Cancel Step 2: No ──
  bot.action(/no_cancel_(.+)/, async (ctx: CallbackContext) => {
    await ctx.answerCbQuery('تم التراجع ✅');
    await ctx.editMessageText('✅ تم التراجع عن الإلغاء.');
  });

  // ── Reorder ──
  bot.action(/reorder_(.+)/, async (ctx: CallbackContext) => {
    await ctx.answerCbQuery();
    const orderId = ctx.match![1];
    const username = env.bot.username;

    const reorderUrl = `https://t.me/${username}?start=reorder_${orderId}`;

    try {
      const order = await orderService.getOrder(orderId);
      if (!order) {
        await ctx.reply('❌ الطلب غير موجود.');
        return;
      }

      await ctx.reply(
        `🔄 *إعادة الطلب #${order.order_number}*\n\n` +
        `تم تجهيز طلبك السابق لإعادة الطلب.\n` +
        `اضغط على الزر لفتح التطبيق وتأكيد الطلب.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔄 إعادة الطلب', url: reorderUrl }],
              [{ text: '🍔 فتح القائمة', web_app: { url: env.miniApp.url } }],
            ],
          },
        }
      );
    } catch (error) {
      console.error('Error reordering:', error);
      await ctx.reply('❌ عذراً، حدث خطأ.');
    }
  });

  // ── My Orders ──
  bot.action('my_orders', async (ctx: BotContext) => {
    await ctx.answerCbQuery();
    await ctx.reply('/status');
  });

  // ── Location ──
  bot.action('location', async (ctx: BotContext) => {
    await ctx.answerCbQuery();
    await ctx.replyWithLocation(env.restaurant.latitude, env.restaurant.longitude);
    await ctx.reply(
      `📍 **${env.restaurant.name}**\n${env.restaurant.address}`,
      { parse_mode: 'Markdown' }
    );
  });

  // ── Contact ──
  bot.action('contact', async (ctx: BotContext) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      `📞 **للتواصل مع ${env.restaurant.name}:**\n\n` +
      `${env.restaurant.phone}\n\n` +
      `نرحب باستفساراتك! 😊`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📍 الموقع', callback_data: 'location' }],
          ],
        },
      }
    );
  });

  // ── Hours ──
  bot.action('hours', async (ctx: BotContext) => {
    await ctx.answerCbQuery();
    const message =
      `🕐 **أوقات عمل ${env.restaurant.name}**\n\n` +
      `${env.restaurant.workingHours}\n\n` +
      `🍽️ ننتظركم!`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
  });

  // ── Rating ──
  bot.action(/rate_(\d)/, async (ctx: CallbackContext) => {
    await ctx.answerCbQuery();
    const rating = ctx.match![1];
    await ctx.reply(
      `⭐ شكراً لتقييمك! تقييمك (${rating}/5) سيساعدنا على تحسين خدماتنا. 😊`
    );
  });
}
