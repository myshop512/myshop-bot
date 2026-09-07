const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const token = '8663749496:AAE32oHOvAfmULkHA1pb7GqAUmflEmj_qPI';
const supabaseUrl = 'https://xojzxhgvxvjwvfhwzjjx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

const bot = new TelegramBot(token, { polling: true });
const supabase = createClient(supabaseUrl, supabaseKey);

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "سڵاو! بۆتێ مای شۆپ یێ ئۆنلاینە ✅");
});

// گرتنا دوگمەیا پەسەندکرنێ (Callback Query)
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('approve_')) {
        const userId = data.split('_')[1];

        const { error } = await supabase
            .from('transactions')
            .update({ status: 'approved' })
            .eq('id', userId);

        if (error) {
            bot.answerCallbackQuery(query.id, { text: 'خەڵەتیەک ڕووی دا!', show_alert: true });
        } else {
            bot.answerCallbackQuery(query.id, { text: 'ب سەرکەفتی هاتە پەسەندکرن ✅' });
            bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: query.message.message_id });
            bot.sendMessage(chatId, `✅ داخوازی هاتە پەسەندکرن و بالانس بۆ کڕیاری هاتە زێدەکرن!`);
        }
    }
});
