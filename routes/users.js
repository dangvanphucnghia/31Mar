var express = require('express');
var router = express.Router();
var userControllers = require('../controllers/users');
const { verifyToken, isAdmin, isMod } = require('../middlewares/auth');

// GET all - mod
router.get('/', verifyToken, isMod, async function (req, res, next) {
  try {
    let users = await userControllers.getAllUsers();
    res.send({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// GET by id (mod, nhưng không xem được chính mình)
router.get('/:id', verifyToken, isMod, async function (req, res, next) {
  try {
    if (req.user._id === req.params.id) {
      return res.status(403).send({ success: false, message: "Không được truy cập thông tin của chính mình" });
    }
    let user = await userControllers.getUserById(req.params.id);
    res.send({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// CREATE - admin
router.post('/', verifyToken, isAdmin, async function (req, res, next) {
  try {
    let { username, password, email, role } = req.body;
    let newUser = await userControllers.createAnUser(username, password, email, role);
    res.status(200).send({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
});

// UPDATE - admin
router.put('/:id', verifyToken, isAdmin, async function (req, res, next) {
  try {
    let updatedUser = await userControllers.updateUserById(req.params.id, req.body);
    res.send({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
});

// DELETE - admin
router.delete('/:id', verifyToken, isAdmin, async function (req, res, next) {
  try {
    let deletedUser = await userControllers.deleteUserById(req.params.id);
    res.send({ success: true, data: deletedUser });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
