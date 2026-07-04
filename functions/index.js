const functions = require('firebase-functions/v2/database');
const admin = require('firebase-admin');

admin.initializeApp();

exports.onNewPendingDeposit = functions.onValueWritten('/pending-deposits/{depositId}', async (event) => {
  if (!event.data.after.exists()) return;

  const deposit = event.data.after.val();

  const tokensSnap = await admin.database().ref('admin-fcm-tokens').once('value');
  const tokensData = tokensSnap.val();
  if (!tokensData) return;

  const tokens = Object.values(tokensData).map(t => t.token).filter(Boolean);
  if (tokens.length === 0) return;

  const message = {
    notification: {
      title: '💰 طلب شحن جديد',
      body: `${deposit.userName} — ${deposit.amount} EGP`,
    },
    data: {
      click_action: 'OPEN_ADMIN',
      type: 'new_deposit',
    },
    tokens,
  };

  try {
    await admin.messaging().sendEachForMulticast(message);
  } catch (err) {
    console.error('FCM send error:', err);
  }
});
