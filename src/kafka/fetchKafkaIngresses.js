const getIngressData = require('../data/lookup-function')
const logger = require('../utils/logger');

module.exports = function (ingresses, kafkaMessage) {

  let newIngresses = []

  logger.info("             ")
  logger.info(kafkaMessage.object.metadata.name)
  logger.info(kafkaMessage)
  logger.info("             ")

  const data = {
    app: kafkaMessage.object.metadata.name,
    team: kafkaMessage.object.metadata.labels.team,
    namespace: kafkaMessage.object.metadata.namespace,
    version: kafkaMessage.object.spec.image.split(':').pop(),
    context: kafkaMessage.cluster,
    creationTimestamp: kafkaMessage.object.metadata.creationTimestamp
  }

  if (kafkaMessage.object.spec.ingresses) {
    kafkaMessage.object.spec.ingresses.forEach(ingressRaw => {
      const ingress = ingressRaw.replace(/\/$/, '');
      newIngresses.push({ ...data, ingress })
    });
  }

  newIngresses.forEach((newIngress) => {
    const ingressData = getIngressData(newIngress.ingress, ingresses);
    if(ingressData) {
      if(ingressData.creationTimestamp < newIngress.creationTimestamp){
        ingresses.set(newIngress.ingress, newIngress)
      }
    } else {
      ingresses.set(newIngress.ingress, newIngress)
    }
  })
}