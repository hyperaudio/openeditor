// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Transcript, User } = initSchema(schema);

export {
  Transcript,
  User
};