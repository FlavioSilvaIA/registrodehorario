/**
 * FormField - Label + Input + Error/Helper
 * GX2-ENH-003
 */
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  children?: React.ReactNode;
  labelStyle?: React.CSSProperties;
}

export function FormFieldLabel({ label, htmlFor, error, helper, children, labelStyle }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 'var(--spacing-4)' }}>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'block',
          marginBottom: 'var(--spacing-1)',
          fontSize: 12,
          color: 'var(--gx2-texto-secundario)',
          fontWeight: 500,
          ...labelStyle,
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p style={{ marginTop: 'var(--spacing-1)', color: 'var(--gx2-danger)', fontSize: 12 }}>{error}</p>
      )}
      {helper && !error && (
        <p style={{ marginTop: 'var(--spacing-1)', color: 'var(--gx2-texto-secundario)', fontSize: 12 }}>{helper}</p>
      )}
    </div>
  );
}

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--gx2-cinza-300)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14,
  fontFamily: 'inherit',
};

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
  id?: string;
}

export function FormInput({ label, error, helper, id, style, ...props }: FormInputProps) {
  const inputId = id || props.name || `input-${Math.random().toString(36).slice(2)}`;
  return (
    <FormFieldLabel label={label} htmlFor={inputId} error={error} helper={helper}>
      <input
        id={inputId}
        style={{
          ...inputBaseStyle,
          borderColor: error ? 'var(--gx2-danger)' : undefined,
          ...style,
        }}
        {...props}
      />
    </FormFieldLabel>
  );
}

const selectBaseStyle: React.CSSProperties = { ...inputBaseStyle, minHeight: 36 };

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helper?: string;
  id?: string;
}

export function FormSelect({ label, error, helper, id, style, children, ...props }: FormSelectProps) {
  const selectId = id || props.name || `select-${Math.random().toString(36).slice(2)}`;
  return (
    <FormFieldLabel label={label} htmlFor={selectId} error={error} helper={helper}>
      <select
        id={selectId}
        style={{
          ...selectBaseStyle,
          borderColor: error ? 'var(--gx2-danger)' : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
    </FormFieldLabel>
  );
}

const textareaBaseStyle: React.CSSProperties = { ...inputBaseStyle, minHeight: 80, resize: 'vertical' };

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helper?: string;
  id?: string;
}

export function FormTextarea({ label, error, helper, id, style, ...props }: FormTextareaProps) {
  const textareaId = id || props.name || `textarea-${Math.random().toString(36).slice(2)}`;
  return (
    <FormFieldLabel label={label} htmlFor={textareaId} error={error} helper={helper}>
      <textarea
        id={textareaId}
        style={{
          ...textareaBaseStyle,
          borderColor: error ? 'var(--gx2-danger)' : undefined,
          ...style,
        }}
        {...props}
      />
    </FormFieldLabel>
  );
}
