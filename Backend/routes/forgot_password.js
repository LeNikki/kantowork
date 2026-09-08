const express = require('express');
const router = express.Router();

// Not implemented yet - the controller and service upstream are still empty.
router.post('/', (req, res) => {
    res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;
