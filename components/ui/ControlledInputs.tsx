/**
 * Controlled wrappers — drop into any react-hook-form form.
 *
 * Usage:
 *   const { control } = useForm({ resolver: yupResolver(registerSchema) });
 *
 *   <ControlledInput
 *     control={control}
 *     name="email"
 *     label="Email"
 *     keyboardType="email-address"
 *   />
 *   <ControlledPhone control={control} name="phone" label="Phone" />
 *   <ControlledDOB   control={control} name="dob"   label="Date of birth" />
 */

import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { TextInputProps, ViewStyle } from 'react-native';
import { DOBInput } from './DOBInput';
import { AppInput } from './Input';
import { PhoneInput } from './PhoneInput';

// ─── Generic Text Input ───────────────────────────────────────────────────

interface ControlledInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText' | 'ref'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  ...rest
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <AppInput
          label={label}
          hint={hint}
          error={error?.message}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          onRightIconPress={onRightIconPress}
          containerStyle={containerStyle}
          {...rest}
        />
      )}
    />
  );
}

// ─── Phone Input ──────────────────────────────────────────────────────────

interface ControlledPhoneProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  hint?: string;
  defaultCountryCode?: string;
  containerStyle?: ViewStyle;
}

export function ControlledPhone<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  defaultCountryCode,
  containerStyle,
}: ControlledPhoneProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <PhoneInput
          label={label}
          hint={hint}
          error={error?.message ?? (error as any)?.number?.message}
          value={value}
          onChange={onChange}
          defaultCountryCode={defaultCountryCode}
          containerStyle={containerStyle}
        />
      )}
    />
  );
}

// ─── DOB Input ────────────────────────────────────────────────────────────

interface ControlledDOBProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  hint?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  containerStyle?: ViewStyle;
}

export function ControlledDOB<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  minimumDate,
  maximumDate,
  containerStyle,
}: ControlledDOBProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <DOBInput
          label={label}
          hint={hint}
          error={error?.message}
          value={value ? ((value as any) instanceof Date ? (value as Date) : new Date(value as string)) : undefined}
          onChange={onChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          containerStyle={containerStyle}
        />
      )}
    />
  );
}
