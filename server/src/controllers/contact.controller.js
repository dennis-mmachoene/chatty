// ============================================
// FILE: server/src/controllers/contact.controller.js
// ============================================
const contactService = require('../services/contact.service');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../config/constants');

class ContactController {
  async sendRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const { email } = req.body;

      const contact = await contactService.sendContactRequest(userId, email);

      logger.info({ userId, contactEmail: email }, 'Contact request sent');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: contact,
        message: 'Contact request sent',
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const { contactId } = req.params;

      const contact = await contactService.acceptContactRequest(userId, contactId);

      logger.info({ userId, contactId }, 'Contact request accepted');

      res.json({
        success: true,
        data: contact,
        message: 'Contact request accepted',
      });
    } catch (error) {
      next(error);
    }
  }

  async getContacts(req, res, next) {
    try {
      const userId = req.user.id;
      const contacts = await contactService.getContacts(userId);

      res.json({
        success: true,
        data: contacts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingRequests(req, res, next) {
    try {
      const userId = req.user.id;
      const requests = await contactService.getPendingRequests(userId);

      res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  async blockContact(req, res, next) {
    try {
      const userId = req.user.id;
      const { contactId } = req.params;

      await contactService.blockContact(userId, contactId);

      logger.info({ userId, contactId }, 'Contact blocked');

      res.json({
        success: true,
        message: 'Contact blocked successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteContact(req, res, next) {
    try {
      const userId = req.user.id;
      const { contactId } = req.params;

      await contactService.deleteContact(userId, contactId);

      logger.info({ userId, contactId }, 'Contact deleted');

      res.json({
        success: true,
        message: 'Contact deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addContactByQR(req, res, next) {
    try {
      const userId = req.user.id;
      const { qrData } = req.body;

      const contactData = QRCodeGenerator.parseContactQRCode(qrData);
      const contact = await contactService.sendContactRequest(
        userId,
        contactData.email
      );

      logger.info({ userId, contactEmail: contactData.email }, 'Contact added via QR');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: contact,
        message: 'Contact request sent',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContactController();