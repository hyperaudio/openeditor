/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateProjectGroupInput = {
  id?: string | null,
  title: string,
  users?: Array< string | null > | null,
  status: string,
  metadata: string,
  _version?: number | null,
};

export type ModelProjectGroupConditionInput = {
  title?: ModelStringInput | null,
  users?: ModelStringInput | null,
  status?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  and?: Array< ModelProjectGroupConditionInput | null > | null,
  or?: Array< ModelProjectGroupConditionInput | null > | null,
  not?: ModelProjectGroupConditionInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ProjectGroup = {
  __typename: "ProjectGroup",
  id: string,
  title: string,
  users?: Array< string | null > | null,
  status: string,
  metadata: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  owner?: string | null,
};

export type UpdateProjectGroupInput = {
  id: string,
  title?: string | null,
  users?: Array< string | null > | null,
  status?: string | null,
  metadata?: string | null,
  _version?: number | null,
};

export type DeleteProjectGroupInput = {
  id: string,
  _version?: number | null,
};

export type CreateProjectInput = {
  id?: string | null,
  parent?: string | null,
  title: string,
  users?: Array< string > | null,
  status: string,
  metadata: string,
  _version?: number | null,
};

export type ModelProjectConditionInput = {
  parent?: ModelStringInput | null,
  title?: ModelStringInput | null,
  users?: ModelStringInput | null,
  status?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  and?: Array< ModelProjectConditionInput | null > | null,
  or?: Array< ModelProjectConditionInput | null > | null,
  not?: ModelProjectConditionInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type Project = {
  __typename: "Project",
  id: string,
  parent?: string | null,
  title: string,
  users?: Array< string > | null,
  status: string,
  metadata: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  owner?: string | null,
};

export type UpdateProjectInput = {
  id: string,
  parent?: string | null,
  title?: string | null,
  users?: Array< string > | null,
  status?: string | null,
  metadata?: string | null,
  _version?: number | null,
};

export type DeleteProjectInput = {
  id: string,
  _version?: number | null,
};

export type CreateFolderInput = {
  id?: string | null,
  parent?: string | null,
  title: string,
  status: string,
  metadata: string,
  project?: string | null,
  _version?: number | null,
};

export type ModelFolderConditionInput = {
  parent?: ModelStringInput | null,
  title?: ModelStringInput | null,
  status?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  project?: ModelStringInput | null,
  and?: Array< ModelFolderConditionInput | null > | null,
  or?: Array< ModelFolderConditionInput | null > | null,
  not?: ModelFolderConditionInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type Folder = {
  __typename: "Folder",
  id: string,
  parent?: string | null,
  title: string,
  status: string,
  metadata: string,
  project?: string | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  owner?: string | null,
};

export type UpdateFolderInput = {
  id: string,
  parent?: string | null,
  title?: string | null,
  status?: string | null,
  metadata?: string | null,
  project?: string | null,
  _version?: number | null,
};

export type DeleteFolderInput = {
  id: string,
  _version?: number | null,
};

export type CreateTranscriptInput = {
  id?: string | null,
  parent?: string | null,
  title: string,
  language: string,
  media: string,
  status: string,
  metadata: string,
  _version?: number | null,
};

export type ModelTranscriptConditionInput = {
  parent?: ModelStringInput | null,
  title?: ModelStringInput | null,
  language?: ModelStringInput | null,
  media?: ModelStringInput | null,
  status?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  and?: Array< ModelTranscriptConditionInput | null > | null,
  or?: Array< ModelTranscriptConditionInput | null > | null,
  not?: ModelTranscriptConditionInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type Transcript = {
  __typename: "Transcript",
  id: string,
  parent?: string | null,
  title: string,
  language: string,
  media: string,
  status: string,
  metadata: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  owner?: string | null,
};

export type UpdateTranscriptInput = {
  id: string,
  parent?: string | null,
  title?: string | null,
  language?: string | null,
  media?: string | null,
  status?: string | null,
  metadata?: string | null,
  _version?: number | null,
};

export type DeleteTranscriptInput = {
  id: string,
  _version?: number | null,
};

export type CreateUserInput = {
  id?: string | null,
  identityId: string,
  cognitoUsername: string,
  email: string,
  name: string,
  metadata: string,
  _version?: number | null,
};

export type ModelUserConditionInput = {
  identityId?: ModelStringInput | null,
  cognitoUsername?: ModelStringInput | null,
  email?: ModelStringInput | null,
  name?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type User = {
  __typename: "User",
  id: string,
  identityId: string,
  cognitoUsername: string,
  email: string,
  name: string,
  metadata: string,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
  owner?: string | null,
};

export type UpdateUserInput = {
  id: string,
  identityId?: string | null,
  cognitoUsername?: string | null,
  email?: string | null,
  name?: string | null,
  metadata?: string | null,
  _version?: number | null,
};

export type DeleteUserInput = {
  id: string,
  _version?: number | null,
};

export type ModelProjectGroupFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  users?: ModelStringInput | null,
  status?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  and?: Array< ModelProjectGroupFilterInput | null > | null,
  or?: Array< ModelProjectGroupFilterInput | null > | null,
  not?: ModelProjectGroupFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelProjectGroupConnection = {
  __typename: "ModelProjectGroupConnection",
  items:  Array<ProjectGroup | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelProjectFilterInput = {
  id?: ModelIDInput | null,
  parent?: ModelStringInput | null,
  title?: ModelStringInput | null,
  users?: ModelStringInput | null,
  status?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  and?: Array< ModelProjectFilterInput | null > | null,
  or?: Array< ModelProjectFilterInput | null > | null,
  not?: ModelProjectFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelProjectConnection = {
  __typename: "ModelProjectConnection",
  items:  Array<Project | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelFolderFilterInput = {
  id?: ModelIDInput | null,
  parent?: ModelStringInput | null,
  title?: ModelStringInput | null,
  status?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  project?: ModelStringInput | null,
  and?: Array< ModelFolderFilterInput | null > | null,
  or?: Array< ModelFolderFilterInput | null > | null,
  not?: ModelFolderFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelFolderConnection = {
  __typename: "ModelFolderConnection",
  items:  Array<Folder | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelTranscriptFilterInput = {
  id?: ModelIDInput | null,
  parent?: ModelStringInput | null,
  title?: ModelStringInput | null,
  language?: ModelStringInput | null,
  media?: ModelStringInput | null,
  status?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  and?: Array< ModelTranscriptFilterInput | null > | null,
  or?: Array< ModelTranscriptFilterInput | null > | null,
  not?: ModelTranscriptFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelTranscriptConnection = {
  __typename: "ModelTranscriptConnection",
  items:  Array<Transcript | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelUserFilterInput = {
  id?: ModelIDInput | null,
  identityId?: ModelStringInput | null,
  cognitoUsername?: ModelStringInput | null,
  email?: ModelStringInput | null,
  name?: ModelStringInput | null,
  metadata?: ModelStringInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items:  Array<User | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelSubscriptionProjectGroupFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  users?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  metadata?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionProjectGroupFilterInput | null > | null,
  or?: Array< ModelSubscriptionProjectGroupFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionProjectFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  parent?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  users?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  metadata?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionProjectFilterInput | null > | null,
  or?: Array< ModelSubscriptionProjectFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelSubscriptionFolderFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  parent?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  metadata?: ModelSubscriptionStringInput | null,
  project?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionFolderFilterInput | null > | null,
  or?: Array< ModelSubscriptionFolderFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelSubscriptionTranscriptFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  parent?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  language?: ModelSubscriptionStringInput | null,
  media?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  metadata?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTranscriptFilterInput | null > | null,
  or?: Array< ModelSubscriptionTranscriptFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelSubscriptionUserFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  identityId?: ModelSubscriptionStringInput | null,
  cognitoUsername?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  name?: ModelSubscriptionStringInput | null,
  metadata?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
};

export type CreateProjectGroupMutationVariables = {
  input: CreateProjectGroupInput,
  condition?: ModelProjectGroupConditionInput | null,
};

export type CreateProjectGroupMutation = {
  createProjectGroup?:  {
    __typename: "ProjectGroup",
    id: string,
    title: string,
    users?: Array< string | null > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type UpdateProjectGroupMutationVariables = {
  input: UpdateProjectGroupInput,
  condition?: ModelProjectGroupConditionInput | null,
};

export type UpdateProjectGroupMutation = {
  updateProjectGroup?:  {
    __typename: "ProjectGroup",
    id: string,
    title: string,
    users?: Array< string | null > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type DeleteProjectGroupMutationVariables = {
  input: DeleteProjectGroupInput,
  condition?: ModelProjectGroupConditionInput | null,
};

export type DeleteProjectGroupMutation = {
  deleteProjectGroup?:  {
    __typename: "ProjectGroup",
    id: string,
    title: string,
    users?: Array< string | null > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type CreateProjectMutationVariables = {
  input: CreateProjectInput,
  condition?: ModelProjectConditionInput | null,
};

export type CreateProjectMutation = {
  createProject?:  {
    __typename: "Project",
    id: string,
    parent?: string | null,
    title: string,
    users?: Array< string > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type UpdateProjectMutationVariables = {
  input: UpdateProjectInput,
  condition?: ModelProjectConditionInput | null,
};

export type UpdateProjectMutation = {
  updateProject?:  {
    __typename: "Project",
    id: string,
    parent?: string | null,
    title: string,
    users?: Array< string > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type DeleteProjectMutationVariables = {
  input: DeleteProjectInput,
  condition?: ModelProjectConditionInput | null,
};

export type DeleteProjectMutation = {
  deleteProject?:  {
    __typename: "Project",
    id: string,
    parent?: string | null,
    title: string,
    users?: Array< string > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type CreateFolderMutationVariables = {
  input: CreateFolderInput,
  condition?: ModelFolderConditionInput | null,
};

export type CreateFolderMutation = {
  createFolder?:  {
    __typename: "Folder",
    id: string,
    parent?: string | null,
    title: string,
    status: string,
    metadata: string,
    project?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type UpdateFolderMutationVariables = {
  input: UpdateFolderInput,
  condition?: ModelFolderConditionInput | null,
};

export type UpdateFolderMutation = {
  updateFolder?:  {
    __typename: "Folder",
    id: string,
    parent?: string | null,
    title: string,
    status: string,
    metadata: string,
    project?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type DeleteFolderMutationVariables = {
  input: DeleteFolderInput,
  condition?: ModelFolderConditionInput | null,
};

export type DeleteFolderMutation = {
  deleteFolder?:  {
    __typename: "Folder",
    id: string,
    parent?: string | null,
    title: string,
    status: string,
    metadata: string,
    project?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type CreateTranscriptMutationVariables = {
  input: CreateTranscriptInput,
  condition?: ModelTranscriptConditionInput | null,
};

export type CreateTranscriptMutation = {
  createTranscript?:  {
    __typename: "Transcript",
    id: string,
    parent?: string | null,
    title: string,
    language: string,
    media: string,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type UpdateTranscriptMutationVariables = {
  input: UpdateTranscriptInput,
  condition?: ModelTranscriptConditionInput | null,
};

export type UpdateTranscriptMutation = {
  updateTranscript?:  {
    __typename: "Transcript",
    id: string,
    parent?: string | null,
    title: string,
    language: string,
    media: string,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type DeleteTranscriptMutationVariables = {
  input: DeleteTranscriptInput,
  condition?: ModelTranscriptConditionInput | null,
};

export type DeleteTranscriptMutation = {
  deleteTranscript?:  {
    __typename: "Transcript",
    id: string,
    parent?: string | null,
    title: string,
    language: string,
    media: string,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type CreateUserMutationVariables = {
  input: CreateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type CreateUserMutation = {
  createUser?:  {
    __typename: "User",
    id: string,
    identityId: string,
    cognitoUsername: string,
    email: string,
    name: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type UpdateUserMutationVariables = {
  input: UpdateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type UpdateUserMutation = {
  updateUser?:  {
    __typename: "User",
    id: string,
    identityId: string,
    cognitoUsername: string,
    email: string,
    name: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type DeleteUserMutationVariables = {
  input: DeleteUserInput,
  condition?: ModelUserConditionInput | null,
};

export type DeleteUserMutation = {
  deleteUser?:  {
    __typename: "User",
    id: string,
    identityId: string,
    cognitoUsername: string,
    email: string,
    name: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type GetProjectGroupQueryVariables = {
  id: string,
};

export type GetProjectGroupQuery = {
  getProjectGroup?:  {
    __typename: "ProjectGroup",
    id: string,
    title: string,
    users?: Array< string | null > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type ListProjectGroupsQueryVariables = {
  filter?: ModelProjectGroupFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListProjectGroupsQuery = {
  listProjectGroups?:  {
    __typename: "ModelProjectGroupConnection",
    items:  Array< {
      __typename: "ProjectGroup",
      id: string,
      title: string,
      users?: Array< string | null > | null,
      status: string,
      metadata: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncProjectGroupsQueryVariables = {
  filter?: ModelProjectGroupFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncProjectGroupsQuery = {
  syncProjectGroups?:  {
    __typename: "ModelProjectGroupConnection",
    items:  Array< {
      __typename: "ProjectGroup",
      id: string,
      title: string,
      users?: Array< string | null > | null,
      status: string,
      metadata: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetProjectQueryVariables = {
  id: string,
};

export type GetProjectQuery = {
  getProject?:  {
    __typename: "Project",
    id: string,
    parent?: string | null,
    title: string,
    users?: Array< string > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type ListProjectsQueryVariables = {
  filter?: ModelProjectFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListProjectsQuery = {
  listProjects?:  {
    __typename: "ModelProjectConnection",
    items:  Array< {
      __typename: "Project",
      id: string,
      parent?: string | null,
      title: string,
      users?: Array< string > | null,
      status: string,
      metadata: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncProjectsQueryVariables = {
  filter?: ModelProjectFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncProjectsQuery = {
  syncProjects?:  {
    __typename: "ModelProjectConnection",
    items:  Array< {
      __typename: "Project",
      id: string,
      parent?: string | null,
      title: string,
      users?: Array< string > | null,
      status: string,
      metadata: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetFolderQueryVariables = {
  id: string,
};

export type GetFolderQuery = {
  getFolder?:  {
    __typename: "Folder",
    id: string,
    parent?: string | null,
    title: string,
    status: string,
    metadata: string,
    project?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type ListFoldersQueryVariables = {
  filter?: ModelFolderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListFoldersQuery = {
  listFolders?:  {
    __typename: "ModelFolderConnection",
    items:  Array< {
      __typename: "Folder",
      id: string,
      parent?: string | null,
      title: string,
      status: string,
      metadata: string,
      project?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncFoldersQueryVariables = {
  filter?: ModelFolderFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncFoldersQuery = {
  syncFolders?:  {
    __typename: "ModelFolderConnection",
    items:  Array< {
      __typename: "Folder",
      id: string,
      parent?: string | null,
      title: string,
      status: string,
      metadata: string,
      project?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetTranscriptQueryVariables = {
  id: string,
};

export type GetTranscriptQuery = {
  getTranscript?:  {
    __typename: "Transcript",
    id: string,
    parent?: string | null,
    title: string,
    language: string,
    media: string,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type ListTranscriptsQueryVariables = {
  filter?: ModelTranscriptFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTranscriptsQuery = {
  listTranscripts?:  {
    __typename: "ModelTranscriptConnection",
    items:  Array< {
      __typename: "Transcript",
      id: string,
      parent?: string | null,
      title: string,
      language: string,
      media: string,
      status: string,
      metadata: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncTranscriptsQueryVariables = {
  filter?: ModelTranscriptFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncTranscriptsQuery = {
  syncTranscripts?:  {
    __typename: "ModelTranscriptConnection",
    items:  Array< {
      __typename: "Transcript",
      id: string,
      parent?: string | null,
      title: string,
      language: string,
      media: string,
      status: string,
      metadata: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type GetUserQueryVariables = {
  id: string,
};

export type GetUserQuery = {
  getUser?:  {
    __typename: "User",
    id: string,
    identityId: string,
    cognitoUsername: string,
    email: string,
    name: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type ListUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUsersQuery = {
  listUsers?:  {
    __typename: "ModelUserConnection",
    items:  Array< {
      __typename: "User",
      id: string,
      identityId: string,
      cognitoUsername: string,
      email: string,
      name: string,
      metadata: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncUsersQuery = {
  syncUsers?:  {
    __typename: "ModelUserConnection",
    items:  Array< {
      __typename: "User",
      id: string,
      identityId: string,
      cognitoUsername: string,
      email: string,
      name: string,
      metadata: string,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type OnCreateProjectGroupSubscriptionVariables = {
  filter?: ModelSubscriptionProjectGroupFilterInput | null,
  owner?: string | null,
};

export type OnCreateProjectGroupSubscription = {
  onCreateProjectGroup?:  {
    __typename: "ProjectGroup",
    id: string,
    title: string,
    users?: Array< string | null > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnUpdateProjectGroupSubscriptionVariables = {
  filter?: ModelSubscriptionProjectGroupFilterInput | null,
  owner?: string | null,
};

export type OnUpdateProjectGroupSubscription = {
  onUpdateProjectGroup?:  {
    __typename: "ProjectGroup",
    id: string,
    title: string,
    users?: Array< string | null > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnDeleteProjectGroupSubscriptionVariables = {
  filter?: ModelSubscriptionProjectGroupFilterInput | null,
  owner?: string | null,
};

export type OnDeleteProjectGroupSubscription = {
  onDeleteProjectGroup?:  {
    __typename: "ProjectGroup",
    id: string,
    title: string,
    users?: Array< string | null > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnCreateProjectSubscriptionVariables = {
  filter?: ModelSubscriptionProjectFilterInput | null,
  owner?: string | null,
};

export type OnCreateProjectSubscription = {
  onCreateProject?:  {
    __typename: "Project",
    id: string,
    parent?: string | null,
    title: string,
    users?: Array< string > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnUpdateProjectSubscriptionVariables = {
  filter?: ModelSubscriptionProjectFilterInput | null,
  owner?: string | null,
};

export type OnUpdateProjectSubscription = {
  onUpdateProject?:  {
    __typename: "Project",
    id: string,
    parent?: string | null,
    title: string,
    users?: Array< string > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnDeleteProjectSubscriptionVariables = {
  filter?: ModelSubscriptionProjectFilterInput | null,
  owner?: string | null,
};

export type OnDeleteProjectSubscription = {
  onDeleteProject?:  {
    __typename: "Project",
    id: string,
    parent?: string | null,
    title: string,
    users?: Array< string > | null,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnCreateFolderSubscriptionVariables = {
  filter?: ModelSubscriptionFolderFilterInput | null,
  owner?: string | null,
};

export type OnCreateFolderSubscription = {
  onCreateFolder?:  {
    __typename: "Folder",
    id: string,
    parent?: string | null,
    title: string,
    status: string,
    metadata: string,
    project?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnUpdateFolderSubscriptionVariables = {
  filter?: ModelSubscriptionFolderFilterInput | null,
  owner?: string | null,
};

export type OnUpdateFolderSubscription = {
  onUpdateFolder?:  {
    __typename: "Folder",
    id: string,
    parent?: string | null,
    title: string,
    status: string,
    metadata: string,
    project?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnDeleteFolderSubscriptionVariables = {
  filter?: ModelSubscriptionFolderFilterInput | null,
  owner?: string | null,
};

export type OnDeleteFolderSubscription = {
  onDeleteFolder?:  {
    __typename: "Folder",
    id: string,
    parent?: string | null,
    title: string,
    status: string,
    metadata: string,
    project?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnCreateTranscriptSubscriptionVariables = {
  filter?: ModelSubscriptionTranscriptFilterInput | null,
  owner?: string | null,
};

export type OnCreateTranscriptSubscription = {
  onCreateTranscript?:  {
    __typename: "Transcript",
    id: string,
    parent?: string | null,
    title: string,
    language: string,
    media: string,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnUpdateTranscriptSubscriptionVariables = {
  filter?: ModelSubscriptionTranscriptFilterInput | null,
  owner?: string | null,
};

export type OnUpdateTranscriptSubscription = {
  onUpdateTranscript?:  {
    __typename: "Transcript",
    id: string,
    parent?: string | null,
    title: string,
    language: string,
    media: string,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnDeleteTranscriptSubscriptionVariables = {
  filter?: ModelSubscriptionTranscriptFilterInput | null,
  owner?: string | null,
};

export type OnDeleteTranscriptSubscription = {
  onDeleteTranscript?:  {
    __typename: "Transcript",
    id: string,
    parent?: string | null,
    title: string,
    language: string,
    media: string,
    status: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnCreateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserSubscription = {
  onCreateUser?:  {
    __typename: "User",
    id: string,
    identityId: string,
    cognitoUsername: string,
    email: string,
    name: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnUpdateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserSubscription = {
  onUpdateUser?:  {
    __typename: "User",
    id: string,
    identityId: string,
    cognitoUsername: string,
    email: string,
    name: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};

export type OnDeleteUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserSubscription = {
  onDeleteUser?:  {
    __typename: "User",
    id: string,
    identityId: string,
    cognitoUsername: string,
    email: string,
    name: string,
    metadata: string,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
    owner?: string | null,
  } | null,
};
