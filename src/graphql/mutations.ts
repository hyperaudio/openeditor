/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createProjectGroup = /* GraphQL */ `
  mutation CreateProjectGroup(
    $input: CreateProjectGroupInput!
    $condition: ModelProjectGroupConditionInput
  ) {
    createProjectGroup(input: $input, condition: $condition) {
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
export const updateProjectGroup = /* GraphQL */ `
  mutation UpdateProjectGroup(
    $input: UpdateProjectGroupInput!
    $condition: ModelProjectGroupConditionInput
  ) {
    updateProjectGroup(input: $input, condition: $condition) {
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
export const deleteProjectGroup = /* GraphQL */ `
  mutation DeleteProjectGroup(
    $input: DeleteProjectGroupInput!
    $condition: ModelProjectGroupConditionInput
  ) {
    deleteProjectGroup(input: $input, condition: $condition) {
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
export const createProject = /* GraphQL */ `
  mutation CreateProject(
    $input: CreateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    createProject(input: $input, condition: $condition) {
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
export const updateProject = /* GraphQL */ `
  mutation UpdateProject(
    $input: UpdateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    updateProject(input: $input, condition: $condition) {
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
export const deleteProject = /* GraphQL */ `
  mutation DeleteProject(
    $input: DeleteProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    deleteProject(input: $input, condition: $condition) {
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
export const createFolder = /* GraphQL */ `
  mutation CreateFolder(
    $input: CreateFolderInput!
    $condition: ModelFolderConditionInput
  ) {
    createFolder(input: $input, condition: $condition) {
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
export const updateFolder = /* GraphQL */ `
  mutation UpdateFolder(
    $input: UpdateFolderInput!
    $condition: ModelFolderConditionInput
  ) {
    updateFolder(input: $input, condition: $condition) {
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
export const deleteFolder = /* GraphQL */ `
  mutation DeleteFolder(
    $input: DeleteFolderInput!
    $condition: ModelFolderConditionInput
  ) {
    deleteFolder(input: $input, condition: $condition) {
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
export const createTranscript = /* GraphQL */ `
  mutation CreateTranscript(
    $input: CreateTranscriptInput!
    $condition: ModelTranscriptConditionInput
  ) {
    createTranscript(input: $input, condition: $condition) {
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
export const updateTranscript = /* GraphQL */ `
  mutation UpdateTranscript(
    $input: UpdateTranscriptInput!
    $condition: ModelTranscriptConditionInput
  ) {
    updateTranscript(input: $input, condition: $condition) {
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
export const deleteTranscript = /* GraphQL */ `
  mutation DeleteTranscript(
    $input: DeleteTranscriptInput!
    $condition: ModelTranscriptConditionInput
  ) {
    deleteTranscript(input: $input, condition: $condition) {
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
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
