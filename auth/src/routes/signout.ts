//to sign out user we send back a header that tells user's browser to dump all the info inside the cookie which removes jwt. therefore whenever user makes followup req no token is included in the cookie.
import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  req.session = null;

  res.send({});
});

export { router as signoutRouter };
