/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { fetchByPath, validateField } from "./utils";
import { Transcript } from "../models";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import {
  Button,
  Flex,
  Grid,
  TextAreaField,
  TextField,
} from "@aws-amplify/ui-react";
import { DataStore } from "aws-amplify";
export default function TranscriptUpdateForm(props) {
  const {
    id,
    transcript,
    onSuccess,
    onError,
    onSubmit,
    onCancel,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    parent: undefined,
    title: undefined,
    language: undefined,
    media: undefined,
    status: undefined,
    metadata: undefined,
  };
  const [parent, setParent] = React.useState(initialValues.parent);
  const [title, setTitle] = React.useState(initialValues.title);
  const [language, setLanguage] = React.useState(initialValues.language);
  const [media, setMedia] = React.useState(
    initialValues.media ? JSON.stringify(initialValues.media) : undefined
  );
  const [status, setStatus] = React.useState(
    initialValues.status ? JSON.stringify(initialValues.status) : undefined
  );
  const [metadata, setMetadata] = React.useState(
    initialValues.metadata ? JSON.stringify(initialValues.metadata) : undefined
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = { ...initialValues, ...transcriptRecord };
    setParent(cleanValues.parent);
    setTitle(cleanValues.title);
    setLanguage(cleanValues.language);
    setMedia(cleanValues.media);
    setStatus(cleanValues.status);
    setMetadata(cleanValues.metadata);
    setErrors({});
  };
  const [transcriptRecord, setTranscriptRecord] = React.useState(transcript);
  React.useEffect(() => {
    const queryData = async () => {
      const record = id ? await DataStore.query(Transcript, id) : transcript;
      setTranscriptRecord(record);
    };
    queryData();
  }, [id, transcript]);
  React.useEffect(resetStateValues, [transcriptRecord]);
  const validations = {
    parent: [],
    title: [{ type: "Required" }],
    language: [{ type: "Required" }],
    media: [{ type: "Required" }, { type: "JSON" }],
    status: [{ type: "Required" }, { type: "JSON" }],
    metadata: [{ type: "Required" }, { type: "JSON" }],
  };
  const runValidationTasks = async (fieldName, value) => {
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          parent,
          title,
          language,
          media,
          status,
          metadata,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          await DataStore.save(
            Transcript.copyOf(transcriptRecord, (updated) => {
              Object.assign(updated, modelFields);
            })
          );
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...rest}
      {...getOverrideProps(overrides, "TranscriptUpdateForm")}
    >
      <TextField
        label="Parent"
        isRequired={false}
        isReadOnly={false}
        defaultValue={parent}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              parent: value,
              title,
              language,
              media,
              status,
              metadata,
            };
            const result = onChange(modelFields);
            value = result?.parent ?? value;
          }
          if (errors.parent?.hasError) {
            runValidationTasks("parent", value);
          }
          setParent(value);
        }}
        onBlur={() => runValidationTasks("parent", parent)}
        errorMessage={errors.parent?.errorMessage}
        hasError={errors.parent?.hasError}
        {...getOverrideProps(overrides, "parent")}
      ></TextField>
      <TextField
        label="Title"
        isRequired={true}
        isReadOnly={false}
        defaultValue={title}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              parent,
              title: value,
              language,
              media,
              status,
              metadata,
            };
            const result = onChange(modelFields);
            value = result?.title ?? value;
          }
          if (errors.title?.hasError) {
            runValidationTasks("title", value);
          }
          setTitle(value);
        }}
        onBlur={() => runValidationTasks("title", title)}
        errorMessage={errors.title?.errorMessage}
        hasError={errors.title?.hasError}
        {...getOverrideProps(overrides, "title")}
      ></TextField>
      <TextField
        label="Language"
        isRequired={true}
        isReadOnly={false}
        defaultValue={language}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              parent,
              title,
              language: value,
              media,
              status,
              metadata,
            };
            const result = onChange(modelFields);
            value = result?.language ?? value;
          }
          if (errors.language?.hasError) {
            runValidationTasks("language", value);
          }
          setLanguage(value);
        }}
        onBlur={() => runValidationTasks("language", language)}
        errorMessage={errors.language?.errorMessage}
        hasError={errors.language?.hasError}
        {...getOverrideProps(overrides, "language")}
      ></TextField>
      <TextAreaField
        label="Media"
        isRequired={true}
        isReadOnly={false}
        defaultValue={media}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              parent,
              title,
              language,
              media: value,
              status,
              metadata,
            };
            const result = onChange(modelFields);
            value = result?.media ?? value;
          }
          if (errors.media?.hasError) {
            runValidationTasks("media", value);
          }
          setMedia(value);
        }}
        onBlur={() => runValidationTasks("media", media)}
        errorMessage={errors.media?.errorMessage}
        hasError={errors.media?.hasError}
        {...getOverrideProps(overrides, "media")}
      ></TextAreaField>
      <TextAreaField
        label="Status"
        isRequired={true}
        isReadOnly={false}
        defaultValue={status}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              parent,
              title,
              language,
              media,
              status: value,
              metadata,
            };
            const result = onChange(modelFields);
            value = result?.status ?? value;
          }
          if (errors.status?.hasError) {
            runValidationTasks("status", value);
          }
          setStatus(value);
        }}
        onBlur={() => runValidationTasks("status", status)}
        errorMessage={errors.status?.errorMessage}
        hasError={errors.status?.hasError}
        {...getOverrideProps(overrides, "status")}
      ></TextAreaField>
      <TextAreaField
        label="Metadata"
        isRequired={true}
        isReadOnly={false}
        defaultValue={metadata}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              parent,
              title,
              language,
              media,
              status,
              metadata: value,
            };
            const result = onChange(modelFields);
            value = result?.metadata ?? value;
          }
          if (errors.metadata?.hasError) {
            runValidationTasks("metadata", value);
          }
          setMetadata(value);
        }}
        onBlur={() => runValidationTasks("metadata", metadata)}
        errorMessage={errors.metadata?.errorMessage}
        hasError={errors.metadata?.hasError}
        {...getOverrideProps(overrides, "metadata")}
      ></TextAreaField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={resetStateValues}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex {...getOverrideProps(overrides, "RightAlignCTASubFlex")}>
          <Button
            children="Cancel"
            type="button"
            onClick={() => {
              onCancel && onCancel();
            }}
            {...getOverrideProps(overrides, "CancelButton")}
          ></Button>
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
