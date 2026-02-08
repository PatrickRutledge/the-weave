export interface PerspectiveDefinition {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  questionFocus: string[];
  antiPatterns: string[];
  successPatterns: string[];
  body: string;
}
