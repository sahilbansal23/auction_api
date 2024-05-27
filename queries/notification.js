const getUnread = `SELECT id, user_id, message, is_read, created_at
FROM public.notifications WHERE is_read = false AND user_id =$1 ORDER BY created_at ASC `;

const mark_read = `UPDATE public.notifications
SET is_read = true
WHERE user_id = $1;`;

module.exports = {
  getUnread,
  mark_read,
};
