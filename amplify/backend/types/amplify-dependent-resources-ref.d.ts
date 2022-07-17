export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "OpenEditor": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        },
        "userPoolGroups": {
            "AdminsGroupRole": "string",
            "EditorsGroupRole": "string"
        }
    },
    "storage": {
        "s3openeditorstorage0387b458": {
            "BucketName": "string",
            "Region": "string"
        }
    },
    "predictions": {
        "transcription": {
            "region": "string",
            "language": "string"
        },
        "translateText": {
            "region": "string",
            "sourceLang": "string",
            "targetLang": "string"
        }
    }
}