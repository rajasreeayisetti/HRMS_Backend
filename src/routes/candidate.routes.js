const express = require('express');
const { getCandidates, createCandidate, getCandidate, updateCandidate, deleteCandidate } = require('../controllers/candidate.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All candidate routes are protected

router.route('/')
    .get(getCandidates)
    .post(createCandidate);

router.route('/:id')
    .get(getCandidate)
    .put(updateCandidate)
    .delete(deleteCandidate);

module.exports = router;
