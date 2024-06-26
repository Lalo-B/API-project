// backend/routes/api/session.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth, authErrorCatcher } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];


// router.use(authErrorCatcher);
// router.use(handleValidationErrors);
//==============================================================================
//checks if a user is logged in
router.post('/', validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  const user = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential
      }
    }
  });


  //if no user or if password
  if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
    const err = new Error('Login failed');
    err.status = 401;
    err.title = 'Login failed';
    err.errors = { credential: 'The provided credentials were invalid.' };

    // return res.json({ message: "Invalid credentials" })
    return next(err);
  };

  // console.log('error here?')
  // if (credential === undefined || credential === '') {
  //   res.status(400)
  //   res.body = {
  //     "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
  //     "errors": {
  //       "credential": "Email or username is required",
  //       "password": "Password is required"
  //     }
  //   };
  //   console.log('error here?')
  //   return res.json(res.body);
  // }

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };


  await setTokenCookie(res, safeUser);

  return res.json({
    user: safeUser
  });
}
);
//==============================================================================
router.delete('/', (req, res) => {
  res.clearCookie('token'); //is this XSRF-TOKEN or token
  return res.json({ message: 'Success' });
});


router.get('/', (req, res) => {
  const { user } = req;
  if (user) {
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };
    return res.json({
      user: safeUser
    });
  } else return res.json({ user: null });
}
);

// router.use('/', (err, req, res, next) => {
//   console.log("this is the error ===========",err)
//   if (err.title === "Bad request.") {
//     const status = err.status || 500;
//     res.status(status);
//     res.err = {
//       message: err.message,
//       errors: {
//         credential: "Email or username is required",
//         password: "Password is required"
//       }
//     }
//     return res.json(res.err);
//   };
// })

module.exports = router;
