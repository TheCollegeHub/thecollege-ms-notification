import { 
  TransactionalEmailsApi, 
  SendSmtpEmail, 
  TransactionalEmailsApiApiKeys 
} from "@getbrevo/brevo";
import VaultSecrets from "@thecollege/vault-secrets";

class NotificationService {
  async sendNotification(notification) {
    try {
      const vaultSecrets = new VaultSecrets();
      const secretData = await vaultSecrets.getSecretsByName("EMAIL_CLIENT_KEY");
      const apiKey = secretData.secretValue?.trim();

      if (!apiKey) {
        throw new Error("EMAIL_CLIENT_KEY not found or empty in Vault");
      }

      const apiInstance = new TransactionalEmailsApi();
      apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = notification.subject || "(no subject)";
      sendSmtpEmail.htmlContent = notification.content || "<p>No content</p>";
      sendSmtpEmail.sender = {
        name: "The College Store",
        email: "thecollegehubqa1@outlook.com",
      };
      sendSmtpEmail.to = [
        {
          email: notification.emailTo,
          name: notification.userName || "User",
        },
      ];

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log("Email sent successfully:", {
        messageId: response.body?.messageId,
        to: notification.emailTo,
      });

      return response;
    } catch (error) {
      console.error("Error sending notification:");
      console.error("Message:", error.message);

      if (error.response) {
        console.error("Status code:", error.response.status);
        console.error("Response data:", JSON.stringify(error.response.data, null, 2));
      } else {
        console.error("Full error:", error);
      }

      throw new Error("Error sending notification");
    }
  }
}

export default NotificationService;
