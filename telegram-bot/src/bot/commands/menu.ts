import { BotContext } from '../middleware/auth';
import { MenuService } from '../../services/menu_service';
import { env } from '../../config/env';

interface MenuContext extends BotContext {
  match?: RegExpExecArray;
}

export function setupMenuCommand(bot: any) {
  bot.command('menu', async (ctx: BotContext) => {
    await ctx.reply('⏳ جاري تحميل القائمة...');

    try {
      const menuService = new MenuService();
      const categories = await menuService.getCategories();

      let message = '🍔 **قائمة الطعام**\nتمتع بأشهى المأكولات!\n\n';

      // عرض الفئات مع أزرار inline
      const categoryButtons = [];
      for (const category of categories) {
        categoryButtons.push([{
          text: category.name_ar,
          callback_data: `menu_cat_${category.id}`,
        }]);
      }

      // زر فتح الـ Mini App
      categoryButtons.push([
        { text: '🚀 فتح القائمة الكاملة', url: env.miniApp.url },
      ]);

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: categoryButtons,
        },
      });
    } catch (error) {
      console.error('Error in /menu:', error);
      await ctx.reply('❌ عذراً، حدث خطأ أثناء تحميل القائمة. الرجاء المحاولة مرة أخرى.');
    }
  });

  // معالجة الضغط على فئة معينة
  bot.action(/menu_cat_(.+)/, async (ctx: MenuContext) => {
    await ctx.answerCbQuery();
    const categoryId = ctx.match![1];

    try {
      const menuService = new MenuService();
      const items = await menuService.getMenuItemsByCategory(categoryId);
      const category = (await menuService.getCategories()).find(c => c.id === categoryId);

      if (items.length === 0) {
        await ctx.editMessageText(`📭 لا توجد أصناف في هذه الفئة حالياً.\n\n[🍔 العودة للقائمة]`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔙 العودة للقائمة', callback_data: 'back_to_menu' }],
              [{ text: '🚀 فتح القائمة الكاملة', url: env.miniApp.url }],
            ],
          },
        });
        return;
      }

      let message = `*${category?.name_ar || 'الأصناف'}*\n\n`;
      for (const item of items) {
        message += `• ${item.name_ar} — ${item.price.toFixed(2)} ر.س\n`;
        if (item.description_ar) {
          message += `  _${item.description_ar.substring(0, 60)}_\n`;
        }
      }
      message += '\n👇 اطلب من خلال التطبيق';

      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 العودة للقائمة', callback_data: 'back_to_menu' }],
            [{ text: '🚀 فتح القائمة الكاملة', url: env.miniApp.url }],
          ],
        },
      });
    } catch (error) {
      console.error('Error in category:', error);
      await ctx.reply('❌ عذراً، حدث خطأ.');
    }
  });

  // العودة للقائمة
  bot.action('back_to_menu', async (ctx: MenuContext) => {
    await ctx.answerCbQuery();
    // إعادة تشغيل أمر /menu
    const menuService = new MenuService();
    const categories = await menuService.getCategories();
    
    let message = '🍔 **قائمة الطعام**\nتمتع بأشهى المأكولات!\n\n';
    const categoryButtons = [];
    
    for (const category of categories) {
      categoryButtons.push([{
        text: category.name_ar,
        callback_data: `menu_cat_${category.id}`,
      }]);
    }
    
    categoryButtons.push([
      { text: '🚀 فتح القائمة الكاملة', url: env.miniApp.url },
    ]);

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: categoryButtons,
      },
    });
  });
}
