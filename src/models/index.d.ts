import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

type TranscriptMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EagerTranscript = {
  readonly id: string;
  readonly parent?: string | null;
  readonly title: string;
  readonly language: string;
  readonly media: string;
  readonly status: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyTranscript = {
  readonly id: string;
  readonly parent?: string | null;
  readonly title: string;
  readonly language: string;
  readonly media: string;
  readonly status: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Transcript = LazyLoading extends LazyLoadingDisabled ? EagerTranscript : LazyTranscript

export declare const Transcript: (new (init: ModelInit<Transcript, TranscriptMetaData>) => Transcript) & {
  copyOf(source: Transcript, mutator: (draft: MutableModel<Transcript, TranscriptMetaData>) => MutableModel<Transcript, TranscriptMetaData> | void): Transcript;
}

type EagerUser = {
  readonly id: string;
  readonly identityId: string;
  readonly cognitoUsername: string;
  readonly email: string;
  readonly name: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUser = {
  readonly id: string;
  readonly identityId: string;
  readonly cognitoUsername: string;
  readonly email: string;
  readonly name: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User, UserMetaData>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}