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

bot.on('message', async (msg) => {
    if (!msg.text && !msg.photo) return;
    
    if (msg.caption && msg.caption.includes('داخوازییا زێدەکرنا بالانسی')) {
        const text = msg.caption;
        
        const matchTxId = text.match(/\((.*?)\#\)/);
        const txId = matchTxId ? matchTxId[1] : Date.now().toString();

        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ پەسەندکرن (Approve)', callback_data: `approve_${txId}` }
                    ]
                ]
            }
        };

        if (msg.photo) {
            const photoId = msg.photo[msg.photo.length - 1].file_id;
            await bot.sendPhoto(msg.chat.id, photoId, {
                caption: text + "\n\n⚠️ بۆ پەسەندکرنی، ل خوارێ ل دوگمەی لێدە:",
                ...opts
            });
        } else {
            await bot.sendMessage(msg.chat.id, text + "\n\n⚠️ بۆ پەسەندکرنی، ل خوارێ ل دوگمەی لێدە:", opts);
        }
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('approve_')) {
        const txId = data.split('_')[1];

        const { error } = await supabase
            .from('transactions')
            .update({ status: 'approved' })
            .eq('id', txId);

        if (error) {
            bot.answerCallbackQuery(query.id, { text: 'خەڵەتیەک ڕووی دا لە داتابەیسێ!', show_alert: true });
        } else {
            bot.answerCallbackQuery(query.id, { text: 'ب سەرکەفتی هاتە پەسەندکرن ✅' });
            bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: query.message.message_id });
            bot.sendMessage(chatId, `✅ داخوازی هاتە پەسەندکرن و بالانس بۆ کڕیاری هاتە زێدەکرن!`);
        }
    }
});
