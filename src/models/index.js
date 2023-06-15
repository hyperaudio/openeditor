// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { ProjectGroup, Project, Folder, Transcript, User } = initSchema(schema);

export {
  ProjectGroup,
  Project,
  Folder,
  Transcript,
  User
};