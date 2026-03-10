declare module "cronstrue" {
  export interface Options {
    throwExceptionOnParseError?: boolean;
    verbose?: boolean;
    dayOfWeekStartIndexZero?: boolean;
    use24HourTimeFormat?: boolean;
    locale?: string;
  }

  const cronstrue: {
    toString(expression: string, options?: Options): string;
  };

  export default cronstrue;
}
