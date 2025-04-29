// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-4.5-turbo',
    label: 'GPT 4.5 Turbo',
    apiIdentifier: 'gpt-4.5-turbo',
    description: 'OpenAI’s most advanced language model, suitable for complex reasoning and detailed responses.',
  }
];

// Set default model name used elsewhere in the app
export const DEFAULT_MODEL_NAME = 'gpt-4.5-turbo';
