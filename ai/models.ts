export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-4.5-turbo',
    label: 'GPT-4.5 Turbo',
    apiIdentifier: 'gpt-4-turbo', // OpenAI's expected model identifier
    description: 'OpenAI’s most advanced model for reasoning and detailed responses.',
  }
];

export const DEFAULT_MODEL_NAME = 'gpt-4.5-turbo';
