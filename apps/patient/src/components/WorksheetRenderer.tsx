import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, FontSizes, Spacing, Radii } from '@/lib/constants';
import { ScoreSlider } from '@/components/ScoreSlider';

// ── Types ──────────────────────────────────────────────────────────────

export interface YBField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'scale' | 'likert' | 'checkbox' | 'select' | 'date' | 'time' | 'repeating_group';
  required?: boolean;
  options?: string[];
  scale_min?: number;
  scale_max?: number;
  scale_labels?: Record<string, string>;
  placeholder?: string;
  score_values?: number[];
  sub_fields?: YBField[];
}

interface WorksheetRendererProps {
  fields: YBField[];
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
  errors?: Record<string, string>;
}

const FIELDS_PER_STEP = 3;

// ── Scroll Mode (original) ──────────────────────────────────────────────

export function WorksheetRenderer({ fields, values, onChange, errors }: WorksheetRendererProps) {
  return (
    <View>
      {fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={(val) => onChange(field.id, val)}
          error={errors?.[field.id]}
        />
      ))}
    </View>
  );
}

// ── Stepped Wizard Mode ─────────────────────────────────────────────────

interface SteppedWorksheetRendererProps extends WorksheetRendererProps {
  onSubmit: () => void;
  submitLabel?: string;
  xpValue?: number;
}

/** Chunk an array into groups of `size` */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function SteppedWorksheetRenderer({
  fields,
  values,
  onChange,
  errors,
  onSubmit,
  submitLabel = 'Save my responses',
  xpValue,
}: SteppedWorksheetRendererProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const steps = chunk(fields, FIELDS_PER_STEP);
  const totalSteps = steps.length;
  const currentFields = steps[currentStep] ?? [];
  const isLastStep = currentStep === totalSteps - 1;

  // Merge parent errors with local step errors
  const mergedErrors = { ...errors, ...stepErrors };

  function validateCurrentStep(): boolean {
    const newErrors: Record<string, string> = {};
    for (const field of currentFields) {
      if (!field.required) continue;
      const val = values[field.id];
      if (val === undefined || val === null || val === '') {
        newErrors[field.id] = 'This field is required';
      } else if (field.type === 'checkbox' && Array.isArray(val) && val.length === 0) {
        newErrors[field.id] = 'Please select at least one option';
      }
    }
    setStepErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    setStepErrors({});
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function handleBack() {
    setStepErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleStepSubmit() {
    if (!validateCurrentStep()) return;
    onSubmit();
  }

  // Overall progress: how many fields have been answered
  const answeredCount = fields.filter((f) => {
    const v = values[f.id];
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }).length;

  return (
    <View>
      {/* Step indicator */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepLabel}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <Text style={styles.stepProgress}>
          {answeredCount}/{fields.length} answered
        </Text>
      </View>

      {/* Progress dots */}
      <View style={styles.stepDotsRow}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              i < currentStep && styles.stepDotCompleted,
              i === currentStep && styles.stepDotActive,
            ]}
          />
        ))}
      </View>

      {/* Progress bar */}
      <View style={styles.stepProgressBarBg}>
        <View
          style={[
            styles.stepProgressBarFill,
            { width: `${((currentStep + (isLastStep ? 1 : 0)) / totalSteps) * 100}%` },
          ]}
        />
      </View>

      {/* Current step fields */}
      <View style={styles.stepFieldsContainer}>
        {currentFields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={(val) => onChange(field.id, val)}
            error={mergedErrors[field.id]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.stepNavRow}>
        {currentStep > 0 ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.stepNavButton,
              styles.stepNavButtonBack,
              pressed && styles.stepNavButtonBackPressed,
            ]}
            accessibilityLabel="Go to previous step"
          >
            <Text style={styles.stepNavButtonBackText}>Back</Text>
          </Pressable>
        ) : (
          <View />
        )}

        {isLastStep ? (
          <Pressable
            onPress={handleStepSubmit}
            style={({ pressed }) => [
              styles.stepNavButton,
              styles.stepNavButtonNext,
              pressed && styles.stepNavButtonNextPressed,
            ]}
            accessibilityLabel={submitLabel}
          >
            <Text style={styles.stepNavButtonNextText}>{submitLabel}</Text>
            {xpValue != null && xpValue > 0 && (
              <Text style={styles.stepNavXpHint}>+{xpValue} XP</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.stepNavButton,
              styles.stepNavButtonNext,
              pressed && styles.stepNavButtonNextPressed,
            ]}
            accessibilityLabel="Go to next step"
          >
            <Text style={styles.stepNavButtonNextText}>Next</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ── Field Renderer ─────────────────────────────────────────────────────

interface FieldRendererProps {
  field: YBField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

function FieldRenderer({ field, value, onChange, error }: FieldRendererProps) {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        {field.required && <Text style={styles.required}> *</Text>}
      </View>

      {renderFieldInput(field, value, onChange)}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function renderFieldInput(field: YBField, value: any, onChange: (value: any) => void) {
  switch (field.type) {
    case 'text':
      return (
        <TextInput
          style={styles.textInput}
          value={value ?? ''}
          onChangeText={onChange}
          placeholder={field.placeholder ?? 'Type here...'}
          placeholderTextColor={Colors.textTertiary}
        />
      );

    case 'textarea':
      return (
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={value ?? ''}
          onChangeText={onChange}
          placeholder={field.placeholder ?? 'Write your thoughts...'}
          placeholderTextColor={Colors.textTertiary}
          multiline
          textAlignVertical="top"
        />
      );

    case 'number':
      return (
        <TextInput
          style={styles.textInput}
          value={value != null ? String(value) : ''}
          onChangeText={(text) => {
            const num = text === '' ? undefined : Number(text);
            onChange(num);
          }}
          placeholder={field.placeholder ?? '0'}
          placeholderTextColor={Colors.textTertiary}
          keyboardType="numeric"
        />
      );

    case 'scale':
      return (
        <ScoreSlider
          label=""
          value={value ?? field.scale_min ?? 1}
          onChange={onChange}
          min={field.scale_min ?? 1}
          max={field.scale_max ?? 10}
          lowLabel={field.scale_labels?.[String(field.scale_min ?? 0)] ?? undefined}
          highLabel={field.scale_labels?.[String(field.scale_max ?? 10)] ?? undefined}
        />
      );

    case 'likert':
      return <LikertField options={field.options ?? []} value={value} onChange={onChange} />;

    case 'select':
      return <SelectField options={field.options ?? []} value={value} onChange={onChange} />;

    case 'checkbox':
      return <CheckboxField options={field.options ?? []} value={value ?? []} onChange={onChange} />;

    case 'date':
      return (
        <TextInput
          style={styles.textInput}
          value={value ?? ''}
          onChangeText={onChange}
          placeholder={field.placeholder ?? 'DD/MM/YYYY'}
          placeholderTextColor={Colors.textTertiary}
          keyboardType="numeric"
          maxLength={10}
        />
      );

    case 'time':
      return (
        <TextInput
          style={styles.textInput}
          value={value ?? ''}
          onChangeText={onChange}
          placeholder={field.placeholder ?? 'HH:MM'}
          placeholderTextColor={Colors.textTertiary}
          keyboardType="numeric"
          maxLength={5}
        />
      );

    case 'repeating_group':
      return (
        <RepeatingGroupField
          subFields={field.sub_fields ?? []}
          value={value ?? [{}]}
          onChange={onChange}
        />
      );

    default:
      return (
        <Text style={styles.unsupportedText}>
          Unsupported field type: {field.type}
        </Text>
      );
  }
}

// ── Likert (horizontal radio buttons with labels) ──────────────────────

function LikertField({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  return (
    <View style={styles.likertRow}>
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.likertOption,
              isSelected && styles.likertOptionSelected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[
                styles.likertText,
                isSelected && styles.likertTextSelected,
              ]}
              numberOfLines={2}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Select (single-select radio list) ──────────────────────────────────

function SelectField({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  return (
    <View style={styles.optionsList}>
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.optionRow, isSelected && styles.optionRowSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Checkbox (multi-select) ────────────────────────────────────────────

function CheckboxField({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <View style={styles.optionsList}>
      {options.map((option) => {
        const isChecked = value.includes(option);
        return (
          <Pressable
            key={option}
            onPress={() => toggleOption(option)}
            style={[styles.optionRow, isChecked && styles.optionRowSelected]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
          >
            <View style={[styles.checkboxOuter, isChecked && styles.checkboxOuterChecked]}>
              {isChecked && <Text style={styles.checkmark}>{'✓'}</Text>}
            </View>
            <Text style={[styles.optionText, isChecked && styles.optionTextSelected]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Repeating Group ────────────────────────────────────────────────────

function RepeatingGroupField({
  subFields,
  value,
  onChange,
}: {
  subFields: YBField[];
  value: Record<string, any>[];
  onChange: (val: Record<string, any>[]) => void;
}) {
  const addRow = () => {
    onChange([...value, {}]);
  };

  const removeRow = (index: number) => {
    if (value.length <= 1) return;
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  const updateRow = (index: number, fieldId: string, fieldValue: any) => {
    const next = [...value];
    next[index] = { ...next[index], [fieldId]: fieldValue };
    onChange(next);
  };

  return (
    <View>
      {value.map((row, index) => (
        <View key={index} style={styles.repeatingRow}>
          <View style={styles.repeatingRowHeader}>
            <Text style={styles.repeatingRowLabel}>Entry {index + 1}</Text>
            {value.length > 1 && (
              <Pressable
                onPress={() => removeRow(index)}
                style={styles.removeRowButton}
                accessibilityLabel={`Remove entry ${index + 1}`}
              >
                <Text style={styles.removeRowText}>Remove</Text>
              </Pressable>
            )}
          </View>
          {subFields.map((subField) => (
            <FieldRenderer
              key={`${index}-${subField.id}`}
              field={subField}
              value={row[subField.id]}
              onChange={(val) => updateRow(index, subField.id, val)}
            />
          ))}
        </View>
      ))}

      <Pressable onPress={addRow} style={styles.addRowButton} accessibilityLabel="Add another entry">
        <Text style={styles.addRowText}>+ Add another entry</Text>
      </Pressable>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  required: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.error,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },

  // Text inputs
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },

  // Likert
  likertRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  likertOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 56,
    alignItems: 'center',
  },
  likertOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  likertText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  likertTextSelected: {
    color: Colors.textOnPrimary,
  },

  // Select / Checkbox list
  optionsList: {
    gap: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  optionRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },

  // Radio button
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  // Checkbox
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: Radii.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxOuterChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },

  // Repeating group
  repeatingRow: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  repeatingRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  repeatingRowLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  removeRowButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  removeRowText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    fontWeight: '600',
  },
  addRowButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  addRowText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },

  unsupportedText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },

  // ── Stepped wizard styles ───────────────────────────────────────────
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  stepProgress: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stepDotsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceAlt,
  },
  stepDotCompleted: {
    backgroundColor: Colors.primary,
  },
  stepDotActive: {
    backgroundColor: Colors.primaryDark,
  },
  stepProgressBarBg: {
    height: 3,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  stepProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  stepFieldsContainer: {
    minHeight: 120,
  },
  stepNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  stepNavButton: {
    borderRadius: Radii.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  stepNavButtonBack: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNavButtonBackPressed: {
    backgroundColor: Colors.border,
  },
  stepNavButtonBackText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stepNavButtonNext: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  stepNavButtonNextPressed: {
    backgroundColor: Colors.primaryDark,
  },
  stepNavButtonNextText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  stepNavXpHint: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primaryLight,
    marginTop: 2,
  },
});
