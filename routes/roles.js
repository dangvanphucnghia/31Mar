var express = require('express');
var router = express.Router();
const roleSchema = require('../schemas/role');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// GET - public
router.get('/', async function (req, res, next) {
  let roles = await roleSchema.find({});
  res.send({ success: true, data: roles });
});

// POST - admin
router.post('/', verifyToken, isAdmin, async function (req, res, next) {
  let body = req.body;
  let newRole = new roleSchema({ name: body.name });
  await newRole.save();
  res.status(200).send({ success: true, data: newRole });
});

// PUT - admin
router.put('/:id', verifyToken, isAdmin, async function (req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    if (role) {
      role.name = req.body.name || role.name;
      await role.save();
      res.send({ success: true, data: role });
    } else {
      res.status(404).send({ success: false, message: 'Role not found' });
    }
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

// DELETE - admin
router.delete('/:id', verifyToken, isAdmin, async function (req, res, next) {
  try {
    await roleSchema.findByIdAndDelete(req.params.id);
    res.send({ success: true, message: 'Role deleted' });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

module.exports = router;
