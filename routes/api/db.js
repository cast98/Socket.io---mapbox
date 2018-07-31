const express = require('express');

const router = express.Router();
const {
    insertRow,
    deleteRow,
    updateRow
} = require('../../controllers/IDU');

const {
    selectAll,
    selectNew,
} = require('../../controllers/select')

/*
 /api
 */

router.post('/insert', insertRow);
router.post('/delete', deleteRow);
router.post('/update', updateRow);
router.get('/select/all', selectAll);
router.post('/select/new', selectNew);

module.exports = router;