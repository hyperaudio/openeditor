import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

type ProjectGroupMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ProjectMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type FolderMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type TranscriptMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EagerProjectGroup = {
  readonly id: string;
  readonly title: string;
  readonly users?: (string | null)[] | null;
  readonly status: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyProjectGroup = {
  readonly id: string;
  readonly title: string;
  readonly users?: (string | null)[] | null;
  readonly status: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ProjectGroup = LazyLoading extends LazyLoadingDisabled ? EagerProjectGroup : LazyProjectGroup

export declare const ProjectGroup: (new (init: ModelInit<ProjectGroup, ProjectGroupMetaData>) => ProjectGroup) & {
  copyOf(source: ProjectGroup, mutator: (draft: MutableModel<ProjectGroup, ProjectGroupMetaData>) => MutableModel<ProjectGroup, ProjectGroupMetaData> | void): ProjectGroup;
}

type EagerProject = {
  readonly id: string;
  readonly parent?: string | null;
  readonly title: string;
  readonly users?: string[] | null;
  readonly status: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyProject = {
  readonly id: string;
  readonly parent?: string | null;
  readonly title: string;
  readonly users?: string[] | null;
  readonly status: string;
  readonly metadata: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Project = LazyLoading extends LazyLoadingDisabled ? EagerProject : LazyProject

export declare const Project: (new (init: ModelInit<Project, ProjectMetaData>) => Project) & {
  copyOf(source: Project, mutator: (draft: MutableModel<Project, ProjectMetaData>) => MutableModel<Project, ProjectMetaData> | void): Project;
}

type EagerFolder = {
  readonly id: string;
  readonly parent?: string | null;
  readonly title: string;
  readonly status: string;
  readonly metadata: string;
  readonly project?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyFolder = {
  readonly id: string;
  readonly parent?: string | null;
  readonly title: string;
  readonly status: string;
  readonly metadata: string;
  readonly project?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Folder = LazyLoading extends LazyLoadingDisabled ? EagerFolder : LazyFolder

export declare const Folder: (new (init: ModelInit<Folder, FolderMetaData>) => Folder) & {
  copyOf(source: Folder, mutator: (draft: MutableModel<Folder, FolderMetaData>) => MutableModel<Folder, FolderMetaData> | void): Folder;
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