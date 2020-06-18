const amqp = require('amqplib');
const RABBIT_CONN_STRING = `amqp://${process.env.RABBIT_USERNAME}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`;
const mq = {
  connect: (queue) => new Promise((resolve, reject) => {
    amqp.connect(RABBIT_CONN_STRING)
      .then((conn) => {
        process.once('SIGINT', conn.close.bind(conn));
        conn.createChannel().then((channel) => {
          channel.assertQueue(queue, { durable: true })
            .then(() => {
              resolve({ channel, conn });
            }).catch(reject);
        }).catch(reject);
      }).catch(reject);
  }),
  emit: (queue, message) => new Promise((resolve, reject) => {
    mq.connect(queue).then(({ channel, conn }) => {

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { deliveryMode: true })

      setTimeout(() => {
        resolve(true);
        channel.close();
        conn.close();
      }, 500)

    }).catch(reject);
  }),
  on: (queue, callback, ack) => {
    mq.connect(queue).then(({ channel }) => {
      channel.prefetch(1);
      channel.consume(queue, callback.bind(this, channel), { noAck: !!ack });
    });
  }
}

module.exports = mq;

