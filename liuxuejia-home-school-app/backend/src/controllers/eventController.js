export async function listEvents(req, res, next) {
  try {
    res.json([]);
  } catch (error) { next(error); }
}

export async function getEvent(req, res, next) {
  try {
    res.json({ id: req.params.id });
  } catch (error) { next(error); }
}

export async function updateEvent(req, res, next) {
  try {
    res.json({ id: req.params.id, ...req.body });
  } catch (error) { next(error); }
}

export async function deleteEvent(req, res, next) {
  try {
    res.status(204).end();
  } catch (error) { next(error); }
}

export async function feedback(req, res, next) {
  try {
    res.json({ id: req.params.id, feedback: req.body });
  } catch (error) { next(error); }
}


