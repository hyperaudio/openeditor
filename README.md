# OpenEditor

## Installation

Fork this repository, in the terminal run the following commands (be sure you have [nodejs 18](https://nodejs.org/en/download) or [nvm](https://github.com/nvm-sh/nvm), [yarn](https://yarnpkg.com/) and [amplify CLI](https://docs.amplify.aws/cli/start/install/) installed; and AWS credentials or profiles configured)

- `git clone https://github.com/******/openeditor.git` clone your fork

- `cd openeditor`

- `nvm use` or `nvm install` to use/install the project's nodejs version

- `yarn set version 1.22.1` to set yarn on v1

- `yarn` to install dependencies

- `amplify init` to setup a new Amplify project, you need to login in your browser in your AWS account

- `amplify push` to push and build the backend in the cloud

- `yarn start` to start the frontend on [localhost:3000](http://localhost:3000)

- `yarn build` to build the frontend for deployment to a static server as a SPA

Here is an example run of the above:

```sh
git clone https://github.com/******/openeditor.git

Cloning into 'openeditor'...
remote: Enumerating objects: 1160, done.
remote: Counting objects: 100% (56/56), done.
remote: Compressing objects: 100% (42/42), done.
remote: Total 1160 (delta 14), reused 32 (delta 10), pack-reused 1104
Receiving objects: 100% (1160/1160), 23.61 MiB | 529.00 KiB/s, done.
Resolving deltas: 100% (690/690), done.
```

```sh
cd openeditor 
```

```sh
nvm use

Found '.nvmrc' with version <v18>
Now using node v18.16.1 (npm v9.5.1)
```

```sh
yarn set version 1.22.1

➤ YN0000: Retrieving https://github.com/yarnpkg/yarn/releases/download/v1.22.1/yarn-1.22.1.js
➤ YN0000: Saving the new release in .yarn/releases/yarn-1.22.1.cjs
➤ YN0000: Done in 9s 407ms
```

```sh
yarn

yarn install v1.22.1
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
$ yarn patch-package
yarn run v1.22.1
$ node_modules/.bin/patch-package
patch-package 6.5.0
Applying patches...
react-scripts@5.0.1 ✔
✨  Done in 0.55s.
✨  Done in 47.35s.
```

```sh
amplify init

? Enter a name for the environment dev
? Choose your default editor: Visual Studio Code
Using default provider  awscloudformation
? Select the authentication method you want to use: AWS access keys
? accessKeyId:  ********************
? secretAccessKey:  ****************************************
? region:  us-east-2
Adding backend environment dev to AWS Amplify app: d1y31fbse6l612

Deployment completed.
Deploying root stack OpenEditor [ ====================-------------------- ] 2/4
	amplify-openeditor-dev-135313  AWS::CloudFormation::Stack     CREATE_IN_PROGRESS    
	AuthRole                       AWS::IAM::Role                 CREATE_COMPLETE       
	UnauthRole                     AWS::IAM::Role                 CREATE_COMPLETE       
	DeploymentBucket               AWS::S3::Bucket                CREATE_IN_PROGRESS    

Deployment state saved successfully.
⠸ Initializing your environment: dev⚠️ WARNING: owners may reassign ownership for the following model(s) and role(s): ProjectGroup: [owner], Project: [owner], Folder: [owner], Transcript: [owner], User: [owner]. If this is not intentional, you may want to apply field-level authorization rules to these fields. To read more: https://docs.amplify.aws/cli/graphql/authorization-rules/#per-user--owner-based-data-access.
✅ GraphQL schema compiled successfully.

✔ Initialized provider successfully.
✅ Initialized your environment successfully.

Your project has been successfully initialized and connected to the cloud!
```

```sh
amplify push

⠴ Building resource api/OpenEditor⚠️ WARNING: owners may reassign ownership for the following model(s) and role(s): ProjectGroup: [owner], Project: [owner], Folder: [owner], Transcript: [owner], User: [owner]. If this is not intentional, you may want to apply field-level authorization rules to these fields. To read more: https://docs.amplify.aws/cli/graphql/authorization-rules/#per-user--owner-based-data-access.
✅ GraphQL schema compiled successfully.

✔ Successfully pulled backend environment dev from the cloud.
⠼ Building resource api/OpenEditor⚠️ WARNING: owners may reassign ownership for the following model(s) and role(s): ProjectGroup: [owner], Project: [owner], Folder: [owner], Transcript: [owner], User: [owner]. If this is not intentional, you may want to apply field-level authorization rules to these fields. To read more: https://docs.amplify.aws/cli/graphql/authorization-rules/#per-user--owner-based-data-access.
✅ GraphQL schema compiled successfully.


    Current Environment: dev
    
┌─────────────┬────────────────────────┬───────────┬───────────────────┐
│ Category    │ Resource name          │ Operation │ Provider plugin   │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Api         │ AdminQueries           │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Api         │ OpenEditor             │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Api         │ search                 │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Auth        │ OpenEditor             │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Auth        │ userPoolGroups         │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Custom      │ MediaConvertRole       │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Function    │ AdminQueries474e476b   │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Function    │ S3Triggerf5e6b756      │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Function    │ openeditorlayerffprobe │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Function    │ search                 │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Predictions │ transcription          │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Predictions │ translation            │ Create    │ awscloudformation │
├─────────────┼────────────────────────┼───────────┼───────────────────┤
│ Storage     │ s3storage              │ Create    │ awscloudformation │
└─────────────┴────────────────────────┴───────────┴───────────────────┘
✔ Are you sure you want to continue? (Y/n) · yes
⚠️ WARNING: owners may reassign ownership for the following model(s) and role(s): ProjectGroup: [owner], Project: [owner], Folder: [owner], Transcript: [owner], User: [owner]. If this is not intentional, you may want to apply field-level authorization rules to these fields. To read more: https://docs.amplify.aws/cli/graphql/authorization-rules/#per-user--owner-based-data-access.
✅ GraphQL schema compiled successfully.

Suggested configuration for new layer versions:

openeditorlayerffprobe
  - Description: Updated layer version  2023-07-19T10:57:09.950Z

? Accept the suggested layer version configurations? Yes
⠇ Building resource api/OpenEditor⚠️ WARNING: owners may reassign ownership for the following model(s) and role(s): ProjectGroup: [owner], Project: [owner], Folder: [owner], Transcript: [owner], User: [owner]. If this is not intentional, you may want to apply field-level authorization rules to these fields. To read more: https://docs.amplify.aws/cli/graphql/authorization-rules/#per-user--owner-based-data-access.
✅ GraphQL schema compiled successfully.

? Do you want to update code for your updated GraphQL API Yes
? Do you want to generate GraphQL statements (queries, mutations and subscription) based on your schema types?
This will overwrite your current graphql queries, mutations and subscriptions Yes

Deploying resources into dev environment. This will take a few minutes. ⠋
Deployed root stack OpenEditor [ ======================================== ] 14/14
	amplify-openeditor-dev-135313  AWS::CloudFormation::Stack     UPDATE_COMPLETE     
Deployment completed.
Deployed root stack OpenEditor [ ======================================== ] 14/14
	amplify-openeditor-dev-135313  AWS::CloudFormation::Stack     UPDATE_COMPLETE     
	authOpenEditor                 AWS::CloudFormation::Stack     CREATE_COMPLETE     
	predictionstranscription       AWS::CloudFormation::Stack     CREATE_COMPLETE     
	predictionstranslation         AWS::CloudFormation::Stack     CREATE_COMPLETE     
	functionopeneditorlayerffprobe AWS::CloudFormation::Stack     CREATE_COMPLETE     
	functionAdminQueries474e476b   AWS::CloudFormation::Stack     CREATE_COMPLETE     
	authuserPoolGroups             AWS::CloudFormation::Stack     CREATE_COMPLETE     
	apiOpenEditor                  AWS::CloudFormation::Stack     CREATE_COMPLETE     
	apiAdminQueries                AWS::CloudFormation::Stack     CREATE_COMPLETE     
	functionS3Triggerf5e6b756      AWS::CloudFormation::Stack     CREATE_COMPLETE     
	storages3storage               AWS::CloudFormation::Stack     CREATE_COMPLETE     
	functionsearch                 AWS::CloudFormation::Stack     CREATE_COMPLETE     
	customMediaConvertRole         AWS::CloudFormation::Stack     CREATE_COMPLETE    
	apisearch                      AWS::CloudFormation::Stack     CREATE_COMPLETE     
Deployed api AdminQueries [ ======================================== ] 3/3
	AdminQueries                   AWS::ApiGateway::RestApi       CREATE_COMPLETE        
	AdminQueriesAPIGWPolicyForLam… AWS::Lambda::Permission        CREATE_IN_PROGRESS     
Deployed api OpenEditor [ ======================================== ] 13/13
	GraphQLAPI                     AWS::AppSync::GraphQLApi       CREATE_COMPLETE        
	GraphQLAPINONEDS95A13CF0       AWS::AppSync::DataSource       CREATE_COMPLETE        
	DataStore                      AWS::DynamoDB::Table           CREATE_COMPLETE        
	AuthRolePolicy01921FC820       AWS::IAM::ManagedPolicy        CREATE_COMPLETE        
	AmplifyDataStoreIAMRole8DE05A… AWS::IAM::Role                 CREATE_COMPLETE        
	GraphQLAPITransformerSchema3C… AWS::AppSync::GraphQLSchema    CREATE_COMPLETE        
	DynamoDBAccess71ABE5AE         AWS::IAM::Policy               CREATE_IN_PROGRESS     
	ProjectGroup                   AWS::CloudFormation::Stack     CREATE_COMPLETE        
	User                           AWS::CloudFormation::Stack     CREATE_COMPLETE        
	Project                        AWS::CloudFormation::Stack     CREATE_COMPLETE        
	Folder                         AWS::CloudFormation::Stack     CREATE_COMPLETE        
	Transcript                     AWS::CloudFormation::Stack     CREATE_COMPLETE        
	CustomResourcesjson            AWS::CloudFormation::Stack     CREATE_COMPLETE        
Deployed api search [ ======================================== ] 7/7
	search                         AWS::ApiGateway::RestApi       CREATE_COMPLETE        
	AdminsGroupsearchPolicy        AWS::IAM::Policy               CREATE_COMPLETE        
	EditorsGroupsearchPolicy       AWS::IAM::Policy               CREATE_COMPLETE        
	functionsearchPermissionsearch AWS::Lambda::Permission        CREATE_COMPLETE        
Deployed auth OpenEditor [ ======================================== ] 10/10
	UserPool                       AWS::Cognito::UserPool         CREATE_COMPLETE        
	UserPoolClient                 AWS::Cognito::UserPoolClient   CREATE_COMPLETE        
	UserPoolClientWeb              AWS::Cognito::UserPoolClient   CREATE_COMPLETE        
	UserPoolClientRole             AWS::IAM::Role                 CREATE_COMPLETE        
	UserPoolClientLambda           AWS::Lambda::Function          CREATE_COMPLETE        
	UserPoolClientLambdaPolicy     AWS::IAM::Policy               CREATE_COMPLETE        
	UserPoolClientLogPolicy        AWS::IAM::Policy               CREATE_COMPLETE        
	UserPoolClientInputs           Custom::LambdaCallout          CREATE_IN_PROGRESS     
Deployed auth userPoolGroups [ ======================================== ] 8/8
	EditorsGroupRole               AWS::IAM::Role                 CREATE_COMPLETE        
	AdminsGroupRole                AWS::IAM::Role                 CREATE_COMPLETE        
	EditorsGroup                   AWS::Cognito::UserPoolGroup    CREATE_COMPLETE        
	AdminsGroup                    AWS::Cognito::UserPoolGroup    CREATE_COMPLETE        
	RoleMapFunction                AWS::Lambda::Function          CREATE_COMPLETE        
	LambdaCloudWatchPolicy         AWS::IAM::Policy               CREATE_IN_PROGRESS     
	RoleMapFunctionInput           Custom::LambdaCallout          CREATE_COMPLETE        
Deployed custom MediaConvertRole [ ======================================== ] 2/2
	MediaConvertRole031A64A9       AWS::IAM::Role                 CREATE_COMPLETE        
	MediaConvertRoleDefaultPolicy… AWS::IAM::Policy               CREATE_IN_PROGRESS     
Deployed function AdminQueries474e476b [ ======================================== ] 3/3
Deployed function S3Triggerf5e6b756 [ ======================================== ] 5/5
	CustomLambdaExecutionPolicy    AWS::IAM::Policy               CREATE_COMPLETE   
Deployed function openeditorlayerffprobe [ ======================================== ] 2/2
Deployed function search [ ======================================== ] 4/4
	LambdaExecutionRole            AWS::IAM::Role                 CREATE_COMPLETE   
	LambdaFunction                 AWS::Lambda::Function          CREATE_IN_PROGRES 
	lambdaexecutionpolicy          AWS::IAM::Policy               CREATE_COMPLETE   
	AmplifyResourcesPolicy         AWS::IAM::Policy               CREATE_IN_PROGRES 
Deployed predictions transcription [ ======================================== ] 1/1
	PollyPolicy                    AWS::IAM::Policy               CREATE_COMPLETE   
Deployed predictions translation [ ======================================== ] 1/1
	TranslatePolicy                AWS::IAM::Policy               CREATE_COMPLETE   
Deployed storage s3storage [ ======================================== ] 10/10
	TriggerPermissions             AWS::Lambda::Permission        CREATE_COMPLETE   
	S3Bucket                       AWS::S3::Bucket                CREATE_COMPLETE   
	S3TriggerBucketPolicy          AWS::IAM::Policy               CREATE_COMPLETE   
	EditorsGroupPolicy             AWS::IAM::Policy               CREATE_COMPLETE   
	S3AuthPublicPolicy             AWS::IAM::Policy               CREATE_COMPLETE   
	S3AuthReadPolicy               AWS::IAM::Policy               CREATE_COMPLETE   
	S3AuthProtectedPolicy          AWS::IAM::Policy               CREATE_COMPLETE   
	AdminsGroupPolicy              AWS::IAM::Policy               CREATE_COMPLETE   
	S3AuthPrivatePolicy            AWS::IAM::Policy               CREATE_COMPLETE  

✔ Generated GraphQL operations successfully and saved at src/graphql
⚠️ WARNING: owners may reassign ownership for the following model(s) and role(s): ProjectGroup: [owner], Project: [owner], Folder: [owner], Transcript: [owner], User: [owner]. If this is not intentional, you may want to apply field-level authorization rules to these fields. To read more: https://docs.amplify.aws/cli/graphql/authorization-rules/#per-user--owner-based-data-access.
✅ GraphQL schema compiled successfully.

Edit your schema at amplify/backend/api/OpenEditor/schema.graphql or place .graphql files in a directory at amplify/backend/api/OpenEditor/schema
Successfully generated models. Generated models can be found in src
✔ Code generated successfully and saved in file src/API.ts
Deployment state saved successfully.

GraphQL endpoint: https://**********.appsync-api.us-east-2.amazonaws.com/graphql

GraphQL transformer version: 2
REST API endpoint: https://**********.execute-api.us-east-2.amazonaws.com/dev

```

In AWS Amplify on OpenEditor Backend environments, setup Amplify Studio (where you can add extra Amplify Studio admin accounts apart of the current AWS one); in Amplify Studio's User Management add the users that need to access the OpenEditor, assign them to existing groups (optional to Administrators and almost always to Editors)

```sh
yarn start
```

Login on [localhost:3000](http://localhost:3000) with an account created in Amplify Studio.

```sh
yarn build

yarn run v1.22.1
$ REACT_APP_GIT_DESCRIBE=`git describe --tags --always --dirty='-dev'` react-scripts build
Creating an optimized production build...
Compiled with warnings.

File sizes after gzip:

  1.27 MB   build/static/js/main.b39a769b.js
  31.14 kB  build/static/css/main.92bc0ade.css
  1.78 kB   build/static/js/651.69b27d85.chunk.js

The project was built assuming it is hosted at /.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.
You may serve it with a static server:

  yarn global add serve
  serve -s build

Find out more about deployment here:

  https://cra.link/deployment

✨  Done in 162.81s.
```

The files in `build/` can be deployed as a SPA on any static server at the user's choice.