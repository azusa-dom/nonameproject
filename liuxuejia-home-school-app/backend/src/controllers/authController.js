export async function register(req, res, next) {
  try {
    res.json({ message: 'register - stub' });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    res.json({ message: 'login - stub' });
  } catch (error) { next(error); }
}

export async function refresh(req, res, next) {
  try {
    res.json({ message: 'refresh - stub' });
  } catch (error) { next(error); }
}


