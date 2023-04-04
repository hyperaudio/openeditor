// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Project, Folder, Transcript, User } = initSchema(schema);

export {
  Project,
  Folder,
  Transcript,
  User
};