// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Folder, Transcript, User } = initSchema(schema);

export {
  Folder,
  Transcript,
  User
};