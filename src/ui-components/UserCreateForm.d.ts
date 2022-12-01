/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { GridProps, TextAreaFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type UserCreateFormInputValues = {
    identityId?: string;
    cognitoUsername?: string;
    email?: string;
    name?: string;
    metadata?: string;
};
export declare type UserCreateFormValidationValues = {
    identityId?: ValidationFunction<string>;
    cognitoUsername?: ValidationFunction<string>;
    email?: ValidationFunction<string>;
    name?: ValidationFunction<string>;
    metadata?: ValidationFunction<string>;
};
export declare type FormProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type UserCreateFormOverridesProps = {
    UserCreateFormGrid?: FormProps<GridProps>;
    identityId?: FormProps<TextFieldProps>;
    cognitoUsername?: FormProps<TextFieldProps>;
    email?: FormProps<TextFieldProps>;
    name?: FormProps<TextFieldProps>;
    metadata?: FormProps<TextAreaFieldProps>;
} & EscapeHatchProps;
export declare type UserCreateFormProps = React.PropsWithChildren<{
    overrides?: UserCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: UserCreateFormInputValues) => UserCreateFormInputValues;
    onSuccess?: (fields: UserCreateFormInputValues) => void;
    onError?: (fields: UserCreateFormInputValues, errorMessage: string) => void;
    onCancel?: () => void;
    onChange?: (fields: UserCreateFormInputValues) => UserCreateFormInputValues;
    onValidate?: UserCreateFormValidationValues;
}>;
export default function UserCreateForm(props: UserCreateFormProps): React.ReactElement;
