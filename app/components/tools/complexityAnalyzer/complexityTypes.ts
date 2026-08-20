export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'c' | 'cpp';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type SortColumn = 'name' | 'cyclomatic' | 'cognitive' | 'risk';
export type SortDirection = 'asc' | 'desc';

export interface RefactorSuggestion {
  /** Plain-English recommendation, max 120 characters */
  text: string;
  /** Used to order suggestions — higher value appears first */
  scoreContribution: number;
}

export interface FunctionResult {
  name: string;
  startLine: number;
  endLine: number;
  cyclomatic: number;
  cognitive: number;
  riskLevel: RiskLevel;
  suggestions: RefactorSuggestion[];
}

export interface AnalysisResult {
  results: FunctionResult[];
  /** True when a syntax error caused analysis to stop early */
  partial: boolean;
  errorMessage?: string;
}
