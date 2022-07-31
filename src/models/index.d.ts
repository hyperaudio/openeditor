import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type TranscriptMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Transcript {
  readonly id: string;
  readonly parent?: string | null;
  readonly title: string;
  readonly language: string;
  readonly media: string;
  readonly status: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Transcript, TranscriptMetaData>);
  static copyOf(source: Transcript, mutator: (draft: MutableModel<Transcript, TranscriptMetaData>) => MutableModel<Transcript, TranscriptMetaData> | void): Transcript;
}

export declare class User {
  readonly id: string;
  readonly identityId: string;
  readonly cognitoUsername: string;
  readonly email: string;
  readonly name: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}