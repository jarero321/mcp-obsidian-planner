import { z } from 'zod';

export function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodType;
      properties[key] = zodFieldToJsonSchema(zodValue);

      // Check if field is required (not optional)
      if (!(zodValue instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    const result: Record<string, unknown> = {
      type: 'object',
      properties,
    };

    if (required.length > 0) {
      result.required = required;
    }

    return result;
  }

  return { type: 'object', properties: {} };
}

function zodFieldToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const description = schema.description;
  const base: Record<string, unknown> = {};

  if (description) {
    base.description = description;
  }

  if (schema instanceof z.ZodOptional) {
    return { ...zodFieldToJsonSchema(schema.unwrap()), ...base };
  }

  if (schema instanceof z.ZodString) {
    return { ...base, type: 'string' };
  }

  if (schema instanceof z.ZodNumber) {
    return { ...base, type: 'number' };
  }

  if (schema instanceof z.ZodBoolean) {
    return { ...base, type: 'boolean' };
  }

  if (schema instanceof z.ZodEnum) {
    return { ...base, type: 'string', enum: schema.options };
  }

  if (schema instanceof z.ZodArray) {
    const items = zodFieldToJsonSchema(schema.element);
    return { ...base, type: 'array', items };
  }

  return { ...base, type: 'string' };
}
