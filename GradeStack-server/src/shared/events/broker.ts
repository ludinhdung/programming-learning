import { EventEmitter } from 'events';

type Listener<T = any> = (message: T) => void;

interface MessageBroker {
  publish<T = any>(topic: string, message: T): void;
  subscribe<T = any>(topic: string, listener: Listener<T>): void;
}

// Create a single instance of EventEmitter
const emitter = new EventEmitter();

function createMessageBroker(): MessageBroker {
  console.log('Creating message broker instance...');

  return {
    publish: <T>(topic: string, message: T) => {
      try {
        console.log(`Publishing message to topic: ${topic}`, message);
        emitter.emit(topic, message);
      } catch (error) {
        console.error(`Error publishing to topic ${topic}:`, error);
      }
    },
    subscribe: <T>(topic: string, listener: Listener<T>) => {
      try {
        console.log(`Subscribing to topic: ${topic}`);
        emitter.on(topic, (message) => {
          try {
            console.log(`Processing message for topic ${topic}:`, message);
            listener(message);
          } catch (error) {
            console.error(`Error in listener for topic ${topic}:`, error);
          }
        });
      } catch (error) {
        console.error(`Error subscribing to topic ${topic}:`, error);
      }
    }
  };
}

// Create a single instance of the broker
const broker = createMessageBroker();

export default broker;
