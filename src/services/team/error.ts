export class TeamError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TeamError';
  }
}

export const withTeamErrorHandling = <T>(fn: (...args: any[]) => Promise<T>, defaultMsg: string, code: string) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof TeamError) throw error;
      throw new TeamError(defaultMsg, code);
    }
  };
}