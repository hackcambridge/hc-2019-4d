import express = require('express');
const { getTicketsWithApplicantInfo } = require('js/server/attendance/logic');

const ticketsRouter = express.Router();

/**
 * Gets all tickets with applicant info
 */
ticketsRouter.get('/', (req, res, next) => {
  getTicketsWithApplicantInfo()
    .then((tickets) => {
      res.json(tickets);
    }).catch(next);
});

module.exports = ticketsRouter;
