import * as brevo from '@getbrevo/brevo';
import  VaultSecrets from "@thecollege/vault-secrets";


class NotificationService {
  async sendNotification(notification) {

    let apiInstance = new brevo.TransactionalEmailsApi();
    let apiKey = apiInstance.authentications['apiKey'];

    const vaultSecrets = new VaultSecrets();
    const secretData = await vaultSecrets.getSecretsByName("EMAIL_CLIENT_KEY")
    apiKey.apiKey = secretData.version.value

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = notification.subject
    sendSmtpEmail.htmlContent = notification.content
    sendSmtpEmail.sender = { "name": "The College Store", "email": "thecollegehubqa1@outlook.com" };
    sendSmtpEmail.to = [{ "email": notification.emailTo, "name": notification.userName }];

    try {
      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent successfully. Returned data: ' + JSON.stringify(response.body));
      return response;
    } catch (error) {
      console.error('Error sending notification: ' + error.message);
      if (error.response) {
        console.error('Status code: ' + error.response.status);
        console.error('Response data: ' + JSON.stringify(error.response.data));
      }
      throw new Error('Error sending notification');
    }
  }
}

export default NotificationService;
