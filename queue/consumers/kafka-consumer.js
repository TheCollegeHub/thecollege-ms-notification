import { Kafka } from 'kafkajs';
import NotificationService from '../../service/notifcation-service';

const kafka = new Kafka({
  clientId: 'thecollege-app',
  brokers: ['localhost:9092']
});

const admin = kafka.admin();
const topic = 'send-notification';

const createTopicIfNotExists = async (topic) => {
  await admin.connect();
  const topics = await admin.listTopics();
  
  if (!topics.includes(topic)) {
    await admin.createTopics({
      topics: [{ topic, numPartitions: 1 }],
    });
    console.log(`Topic "${topic}" created with success.`);
  } else {
    console.log(`Topic "${topic}" already exists.`);
  }

  await admin.disconnect();
};

const runConsumer = async () => {
  await createTopicIfNotExists(topic);

  const consumer = kafka.consumer({ groupId: 'thecollege-notification-group' });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  const notificationService = new NotificationService();

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // console.log('Message received:', message.value.toString());
      try {
        const notification = JSON.parse(message.value.toString());

        await notificationService.sendNotification(notification);
        console.log(notification.title);
      } catch (error) {
        console.error('Error to process kafka message:', error);
      }
    },
  });
};

runConsumer().catch(console.error);
