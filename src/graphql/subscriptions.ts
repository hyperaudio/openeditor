/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProjectGroup = /* GraphQL */ `
  subscription OnCreateProjectGroup(
    $filter: ModelSubscriptionProjectGroupFilterInput
    $owner: String
  ) {
    onCreateProjectGroup(filter: $filter, owner: $owner) {
      id
      title
      users
      status
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onUpdateProjectGroup = /* GraphQL */ `
  subscription OnUpdateProjectGroup(
    $filter: ModelSubscriptionProjectGroupFilterInput
    $owner: String
  ) {
    onUpdateProjectGroup(filter: $filter, owner: $owner) {
      id
      title
      users
      status
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onDeleteProjectGroup = /* GraphQL */ `
  subscription OnDeleteProjectGroup(
    $filter: ModelSubscriptionProjectGroupFilterInput
    $owner: String
  ) {
    onDeleteProjectGroup(filter: $filter, owner: $owner) {
      id
      title
      users
      status
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onCreateProject = /* GraphQL */ `
  subscription OnCreateProject(
    $filter: ModelSubscriptionProjectFilterInput
    $owner: String
  ) {
    onCreateProject(filter: $filter, owner: $owner) {
      id
      parent
      title
      users
      status
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject(
    $filter: ModelSubscriptionProjectFilterInput
    $owner: String
  ) {
    onUpdateProject(filter: $filter, owner: $owner) {
      id
      parent
      title
      users
      status
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject(
    $filter: ModelSubscriptionProjectFilterInput
    $owner: String
  ) {
    onDeleteProject(filter: $filter, owner: $owner) {
      id
      parent
      title
      users
      status
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onCreateFolder = /* GraphQL */ `
  subscription OnCreateFolder(
    $filter: ModelSubscriptionFolderFilterInput
    $owner: String
  ) {
    onCreateFolder(filter: $filter, owner: $owner) {
      id
      parent
      title
      status
      metadata
      project
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onUpdateFolder = /* GraphQL */ `
  subscription OnUpdateFolder(
    $filter: ModelSubscriptionFolderFilterInput
    $owner: String
  ) {
    onUpdateFolder(filter: $filter, owner: $owner) {
      id
      parent
      title
      status
      metadata
      project
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onDeleteFolder = /* GraphQL */ `
  subscription OnDeleteFolder(
    $filter: ModelSubscriptionFolderFilterInput
    $owner: String
  ) {
    onDeleteFolder(filter: $filter, owner: $owner) {
      id
      parent
      title
      status
      metadata
      project
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onCreateTranscript = /* GraphQL */ `
  subscription OnCreateTranscript(
    $filter: ModelSubscriptionTranscriptFilterInput
    $owner: String
  ) {
    onCreateTranscript(filter: $filter, owner: $owner) {
      id
      parent
      title
      language
      media
      status
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onUpdateTranscript = /* GraphQL */ `
  subscription OnUpdateTranscript(
    $filter: ModelSubscriptionTranscriptFilterInput
    $owner: String
  ) {
    onUpdateTranscript(filter: $filter, owner: $owner) {
      id
      parent
      title
      language
      media
      status
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onDeleteTranscript = /* GraphQL */ `
  subscription OnDeleteTranscript(
    $filter: ModelSubscriptionTranscriptFilterInput
    $owner: String
  ) {
    onDeleteTranscript(filter: $filter, owner: $owner) {
      id
      parent
      title
      language
      media
      status
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onCreateUser(filter: $filter, owner: $owner) {
      id
      identityId
      cognitoUsername
      email
      name
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onUpdateUser(filter: $filter, owner: $owner) {
      id
      identityId
      cognitoUsername
      email
      name
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onDeleteUser(filter: $filter, owner: $owner) {
      id
      identityId
      cognitoUsername
      email
      name
      metadata
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      owner
      __typename
    }
  }
`;
