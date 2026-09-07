const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const TELEGRAM_BOT_TOKEN = '8663749496:AAE32oHOvAfmULkHA1pb7GqAUmflEmj_qPI';
const SUPABASE_URL = 'https://xojzxhgcnmfiwabqygvo.supabase.co';
const SUPABASE_KEY = 'Sb_publishable_Li8SRoBgj-ZboaHqt2KDsg_oPNERPDr';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

bot.on('message', async (msg) => {
    if (!msg.reply_to_message) return;

    const replyText = msg.text ? msg.text.toLowerCase().trim() : '';
    const originalText = msg.reply_to_message.caption || msg.reply_to_message.text || '';

    const match = originalText.match(/#(\d+)/);
    if (!match) return;

    const txId = match[1];

    if (['ok', 'approved', 'سەح', 'بەلێ'].includes(replyText)) {
        const { error } = await supabase
            .from('transactions')
            .update({ status: 'approved' })
            .eq('id', txId);

        if (!error) {
            bot.sendMessage(msg.chat.id, `✅ داخوازیا #${txId} ب سەرکەوتوویی هاتە پەسەندکرن!`, { reply_to_message_id: msg.message_id });
        } else {
            bot.sendMessage(msg.chat.id, `❌ شاشیەک ڕوودا: ${error.message}`);
        }
    } else if (['no', 'rejected', 'ڕەت', 'نەخێر'].includes(replyText)) {
        await supabase
            .from('transactions')
            .update({ status: 'rejected' })
            .eq('id', txId);

        bot.sendMessage(msg.chat.id, `❌ داخوازیا #${txId} هاتە ڕەتکرن!`, { reply_to_message_id: msg.message_id });
    }
});
