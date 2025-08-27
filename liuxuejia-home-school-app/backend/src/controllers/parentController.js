export async function bindChild(req, res, next) {
  try {
    res.json({ message: 'bind child - stub' });
  } catch (error) { next(error); }
}

export async function listChildren(req, res, next) {
  try {
    res.json([]);
  } catch (error) { next(error); }
}

export async function getChildData(req, res, next) {
  try {
    res.json({ childId: req.params.childId });
  } catch (error) { next(error); }
}


