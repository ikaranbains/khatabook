const express = require("express");
const validate = require("../../middlewares/validate.middleware");
const { attachWorkspace } = require("../../middlewares/workspace.middleware");
const transactionController = require("../../controllers/transaction.controller");
const {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionSchema,
  transactionIdParamSchema,
} = require("../../validators/transaction.validator");

const router = express.Router();

router.use(attachWorkspace);

router.get("/", validate(listTransactionSchema), transactionController.listTransactions);
router.post("/", validate(createTransactionSchema), transactionController.createTransaction);
router.get("/:id", validate(transactionIdParamSchema), transactionController.getTransactionById);
router.patch("/:id", validate(updateTransactionSchema), transactionController.updateTransaction);
router.delete("/:id", validate(transactionIdParamSchema), transactionController.deleteTransaction);

module.exports = router;
