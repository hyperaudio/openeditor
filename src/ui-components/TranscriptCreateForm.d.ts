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
export declare type TranscriptCreateFormInputValues = {
    parent?: string;
    title?: string;
    language?: string;
    media?: string;
    status?: string;
    metadata?: string;
};
export declare type TranscriptCreateFormValidationValues = {
    parent?: ValidationFunction<string>;
    title?: ValidationFunction<string>;
    language?: ValidationFunction<string>;
    media?: ValidationFunction<string>;
    status?: ValidationFunction<string>;
    metadata?: ValidationFunction<string>;
};
export declare type FormProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type TranscriptCreateFormOverridesProps = {
    TranscriptCreateFormGrid?: FormProps<GridProps>;
    parent?: FormProps<TextFieldProps>;
    title?: FormProps<TextFieldProps>;
    language?: FormProps<TextFieldProps>;
    media?: FormProps<TextAreaFieldProps>;
    status?: FormProps<TextAreaFieldProps>;
    metadata?: FormProps<TextAreaFieldProps>;
} & EscapeHatchProps;
export declare type TranscriptCreateFormProps = React.PropsWithChildren<{
    overrides?: TranscriptCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: TranscriptCreateFormInputValues) => TranscriptCreateFormInputValues;
    onSuccess?: (fields: TranscriptCreateFormInputValues) => void;
    onError?: (fields: TranscriptCreateFormInputValues, errorMessage: string) => void;
    onCancel?: () => void;
    onChange?: (fields: TranscriptCreateFormInputValues) => TranscriptCreateFormInputValues;
    onValidate?: TranscriptCreateFormValidationValues;
}>;
export default function TranscriptCreateForm(props: TranscriptCreateFormProps): React.ReactElement;
