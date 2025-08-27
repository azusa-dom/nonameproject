export async function syncEmails(req, res, next) {
  try {
    res.json({ message: 'sync emails - stub' });
  } catch (error) { next(error); }
}

export async function syncStatus(req, res, next) {
  try {
    res.json({ status: 'idle' });
  } catch (error) { next(error); }
}


